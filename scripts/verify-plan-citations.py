#!/usr/bin/env python3
"""Check the migration plan's pinned consumer citations.

    pnpm verify:citations          plan against docs/adoption/citations.json
    pnpm verify:citations:refresh  regenerate that manifest from real clones

## What this proves

`verify` proves that every scoped citation in the plan agrees with the committed
manifest. It does not authenticate that the manifest came from either private
consumer: public fork CI cannot read those repositories, and adding a cross-repo
PAT would make the gate fail hardest for contributors who cannot fix it.

`refresh` is the maintainer operation. It reads each pinned commit with
`git show`, rejects missing files and invalid ranges, and records a reviewable
hash plus the first and last lines. Commit immutability makes that snapshot
durable; it does not authenticate who produced it.

## Scope

Phase 3 and corrections 34-37 own `mcp-dnsimple`; Phase 4 and corrections 38-41
own `mcp-unifi`. Ranged consumer citations in those sections must carry their
repo prefix. Occurrences are counted rather than set-collapsed, so deleting one
of two uses of the same range fails.
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

CONSUMERS = {
    "mcp-dnsimple": Path(
        os.environ.get(
            "KEYCAPS_MCP_DNSIMPLE_REPO",
            os.environ.get("KEYCAPS_CONSUMER_REPO", str(REPO.parent / "mcp-dnsimple")),
        )
    ).expanduser(),
    "mcp-unifi": Path(
        os.environ.get("KEYCAPS_MCP_UNIFI_REPO", str(REPO.parent / "mcp-unifi"))
    ).expanduser(),
}

CONSUMER_NAME = r"mcp-dnsimple|mcp-unifi"
CITATION = re.compile(
    rf"`(?:(?P<repo>{CONSUMER_NAME})/)?"
    r"(?P<path>[\w./_-]+\.(?:ts|tsx|mjs|js|css|json|yml|html))"
    r"(?::(?P<start>\d+)(?:-(?P<end>\d+))?)?`"
    r"|`:(?P<bare_start>\d+)(?:-(?P<bare_end>\d+))?`"
)
EVIDENCE_PIN = re.compile(
    rf"Evidence commit: `jflamb/(?P<repo>{CONSUMER_NAME})@(?P<ref>[0-9a-f]{{7,40}})`"
)
CLOSING = (")", "}", "]", ";", ">")


class Citation(NamedTuple):
    repo: str | None
    path: str
    scoped: bool
    start: int
    end: int
    ref: str | None

    @property
    def key(self) -> str:
        if self.repo is None or self.ref is None:
            raise ValueError("an unscoped citation has no manifest key")
        return f"{self.repo}/{self.path}:{self.start}-{self.end}@{self.ref}"


def evidence_refs(plan: str) -> dict[str, str]:
    return {match.group("repo"): match.group("ref") for match in EVIDENCE_PIN.finditer(plan)}


def citations(
    plan: str,
    pins: dict[str, str],
    *,
    default_repo: str | None = None,
) -> Iterator[Citation]:
    """The one parser used by both refresh and verify.

    A bare range such as `:53` inherits the last path, repository, and historic
    ref. An unscoped non-ranged span such as `static.css` is prose and does not
    retarget a later bare range.
    """

    path: str | None = None
    repo: str | None = default_repo
    scoped = False
    ref: str | None = None

    for match in CITATION.finditer(plan):
        if match.group("path"):
            candidate_repo = match.group("repo")
            candidate_scoped = candidate_repo is not None
            if match.group("start") is not None or candidate_scoped:
                path = match.group("path")
                repo = candidate_repo or default_repo
                scoped = candidate_scoped
                ref = None

        raw_start = match.group("start") or match.group("bare_start")
        if raw_start is None or path is None:
            continue

        historic = re.match(r"\s+at `([0-9a-f]{7,40})`", plan[match.end() : match.end() + 24])
        if historic:
            ref = historic.group(1)

        start = int(raw_start)
        end = int(match.group("end") or match.group("bare_end") or raw_start)
        yield Citation(repo, path, scoped, start, end, ref or pins.get(repo or ""))


def section(plan: str, start_marker: str, end_marker: str | None) -> str:
    start = plan.find(start_marker)
    end = len(plan) if end_marker is None else plan.find(end_marker, start + 1)
    if start < 0 or end < 0:
        raise ValueError(f"the plan is missing section boundary {start_marker!r}")
    return plan[start:end]


def consumer_sections(plan: str) -> Iterator[tuple[str, str, str]]:
    yield (
        "mcp-dnsimple",
        "Phase 3",
        section(plan, "## Phase 3 — `mcp-dnsimple`", "\n## Phase 4 —"),
    )
    yield (
        "mcp-unifi",
        "Phase 4",
        section(plan, "## Phase 4 — `mcp-unifi`", "\n## Phase 5 —"),
    )
    yield (
        "mcp-dnsimple",
        "corrections 34-37",
        section(plan, "\n34. **`mcp-dnsimple`", "\n38. **"),
    )
    yield (
        "mcp-unifi",
        "corrections 38-41",
        section(plan, "\n38. **", None),
    )


def unqualified_consumer_citations(
    plan: str, pins: dict[str, str]
) -> list[tuple[str, str, Citation]]:
    return [
        (repo, section_name, citation)
        for repo, section_name, material in consumer_sections(plan)
        for citation in citations(material, pins, default_repo=repo)
        if not citation.scoped
    ]


def show(repo: str, ref: str, path: str) -> str | None:
    """The file at `ref`, read from git rather than a working tree."""

    result = subprocess.run(
        ["git", "-C", str(CONSUMERS[repo]), "show", f"{ref}:{path}"],
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout if result.returncode == 0 else None


def validate_configuration(plan: str) -> tuple[dict[str, str], list[str]]:
    pins = evidence_refs(plan)
    failures: list[str] = []
    for repo, checkout in CONSUMERS.items():
        if repo not in pins:
            failures.append(f"the plan declares no evidence commit for {repo}")
        elif not (checkout / ".git").exists():
            failures.append(f"no {repo} repository at {checkout}; set KEYCAPS_{repo.upper().replace('-', '_')}_REPO")
        elif show(repo, pins[repo], "package.json") is None:
            failures.append(f"{checkout} does not contain pinned commit {pins[repo]} for {repo}")
    return pins, failures


def refresh() -> int:
    plan = PLAN.read_text()
    pins, failures = validate_configuration(plan)
    if failures:
        print("\n".join(f"  ✗ {failure}" for failure in failures))
        return 1

    snapshot: dict[str, dict[str, object]] = {}
    occurrences: Counter[str] = Counter()
    per_target: Counter[tuple[str, str]] = Counter()

    for repo, section_name, citation in unqualified_consumer_citations(plan, pins):
        failures.append(
            f"{section_name} citation {citation.path}:{citation.start}-{citation.end} "
            f"is unqualified — write the full `{repo}/…` path"
        )

    for citation in citations(plan, pins):
        if not citation.scoped:
            continue
        if citation.repo is None or citation.ref is None:
            failures.append(f"scoped citation {citation.path}:{citation.start} has no repo or ref")
            continue

        content = show(citation.repo, citation.ref, citation.path)
        if content is None:
            failures.append(
                f"{citation.repo}/{citation.path} does not exist at {citation.ref} ({citation.key})"
            )
            continue

        lines = content.split("\n")
        if not 1 <= citation.start <= citation.end <= len(lines):
            failures.append(f"{citation.key} is not within the file's 1-{len(lines)} line range")
            continue

        first = lines[citation.start - 1].strip()
        last = lines[citation.end - 1].strip()
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
        per_target[(citation.repo, citation.ref)] += 1
        snapshot[citation.key] = {
            "sha256": hashlib.sha256(
                "\n".join(lines[citation.start - 1 : citation.end]).encode()
            ).hexdigest(),
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
                    "A maintainer-refreshed snapshot, not an authenticated one. CI checks "
                    "plan/manifest agreement; it cannot read the private consumers. Review "
                    "the diff. Regenerate with `pnpm verify:citations:refresh`."
                ),
                "evidence": pins,
                "citations": snapshot,
            },
            indent=2,
            sort_keys=True,
        )
        + "\n"
    )

    print(f"{sum(occurrences.values())} occurrences of {len(snapshot)} unique ranges")
    for (repo, ref), count in sorted(per_target.items()):
        label = "evidence commit" if pins[repo] == ref else "pre-migration commit"
        unique = sum(key.startswith(f"{repo}/") and key.endswith(f"@{ref}") for key in snapshot)
        print(f"  {count} occurrences of {unique} unique ranges at {repo}@{ref} ({label})")
    print(f"wrote {MANIFEST.relative_to(REPO)}")
    return 0


def verify() -> int:
    if not MANIFEST.exists():
        print(f"{MANIFEST.relative_to(REPO)} is missing — run `pnpm verify:citations:refresh`")
        return 1

    plan = PLAN.read_text()
    pins = evidence_refs(plan)
    manifest = json.loads(MANIFEST.read_text())
    recorded = manifest["citations"]
    failures: list[str] = []

    if pins != manifest.get("evidence"):
        failures.append(
            f"the plan pins {pins}, the manifest records {manifest.get('evidence')}"
        )

    cited: Counter[str] = Counter()
    per_target: Counter[tuple[str, str]] = Counter()
    for citation in citations(plan, pins):
        if not citation.scoped or citation.repo is None or citation.ref is None:
            continue
        cited[citation.key] += 1
        per_target[(citation.repo, citation.ref)] += 1

    for repo, section_name, citation in unqualified_consumer_citations(plan, pins):
        failures.append(
            f"{section_name} citation {citation.path}:{citation.start}-{citation.end} "
            f"is unqualified — write the full `{repo}/…` path"
        )

    failures += [f"{key} is cited but not in the manifest" for key in sorted(set(cited) - set(recorded))]
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

    print(f"{sum(cited.values())} occurrences of {len(cited)} unique ranges match the manifest")
    for (repo, ref), count in sorted(per_target.items()):
        label = "evidence commit" if pins.get(repo) == ref else "pre-migration commit"
        unique = sum(key.startswith(f"{repo}/") and key.endswith(f"@{ref}") for key in cited)
        print(f"  {count} occurrences of {unique} unique ranges at {repo}@{ref} ({label})")
    print("the ranges were checked against each consumer when the manifest was refreshed,")
    print("not here — this proves plan/manifest agreement, not provenance")
    return 0


def main() -> int:
    return refresh() if "--refresh" in sys.argv else verify()


if __name__ == "__main__":
    sys.exit(main())
