#!/usr/bin/env python3
"""Check the migration plan's consumer citations against the commit it pins.

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

import os
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
PLAN = REPO / "docs/adoption/migration-plan.md"

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


def main() -> int:
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
    print("all consumer citations resolve")
    return 0


if __name__ == "__main__":
    sys.exit(main())
