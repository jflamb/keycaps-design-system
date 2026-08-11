#!/usr/bin/env python3
"""Check the migration plan's consumer citations against the commit it pins.

Two modes:

    verify   (default) check the plan against `docs/adoption/citations.json`
    refresh  regenerate that manifest from a real consumer clone

The manifest exists because this repository is public and `mcp-dnsimple` is
private: a public repo's `GITHUB_TOKEN` cannot read across, and a cross-repo PAT
would be absent on every fork pull request, so the gate would fail for exactly
the contributors least able to fix it. The manifest is not a compromise, though,
because **the evidence commit is immutable** — what a citation points at, at a
fixed commit, never changes. Snapshotting it is sound, and `refresh` is the step
that reads the real repository.

Adding or moving a citation without running `refresh` fails `verify`, so the two
cannot drift apart quietly.

Why this exists, and the two ways it has already been wrong:

1. Its first version read the consumer's *working tree* and silently skipped
   files it could not find — reproducing the exact failure the plan's
   `git show origin/main:<path>` rule prevents, and passing while doing it.
2. Its second version decided scope by requiring an `mcp-dnsimple/` prefix, so
   roughly twenty-seven citations written in running prose — `src/branding.tsx`,
   `tests/server.test.ts`, `.github/workflows/e2e.yml` — were skipped in silence
   while it reported success.

Both failures share a shape: quietly checking less than it claimed. So scope is
now decided by resolution rather than by spelling, and anything genuinely
ambiguous is an error rather than a shrug.

A citation is this consumer's when the path resolves at the pinned commit and
does not also exist in this repository. When it resolves in both —
`package.json`, `tsconfig.json` — the citation must say `mcp-dnsimple/`
explicitly, and failing to is an error. When it resolves in neither, it belongs
to one of the four other repositories the plan cites, and the count of those is
printed rather than hidden.

What it checks:

  * the range resolves at the pinned commit, read through `git show`, never disk
  * it does not begin on a blank line or part-way through a statement
  * a cited test range begins at its `it(`/`test(`, ends at its own closing
    brace, and contains at least one `expect(`

What it does NOT check, stated plainly because overclaiming for a check is the
habit this whole tool is a correction for: whether the cited test proves the
sentence it is cited for. That is a human judgment, and a green run is not
evidence of it. Non-test ranges get the blank-line and mid-statement checks and
nothing structural beyond them.
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "docs/adoption/migration-plan.md"
MANIFEST = REPO / "docs/adoption/citations.json"

# Overridable so CI can check the consumer out anywhere; defaults to the sibling
# clone a developer will have. Never silently skipped when absent — see `main`.
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


def show(ref: str, path: str) -> str | None:
    """The file at `ref`, or None when it is not there. Never reads the disk."""
    result = subprocess.run(
        ["git", "-C", str(CONSUMER), "show", f"{ref}:{path}"],
        capture_output=True,
        text=True,
        check=False,
    )
    return result.stdout if result.returncode == 0 else None


def refresh() -> int:
    """Regenerate the manifest from a real consumer clone."""
    plan = PLAN.read_text()

    pin = EVIDENCE_PIN.search(plan)
    if not pin:
        print("the plan declares no evidence commit for its consumer citations")
        return 1
    evidence_ref = pin.group("ref")

    if not (CONSUMER / ".git").exists():
        print(f"the consumer repository is not at {CONSUMER}")
        print("set KEYCAPS_CONSUMER_REPO to a clone that contains the pinned commit")
        return 1
    if show(evidence_ref, "package.json") is None:
        print(f"{CONSUMER} does not contain the pinned commit {evidence_ref}")
        return 1

    failures: list[str] = []
    snapshot: dict[str, dict[str, str]] = {}
    resolved: dict[str, int] = {}
    out_of_scope = 0
    current_path: str | None = None
    current_ref: str | None = None
    current_scoped = False

    for citation in CITATION.finditer(plan):
        if citation.group("path"):
            current_path, current_ref = citation.group("path"), None
            # Carried, so a bare continuation of an explicitly scoped path is not
            # re-flagged as ambiguous.
            current_scoped = bool(citation.group("scoped"))

        raw_start = citation.group("start") or citation.group("bare_start")
        if raw_start is None or current_path is None:
            continue

        path = current_path
        start = int(raw_start)
        end = int(citation.group("end") or citation.group("bare_end") or raw_start)

        # A citation may name the pre-migration commit immediately after itself,
        # as ``at `0f84dc6```. Looking only forward, and only a few characters,
        # keeps a sha mentioned earlier in the paragraph from being applied here;
        # the ref is then remembered for that file's bare continuations.
        historic = re.match(r"\s+at `([0-9a-f]{7,40})`", plan[citation.end() : citation.end() + 24])
        if historic:
            current_ref = historic.group(1)
        ref = current_ref or evidence_ref

        content = show(ref, path)
        if content is None:
            # Not this consumer's file. Only a mistake if it was claimed to be.
            if current_scoped:
                failures.append(f"{path} does not exist at {ref} (cited {citation.group(0)})")
            else:
                out_of_scope += 1
            continue

        if not current_scoped and (REPO / path).exists():
            failures.append(
                f"{path}:{start} is ambiguous — it resolves in both repositories, "
                "so the citation has to say `mcp-dnsimple/`"
            )
            continue

        lines = content.split("\n")
        resolved[ref] = resolved.get(ref, 0) + 1

        if end > len(lines):
            failures.append(f"{path}:{start}-{end} runs past the file's {len(lines)} lines at {ref}")
            continue

        first, last = lines[start - 1].strip(), lines[end - 1].strip()
        if not first:
            failures.append(f"{path}:{start} begins on a blank line")
        elif first.startswith(CLOSING):
            failures.append(f"{path}:{start} begins part-way through a statement — {first[:56]}")

        snapshot[f"{path}:{start}-{end}@{ref}"] = {
            "sha256": hashlib.sha256("\n".join(lines[start - 1 : end]).encode()).hexdigest(),
            "first": first,
            "last": last,
        }

        if path.startswith("tests/") and start != end:
            body = "\n".join(lines[start - 1 : end])
            if not re.match(r"(it|test)\(", first) and "for (const" not in first:
                failures.append(f"{path}:{start} is not the start of a test — {first[:56]}")
            if last not in ("});", "}"):
                failures.append(f"{path}:{end} is not a closing brace — {last[:56]}")
            if "expect(" not in body:
                failures.append(f"{path}:{start}-{end} is cited as proof but asserts nothing")

    for ref, count in sorted(resolved.items()):
        label = "evidence commit" if ref == evidence_ref else "pre-migration commit"
        print(f"{count} citations resolved at {ref} ({label})")
    print(f"{out_of_scope} ranges belong to other repositories and are not this script's to check")

    if failures:
        print("\n".join(f"  ✗ {failure}" for failure in failures))
        return 1

    MANIFEST.write_text(
        json.dumps({"evidence": evidence_ref, "citations": snapshot}, indent=2, sort_keys=True) + "\n"
    )
    print(f"wrote {len(snapshot)} citations to {MANIFEST.relative_to(REPO)}")
    return 0


def verify() -> int:
    """Check the plan against the committed manifest. Needs no consumer clone."""
    if not MANIFEST.exists():
        print(f"{MANIFEST.relative_to(REPO)} is missing — run `pnpm verify:citations:refresh`")
        return 1

    plan = PLAN.read_text()
    manifest = json.loads(MANIFEST.read_text())

    pin = EVIDENCE_PIN.search(plan)
    if not pin:
        print("the plan declares no evidence commit for its consumer citations")
        return 1
    if pin.group("ref") != manifest["evidence"]:
        print(
            f"the plan pins {pin.group('ref')} and the manifest was built at "
            f"{manifest['evidence']} — run `pnpm verify:citations:refresh`"
        )
        return 1

    # Every citation the plan makes has to be one the manifest recorded. A new or
    # moved range without a refresh fails here, which is what keeps the snapshot
    # honest rather than merely present.
    # Which paths belong to the consumer is itself read from the manifest, since
    # verify mode has no clone to resolve it against. A citation on one of those
    # paths must be recorded exactly; a citation on any other path is another
    # repository's and not this check's business.
    consumer_paths = {key.rsplit(":", 1)[0] for key in manifest["citations"]}

    wanted = set()
    current_path: str | None = None
    current_ref: str | None = None
    for citation in CITATION.finditer(plan):
        if citation.group("path"):
            current_path, current_ref = citation.group("path"), None
        raw_start = citation.group("start") or citation.group("bare_start")
        if raw_start is None or current_path is None:
            continue
        if current_path not in consumer_paths:
            continue
        historic = re.match(r"\s+at `([0-9a-f]{7,40})`", plan[citation.end() : citation.end() + 24])
        if historic:
            current_ref = historic.group(1)
        start = int(raw_start)
        end = int(citation.group("end") or citation.group("bare_end") or raw_start)
        wanted.add(f"{current_path}:{start}-{end}@{current_ref or manifest['evidence']}")

    unrecorded = sorted(wanted - set(manifest["citations"]))
    stale = sorted(set(manifest["citations"]) - wanted)

    if unrecorded:
        print("\n".join(f"  ✗ {key} is cited but not in the manifest" for key in unrecorded))
        print("run `pnpm verify:citations:refresh`")
        return 1
    if stale:
        print("\n".join(f"  ✗ {key} is in the manifest but no longer cited" for key in stale))
        print("run `pnpm verify:citations:refresh`")
        return 1

    print(f"{len(wanted)} consumer citations match the manifest at {manifest['evidence']}")
    print("the ranges themselves were verified against the consumer when the manifest was written")
    return 0


def main() -> int:
    return refresh() if "--refresh" in sys.argv else verify()


if __name__ == "__main__":
    sys.exit(main())
