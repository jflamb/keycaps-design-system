#!/usr/bin/env python3
"""Check the migration plan's consumer citations.

    pnpm verify:citations          plan against docs/adoption/citations.json
    pnpm verify:citations:refresh  regenerate that manifest from a real clone

## What this does and does not prove

`verify` proves the plan and the manifest agree. It does **not** prove the
manifest came from the consumer: this repository is public, `mcp-dnsimple` is
private, and a public workflow token cannot read across — a cross-repo PAT would
be missing on every fork pull request, so the gate would fail hardest for the
contributors least able to fix it.

So the manifest is a **maintainer-refreshed, human-reviewed snapshot**. The
`sha256`, `first`, and `last` fields are there for a reviewer reading the diff,
not for CI, which cannot check them. Anyone with commit access can write a
manifest that says anything; what CI catches is the plan and the manifest
drifting apart, which is the failure that actually keeps happening. Authenticated
provenance would need a signed attestation produced inside the private repository,
and that is not built.

Commit immutability is what makes the snapshot durable — a fixed commit's content
cannot change underneath it — but immutability is not authentication, and this
docstring says so because the previous three versions of this script each claimed
more than they checked.

## Scope

Every consumer citation in the Phase 3 material is written `mcp-dnsimple/…`, and
`refresh` enforces that: an unqualified path that resolves at the pinned commit
is an error telling you to qualify it. That is what lets `verify` — which has no
clone — apply a total rule instead of guessing. A scoped citation missing from
the manifest fails. Nothing unscoped is treated as this consumer's.

Occurrences are counted, not set-collapsed. The same range cited in two places is
two occurrences, and deleting one of them fails.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Iterator, NamedTuple

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "docs/adoption/migration-plan.md"
MANIFEST = REPO / "docs/adoption/citations.json"
CONSUMER = Path(
    os.environ.get("KEYCAPS_CONSUMER_REPO", str(REPO.parent / "mcp-dnsimple"))
).expanduser()

CITATION = re.compile(
    r"`(?P<scoped>mcp-dnsimple/)?"
    r"(?P<path>[\w./_-]+\.(?:ts|tsx|mjs|js|css|json|yml|html))"
    r"(?::(?P<start>\d+)(?:-(?P<end>\d+))?)?`"
    r"|`:(?P<bare_start>\d+)(?:-(?P<bare_end>\d+))?`"
)
EVIDENCE_PIN = re.compile(r"Evidence commit: `jflamb/mcp-dnsimple@(?P<ref>[0-9a-f]{7,40})`")
CLOSING = (")", "}", "]", ";", ">")


class Citation(NamedTuple):
    path: str
    scoped: bool
    start: int
    end: int
    ref: str

    @property
    def key(self) -> str:
        return f"{self.path}:{self.start}-{self.end}@{self.ref}"


def citations(plan: str, default_ref: str) -> Iterator[Citation]:
    """The one parser. Both modes read the plan through it, so they cannot
    diverge on scope or on which file a bare continuation belongs to — which they
    already did once, over exactly that."""
    path: str | None = None
    scoped = False
    ref: str | None = None

    for match in CITATION.finditer(plan):
        if match.group("path"):
            path, scoped, ref = match.group("path"), bool(match.group("scoped")), None

        raw_start = match.group("start") or match.group("bare_start")
        if raw_start is None or path is None:
            continue

        # A citation may name the pre-migration commit immediately after itself,
        # as ``at `0f84dc6```. Forward-only and short, so a sha mentioned earlier
        # in the paragraph is not applied here; then remembered for this file's
        # bare continuations.
        historic = re.match(r"\s+at `([0-9a-f]{7,40})`", plan[match.end() : match.end() + 24])
        if historic:
            ref = historic.group(1)

        start = int(raw_start)
        end = int(match.group("end") or match.group("bare_end") or raw_start)
        yield Citation(path, scoped, start, end, ref or default_ref)


def show(ref: str, path: str) -> str | None:
    """The file at `ref`, or None. Reads git, never the working tree."""
    result = subprocess.run(
        ["git", "-C", str(CONSUMER), "show", f"{ref}:{path}"],
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout if result.returncode == 0 else None


def evidence_ref(plan: str) -> str | None:
    pin = EVIDENCE_PIN.search(plan)
    return pin.group("ref") if pin else None


def refresh() -> int:
    plan = PLAN.read_text()
    pinned = evidence_ref(plan)
    if not pinned:
        print("the plan declares no evidence commit")
        return 1
    if not (CONSUMER / ".git").exists():
        print(f"no consumer repository at {CONSUMER}; set KEYCAPS_CONSUMER_REPO")
        return 1
    if show(pinned, "package.json") is None:
        print(f"{CONSUMER} does not contain the pinned commit {pinned}")
        return 1

    failures: list[str] = []
    snapshot: dict[str, dict[str, object]] = {}
    occurrences: Counter[str] = Counter()
    per_ref: Counter[str] = Counter()
    other_repos = 0

    for citation in citations(plan, pinned):
        content = show(citation.ref, citation.path)

        if not citation.scoped:
            if content is None:
                other_repos += 1
                continue
            if (REPO / citation.path).exists():
                failures.append(
                    f"{citation.path}:{citation.start} resolves in both repositories — "
                    "qualify it as `mcp-dnsimple/`"
                )
            else:
                # Resolves only in the consumer, so it *is* a consumer citation
                # written without its prefix. Qualifying it is what lets `verify`
                # apply a total rule rather than inferring scope it cannot see.
                failures.append(
                    f"{citation.path}:{citation.start} is a consumer citation without its "
                    "prefix — qualify it as `mcp-dnsimple/`"
                )
            continue

        if content is None:
            failures.append(f"{citation.path} does not exist at {citation.ref} ({citation.key})")
            continue

        lines = content.split("\n")
        if citation.end > len(lines):
            failures.append(
                f"{citation.key} runs past the file's {len(lines)} lines"
            )
            continue

        first, last = lines[citation.start - 1].strip(), lines[citation.end - 1].strip()
        if not first:
            failures.append(f"{citation.key} begins on a blank line")
        elif first.startswith(CLOSING):
            failures.append(f"{citation.key} begins part-way through a statement — {first[:56]}")

        if citation.path.startswith("tests/") and citation.start != citation.end:
            body = "\n".join(lines[citation.start - 1 : citation.end])
            if not re.match(r"(it|test)\(", first) and "for (const" not in first:
                failures.append(f"{citation.key} is not the start of a test — {first[:56]}")
            if last not in ("});", "}"):
                failures.append(f"{citation.key} does not end at a closing brace — {last[:56]}")
            if "expect(" not in body:
                failures.append(f"{citation.key} is cited as proof but asserts nothing")

        occurrences[citation.key] += 1
        per_ref[citation.ref] += 1
        snapshot[citation.key] = {
            "sha256": hashlib.sha256("\n".join(lines[citation.start - 1 : citation.end]).encode()).hexdigest(),
            "first": first,
            "last": last,
        }

    if failures:
        print("\n".join(f"  ✗ {failure}" for failure in failures))
        return 1

    for key in snapshot:
        snapshot[key]["occurrences"] = occurrences[key]

    MANIFEST.write_text(
        json.dumps(
            {
                "_comment": (
                    "A maintainer-refreshed snapshot, not an authenticated one. CI checks that "
                    "the plan and this file agree; it cannot check that this file came from the "
                    "consumer, because that repository is private and this one is public. Review "
                    "the diff. Regenerate with `pnpm verify:citations:refresh`."
                ),
                "evidence": pinned,
                "citations": snapshot,
            },
            indent=2,
            sort_keys=True,
        )
        + "\n"
    )
    unique_per_ref: Counter[str] = Counter(key.rsplit("@", 1)[1] for key in snapshot)
    print(f"{sum(occurrences.values())} occurrences of {len(snapshot)} unique ranges")
    for ref, count in sorted(per_ref.items()):
        label = "evidence commit" if ref == pinned else "pre-migration commit"
        print(f"  {count} occurrences of {unique_per_ref[ref]} unique ranges at {ref} ({label})")
    print(f"  {other_repos} ranges belong to the plan's four other consumer repositories")
    print(f"wrote {MANIFEST.relative_to(REPO)}")
    return 0


def verify() -> int:
    if not MANIFEST.exists():
        print(f"{MANIFEST.relative_to(REPO)} is missing — run `pnpm verify:citations:refresh`")
        return 1

    plan = PLAN.read_text()
    manifest = json.loads(MANIFEST.read_text())
    recorded = manifest["citations"]

    pinned = evidence_ref(plan)
    if not pinned:
        print("the plan declares no evidence commit")
        return 1
    if pinned != manifest["evidence"]:
        print(
            f"the plan pins {pinned}, the manifest was built at {manifest['evidence']} — "
            "run `pnpm verify:citations:refresh`"
        )
        return 1

    # Total rule: a scoped citation is this consumer's and must be recorded. It
    # does not matter whether its path already appears in the manifest, which is
    # how a newly cited file used to slip through unnoticed.
    cited: Counter[str] = Counter()
    per_ref: Counter[str] = Counter()
    for citation in citations(plan, pinned):
        if not citation.scoped:
            continue
        cited[citation.key] += 1
        per_ref[citation.ref] += 1

    failures = [f"{key} is cited but not in the manifest" for key in sorted(set(cited) - set(recorded))]
    failures += [f"{key} is in the manifest but no longer cited" for key in sorted(set(recorded) - set(cited))]
    failures += [
        f"{key} is cited {cited[key]} times, the manifest records {recorded[key].get('occurrences')}"
        for key in sorted(set(cited) & set(recorded))
        if cited[key] != recorded[key].get("occurrences")
    ]

    if failures:
        print("\n".join(f"  ✗ {failure}" for failure in failures))
        print("run `pnpm verify:citations:refresh`")
        return 1

    unique_per_ref: Counter[str] = Counter(key.rsplit("@", 1)[1] for key in cited)
    print(f"{sum(cited.values())} occurrences of {len(cited)} unique ranges match the manifest")
    for ref, count in sorted(per_ref.items()):
        label = "evidence commit" if ref == manifest["evidence"] else "pre-migration commit"
        print(f"  {count} occurrences of {unique_per_ref[ref]} unique ranges at {ref} ({label})")
    print("the ranges were checked against the consumer when the manifest was refreshed,")
    print("not here — this proves plan/manifest agreement, not provenance")
    return 0


def main() -> int:
    return refresh() if "--refresh" in sys.argv else verify()


if __name__ == "__main__":
    sys.exit(main())
