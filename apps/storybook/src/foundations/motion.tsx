import { useState } from "react";
import { Button, Popover, PopoverTrigger, Select } from "@jflamb/keycaps-react";
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
    <div className="kc-table-scroll sb-unstyled">
      <table className="kc-table">
        <caption>
          Every reduced-motion substitution in the system. There are no others: the
          tokens package owns the whole switch, so no component can opt out of it.
        </caption>
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Motion</th>
            <th scope="col">Reduced motion</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name}>
              <th scope="row">
                <code>{row.name}</code>
              </th>
              <td>
                <code>{row.motion}</code>
              </td>
              <td>
                <code>{row.reduced}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
