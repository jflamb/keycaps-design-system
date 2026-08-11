#!/usr/bin/env python3
"""Regression tests for the migration-plan citation gate."""

from __future__ import annotations

import importlib.util
import io
import json
import tempfile
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch


SCRIPT = Path(__file__).with_name("verify-plan-citations.py")
SPEC = importlib.util.spec_from_file_location("verify_plan_citations", SCRIPT)
assert SPEC and SPEC.loader
checker = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(checker)

PIN = "abcdef1"
HISTORIC = "0123456"


def plan_with(phase_citation: str, correction: str = "") -> str:
    return f"""# Plan

Evidence commit: `jflamb/mcp-dnsimple@{PIN}`

## Phase 3 — `mcp-dnsimple` (Mode 1)

{phase_citation}

## Phase 4 — `mcp-unifi` (Mode 1)

34. **`mcp-dnsimple` correction.** {correction}
"""


class CitationGateTest(unittest.TestCase):
    def run_verify(self, plan: str, citations: dict[str, dict[str, object]]) -> tuple[int, str]:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            plan_path = root / "migration-plan.md"
            manifest_path = root / "citations.json"
            plan_path.write_text(plan)
            manifest_path.write_text(
                json.dumps({"evidence": PIN, "citations": citations}) + "\n"
            )
            output = io.StringIO()
            with (
                patch.object(checker, "REPO", root),
                patch.object(checker, "PLAN", plan_path),
                patch.object(checker, "MANIFEST", manifest_path),
                redirect_stdout(output),
            ):
                result = checker.verify()
            return result, output.getvalue()

    def test_unqualified_phase_3_citation_fails(self) -> None:
        result, output = self.run_verify(plan_with("`src/client.ts:1`"), {})
        self.assertEqual(result, 1)
        self.assertIn("is unqualified", output)

    def test_unqualified_correction_citation_fails(self) -> None:
        result, output = self.run_verify(
            plan_with("", "`src/client.ts:1`"), {}
        )
        self.assertEqual(result, 1)
        self.assertIn("corrections 34–37 citation", output)

    def test_scoped_unrecorded_citation_fails(self) -> None:
        result, output = self.run_verify(
            plan_with("`mcp-dnsimple/src/client.ts:1`"), {}
        )
        self.assertEqual(result, 1)
        self.assertIn("is cited but not in the manifest", output)

    def test_occurrence_removal_fails(self) -> None:
        key = f"src/client.ts:1-1@{PIN}"
        result, output = self.run_verify(
            plan_with("`mcp-dnsimple/src/client.ts:1`"),
            {key: {"occurrences": 2}},
        )
        self.assertEqual(result, 1)
        self.assertIn("is cited 1 times, the manifest records 2", output)

    def test_incidental_filename_does_not_retarget_bare_continuation(self) -> None:
        parsed = list(
            checker.citations(
                "`mcp-dnsimple/tests/e2e/home.spec.ts:39-52` "
                "from `static.css` (`:62-101`)",
                PIN,
            )
        )
        self.assertEqual(
            parsed[-1],
            checker.Citation("tests/e2e/home.spec.ts", True, 62, 101, PIN),
        )

    def test_historic_ref_carries_to_bare_continuation(self) -> None:
        parsed = list(
            checker.citations(
                f"`mcp-dnsimple/src/client.ts:1` at `{HISTORIC}`, then `:2`",
                PIN,
            )
        )
        self.assertEqual([citation.ref for citation in parsed], [HISTORIC, HISTORIC])

    def test_refresh_rejects_reversed_range(self) -> None:
        plan = plan_with("`mcp-dnsimple/src/client.ts:1-0`")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            consumer = root / "consumer"
            (consumer / ".git").mkdir(parents=True)
            plan_path = root / "migration-plan.md"
            manifest_path = root / "citations.json"
            plan_path.write_text(plan)

            def fake_show(ref: str, path: str) -> str | None:
                if ref == PIN and path == "package.json":
                    return "{}\n"
                if ref == PIN and path == "src/client.ts":
                    return "first\nsecond\n"
                return None

            output = io.StringIO()
            with (
                patch.object(checker, "REPO", root),
                patch.object(checker, "PLAN", plan_path),
                patch.object(checker, "MANIFEST", manifest_path),
                patch.object(checker, "CONSUMER", consumer),
                patch.object(checker, "show", fake_show),
                redirect_stdout(output),
            ):
                result = checker.refresh()

            self.assertEqual(result, 1)
            self.assertIn("is not within the file's", output.getvalue())
            self.assertFalse(manifest_path.exists())


if __name__ == "__main__":
    unittest.main()
