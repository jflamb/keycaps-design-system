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

DNSIMPLE_PIN = "abcdef1"
UNIFI_PIN = "bcdefa2"
HISTORIC = "0123456"


def plan_with(
    phase_3_citation: str = "",
    correction_34: str = "",
    phase_4_citation: str = "",
    correction_38: str = "",
) -> str:
    return f"""# Plan

Evidence commit: `jflamb/mcp-dnsimple@{DNSIMPLE_PIN}`
Evidence commit: `jflamb/mcp-unifi@{UNIFI_PIN}`

## Phase 3 — `mcp-dnsimple` (Mode 1)

{phase_3_citation}

## Phase 4 — `mcp-unifi` (Mode 1)

{phase_4_citation}

## Phase 5 — `assistant-workbench` (Mode 2)

## Corrections to the survey

34. **`mcp-dnsimple` correction.** {correction_34}

38. **Phase 4 correction.** {correction_38}
"""


class CitationGateTest(unittest.TestCase):
    def run_verify(self, plan: str, citations: dict[str, dict[str, object]]) -> tuple[int, str]:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            plan_path = root / "migration-plan.md"
            manifest_path = root / "citations.json"
            plan_path.write_text(plan)
            manifest_path.write_text(
                json.dumps(
                    {
                        "evidence": {
                            "mcp-dnsimple": DNSIMPLE_PIN,
                            "mcp-unifi": UNIFI_PIN,
                        },
                        "citations": citations,
                    }
                )
                + "\n"
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
            plan_with(correction_34="`src/client.ts:1`"), {}
        )
        self.assertEqual(result, 1)
        self.assertIn("corrections 34-37 citation", output)

    def test_unqualified_phase_4_citation_fails(self) -> None:
        result, output = self.run_verify(
            plan_with(phase_4_citation="`site/styles.css:1`"), {}
        )
        self.assertEqual(result, 1)
        self.assertIn("write the full `mcp-unifi/…` path", output)

    def test_unqualified_phase_4_correction_citation_fails(self) -> None:
        result, output = self.run_verify(
            plan_with(correction_38="`site/styles.css:1`"), {}
        )
        self.assertEqual(result, 1)
        self.assertIn("corrections 38-41 citation", output)

    def test_scoped_mcp_unifi_citation_uses_its_own_evidence_pin(self) -> None:
        parsed = list(
            checker.citations(
                "`mcp-unifi/src/site-page.tsx:94-130`",
                {"mcp-dnsimple": DNSIMPLE_PIN, "mcp-unifi": UNIFI_PIN},
            )
        )
        self.assertEqual(
            parsed,
            [
                checker.Citation(
                    "mcp-unifi",
                    "src/site-page.tsx",
                    True,
                    94,
                    130,
                    UNIFI_PIN,
                )
            ],
        )

    def test_scoped_mcp_unifi_manifest_entry_passes(self) -> None:
        key = f"mcp-unifi/src/site-page.tsx:94-130@{UNIFI_PIN}"
        result, output = self.run_verify(
            plan_with(phase_4_citation="`mcp-unifi/src/site-page.tsx:94-130`"),
            {key: {"occurrences": 1}},
        )
        self.assertEqual(result, 0, output)

    def test_scoped_unrecorded_citation_fails(self) -> None:
        result, output = self.run_verify(
            plan_with("`mcp-dnsimple/src/client.ts:1`"), {}
        )
        self.assertEqual(result, 1)
        self.assertIn("is cited but not in the manifest", output)

    def test_occurrence_removal_fails(self) -> None:
        key = f"mcp-dnsimple/src/client.ts:1-1@{DNSIMPLE_PIN}"
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
                {"mcp-dnsimple": DNSIMPLE_PIN, "mcp-unifi": UNIFI_PIN},
            )
        )
        self.assertEqual(
            parsed[-1],
            checker.Citation(
                "mcp-dnsimple",
                "tests/e2e/home.spec.ts",
                True,
                62,
                101,
                DNSIMPLE_PIN,
            ),
        )

    def test_historic_ref_carries_to_bare_continuation(self) -> None:
        parsed = list(
            checker.citations(
                f"`mcp-dnsimple/src/client.ts:1` at `{HISTORIC}`, then `:2`",
                {"mcp-dnsimple": DNSIMPLE_PIN, "mcp-unifi": UNIFI_PIN},
            )
        )
        self.assertEqual([citation.ref for citation in parsed], [HISTORIC, HISTORIC])

    def test_refresh_rejects_reversed_range(self) -> None:
        plan = plan_with("`mcp-dnsimple/src/client.ts:1-0`")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            consumers = {
                "mcp-dnsimple": root / "mcp-dnsimple",
                "mcp-unifi": root / "mcp-unifi",
            }
            for consumer in consumers.values():
                (consumer / ".git").mkdir(parents=True)
            plan_path = root / "migration-plan.md"
            manifest_path = root / "citations.json"
            plan_path.write_text(plan)

            def fake_show(repo: str, ref: str, path: str) -> str | None:
                if path == "package.json" and ref in (DNSIMPLE_PIN, UNIFI_PIN):
                    return "{}\n"
                if repo == "mcp-dnsimple" and ref == DNSIMPLE_PIN and path == "src/client.ts":
                    return "first\nsecond\n"
                return None

            output = io.StringIO()
            with (
                patch.object(checker, "REPO", root),
                patch.object(checker, "PLAN", plan_path),
                patch.object(checker, "MANIFEST", manifest_path),
                patch.object(checker, "CONSUMERS", consumers),
                patch.object(checker, "show", fake_show),
                redirect_stdout(output),
            ):
                result = checker.refresh()

            self.assertEqual(result, 1)
            self.assertIn("is not within the file's", output.getvalue())
            self.assertFalse(manifest_path.exists())


if __name__ == "__main__":
    unittest.main()
