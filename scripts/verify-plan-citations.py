#!/usr/bin/env python3
"""Check the migration plan's consumer citations against the commit it pins.

Why this exists, and why its first version was worse than useless: the plan's own
rule is to measure a consumer with `git show origin/main:<path>` and never from a
working tree — Phase 4's inputs record line counts that were 25% and 17% wrong
because someone read an untracked directory. The first version of this script
read `~/Repos/jflamb/mcp-dnsimple` off disk and silently skipped files it could
not find, so it reproduced exactly the failure it was written to prevent, and
passed while doing it.

It now reads every file through `git show <ref>:<path>` against the ref the plan
declares, and a missing file is a failure rather than a shrug.

What it checks:

  * the range is inside the file, at the pinned ref
  * it does not begin on a blank line
  * a cited test range begins at its `it(`/`test(` and ends at its own closing
    brace, and contains at least one `expect(`

What it does NOT check, stated plainly because overclaiming is the habit this
whole tool is a correction for: whether the cited test actually proves the
sentence it is cited for. That is a human judgment, and a green run here is not
evidence of it.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path

PLAN = Path(__file__).resolve().parent.parent / "docs/adoption/migration-plan.md"
CONSUMER = Path("~/Repos/jflamb/mcp-dnsimple").expanduser()

# `path:start-end` or a bare `:start-end` that continues the previously named
# file. The bare form is what the earlier version ignored entirely.
# Only `mcp-dnsimple`-scoped citations, and the bare `:start-end` continuations
# that follow one. The plan cites four other repositories and Keycaps' own files
# in the same prose; resolving those against this consumer would be nonsense, and
# an earlier version's habit of silently skipping what it could not find is
# exactly what let a whole class of bad citation through.
CITATION = re.compile(
    r"`(?P<scoped>mcp-dnsimple/)?"
    r"(?P<path>[\w./_-]+\.(?:ts|tsx|mjs|css|json|yml|html))"
    r"(?::(?P<start>\d+)(?:-(?P<end>\d+))?)?`"
    r"|`:(?P<bare_start>\d+)(?:-(?P<bare_end>\d+))?`"
)
EVIDENCE_PIN = re.compile(r"Evidence commit: `jflamb/mcp-dnsimple@(?P<ref>[0-9a-f]{7,40})`")
HISTORIC_REF = re.compile(r"`(?P<ref>[0-9a-f]{7})`")


def file_at(ref: str, path: str) -> list[str]:
    """The file's lines at `ref`. Raises if it is not there — never the disk."""
    return subprocess.run(
        ["git", "-C", str(CONSUMER), "show", f"{ref}:{path}"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout.split("\n")


def main() -> int:
    plan = PLAN.read_text()

    pin = EVIDENCE_PIN.search(plan)
    if not pin:
        print("the plan declares no evidence commit for its consumer citations")
        return 1
    evidence_ref = pin.group("ref")

    failures: list[str] = []
    checked = 0
    current_path: str | None = None
    current_ref: str | None = None

    for citation in CITATION.finditer(plan):
        if citation.group("path"):
            # A newly named file is in scope only when it is this consumer's —
            # and it sets the scope whether or not it carries a range, so a bare
            # continuation after ``…/verify-container.mjs` (206 lines)`` is
            # attributed to that file rather than to whatever was named before.
            current_path = citation.group("path") if citation.group("scoped") else None
            current_ref = None

        raw_start = citation.group("start") or citation.group("bare_start")
        if raw_start is None:
            continue
        path = current_path
        if path is None:
            continue

        start = int(raw_start)
        end = int(citation.group("end") or citation.group("bare_end") or raw_start)

        # A few citations deliberately point at the pre-migration commit. They
        # say so immediately after themselves, as ``at `0f84dc6```. Looking only
        # forward, and only a few characters, is what keeps a sha mentioned
        # earlier in the same paragraph from being applied to a later citation.
        trailer = plan[citation.end() : citation.end() + 24]
        historic = re.match(r"\s+at `([0-9a-f]{7,40})`", trailer)
        if historic:
            # Remembered, so the bare continuations that follow — ``rendered at
            # `:1011-1013``` — are read at the same commit rather than falling
            # back to the evidence pin, where the file does not exist.
            current_ref = historic.group(1)
        ref = current_ref or evidence_ref

        try:
            lines = file_at(ref, path)
        except subprocess.CalledProcessError:
            failures.append(f"{path} does not exist at {ref} (cited {citation.group(0)})")
            continue

        checked += 1
        if end > len(lines):
            failures.append(f"{path}:{start}-{end} runs past the file's {len(lines)} lines at {ref}")
            continue

        first, last = lines[start - 1].strip(), lines[end - 1].strip()
        if not first:
            failures.append(f"{path}:{start} begins on a blank line")
        if path.startswith("tests/") and start != end:
            body = "\n".join(lines[start - 1 : end])
            if not re.match(r"(it|test)\(", first) and "for (const" not in first:
                failures.append(f"{path}:{start} is not the start of a test — {first[:56]}")
            if last not in ("});", "}"):
                failures.append(f"{path}:{end} is not a closing brace — {last[:56]}")
            if "expect(" not in body:
                failures.append(f"{path}:{start}-{end} is cited as proof but asserts nothing")

    print(f"evidence commit: {evidence_ref}")
    print(f"{checked} citations resolved against it")
    if failures:
        print("\n".join(f"  ✗ {failure}" for failure in failures))
        return 1
    print("all citations resolve")
    return 0


if __name__ == "__main__":
    sys.exit(main())
