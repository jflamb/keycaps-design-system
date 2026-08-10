import { useState } from "react";
import {
  Button,
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableColumnHeader,
  DataTableHead,
  DataTableRow,
  DataTableRowHeader,
  Popover,
  PopoverTrigger,
  Select,
} from "@jflamb/keycaps-react";
import { MotionScope, SplitPanes } from "./blocks";
import { reducedMotionDeclarations } from "./tokens";

const PRESS_TOKENS = [
  "--kc-press-travel",
  "--kc-press-edge-width",
  "--kc-key-edge-width",
  "--kc-duration-press",
  "--kc-duration-overlay",
  "--kc-chevron-open-turn",
  "--kc-color-key-face-pressed",
];

const DESTINATIONS = [
  { id: "projects", label: "Projects" },
  { id: "areas", label: "Areas" },
  { id: "resources", label: "Resources" },
  { id: "archive", label: "Archive" },
];

/**
 * The press is the system's only expressive gesture, so it is the one thing
 * this page insists you do rather than read. Hold either key.
 */
export function PressLab() {
  return (
    <SplitPanes>
      <MotionScope label="Motion — the cap travels" mode="full">
        <Button>Save settings</Button>
        <Button variant="secondary">Review details</Button>
      </MotionScope>
      <MotionScope label="Reduced motion — the cap fills instead" mode="reduce">
        <Button>Save settings</Button>
        <Button variant="secondary">Review details</Button>
      </MotionScope>
    </SplitPanes>
  );
}

/** The same substitution on the two other surfaces that move: the chevron and the overlay. */
export function OverlayLab() {
  return (
    <SplitPanes>
      <MotionScope label="Motion" mode="full">
        <Select label="Destination" options={DESTINATIONS} />
        <PopoverTrigger>
          <Button variant="secondary">Why this matters</Button>
          <Popover aria-label="Why the destination matters" placement="bottom start">
            <p>The destination does not change who can access the project.</p>
          </Popover>
        </PopoverTrigger>
      </MotionScope>
      <MotionScope label="Reduced motion" mode="reduce">
        <Select label="Destination" options={DESTINATIONS} />
        <PopoverTrigger>
          <Button variant="secondary">Why this matters</Button>
          <Popover aria-label="Why the destination matters" placement="bottom start">
            <p>The destination does not change who can access the project.</p>
          </Popover>
        </PopoverTrigger>
      </MotionScope>
    </SplitPanes>
  );
}

/** Motion values, and what each becomes when motion is suppressed. */
export function MotionValues() {
  const [rows] = useState(() => {
    const reduced = reducedMotionDeclarations();
    const computed = getComputedStyle(document.documentElement);
    return PRESS_TOKENS.map((name) => ({
      name,
      motion: computed.getPropertyValue(name).trim(),
      reduced: reduced.get(name) ?? "unchanged",
    }));
  });

  return (
    <DataTable
      caption="Every reduced-motion substitution in the system. There are no others: the tokens package owns the whole switch, so no component can opt out of it."
      className="kc-docs-table sb-unstyled"
    >
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>Token</DataTableColumnHeader>
          <DataTableColumnHeader>Motion</DataTableColumnHeader>
          <DataTableColumnHeader>Reduced motion</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {rows.map((row) => (
          <DataTableRow key={row.name}>
            <DataTableRowHeader>
              <code>{row.name}</code>
            </DataTableRowHeader>
            <DataTableCell>
              <code>{row.motion}</code>
            </DataTableCell>
            <DataTableCell>
              <code>{row.reduced}</code>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  );
}
