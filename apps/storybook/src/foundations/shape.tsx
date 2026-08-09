import { useState } from "react";
import { lightDeclarations, ruleValue } from "./tokens";

function scaleRows(prefix: string) {
  const computed = getComputedStyle(document.documentElement);
  return [...lightDeclarations().keys()]
    .filter((name) => name.startsWith(prefix))
    .map((name) => ({ name, value: computed.getPropertyValue(name).trim() }));
}

/** The eight-step space scale, drawn at the size each step actually resolves to. */
export function SpaceScale() {
  const [rows] = useState(() => scaleRows("--kc-space-"));

  return (
    <ul className="kc-scale">
      {rows.map((row) => (
        <li className="kc-scale__item" key={row.name}>
          <code className="kc-scale__name">{row.name.replace("--kc-space-", "step ")}</code>
          <span
            aria-hidden="true"
            className="kc-scale__bar"
            style={{ inlineSize: row.value }}
          />
          <code className="kc-scale__value">{row.value}</code>
        </li>
      ))}
    </ul>
  );
}

const RADIUS_JOBS: Record<string, string> = {
  "--kc-radius-sm": "Banners and badges — the tone carriers.",
  "--kc-radius-key": "The keycap radius and the system default: buttons, inputs, select triggers, popovers.",
  "--kc-radius-plate": "Cards. The largest container reads as the plate itself, not an object on it.",
  "--kc-radius-pill": "Available and deliberately unused — a pill reads as floating, not seated.",
};

/** The four radii, each drawn at its own value, with the job it holds. */
export function RadiusScale() {
  const [rows] = useState(() => scaleRows("--kc-radius-"));

  return (
    <ul className="kc-radii">
      {rows.map((row) => (
        <li className="kc-radii__item" key={row.name}>
          <span
            aria-hidden="true"
            className="kc-radii__box"
            style={{ borderRadius: row.value }}
          />
          <div>
            <p className="kc-radii__name">
              <code>{row.name}</code> <code>{row.value}</code>
            </p>
            <p className="kc-radii__job">{RADIUS_JOBS[row.name]}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** A nested corner computed from its parent, not restated as a literal. */
export function ConcentricRadius() {
  const [inner] = useState(() => ruleValue(".kc-select__option", "border-radius"));
  const [outer] = useState(() => ruleValue(".kc-select__popover", "border-radius"));

  return (
    <div className="kc-concentric">
      <div className="kc-concentric__outer">
        <div className="kc-concentric__inner">Resources</div>
      </div>
      <p className="kc-concentric__spec">
        Outer <code>.kc-select__popover</code>: <code>{outer ?? "var(--kc-radius-key)"}</code>
        <br />
        Inner <code>.kc-select__option</code>: <code>{inner}</code>
      </p>
    </div>
  );
}

const MEASURES: Array<{ selector: string; property: string; label: string }> = [
  { selector: ".kc-field", property: "inline-size", label: "Field and Select" },
  { selector: ".kc-card", property: "inline-size", label: "Card" },
  { selector: ".kc-banner", property: "inline-size", label: "Banner" },
  { selector: ".kc-popover", property: "max-inline-size", label: "Popover" },
  { selector: ".kc-select__popover", property: "inline-size", label: "Select menu" },
  { selector: ".kc-button", property: "min-block-size", label: "Button height" },
];

/** Each component's declared measure ceiling, read out of the shipped stylesheet. */
export function IntrinsicMaximums() {
  const [rows] = useState(() =>
    MEASURES.map((measure) => ({
      ...measure,
      value: ruleValue(measure.selector, measure.property),
    })),
  );

  return (
    <div className="kc-table-scroll sb-unstyled">
      <table className="kc-table">
        <caption>
          Components declare their own comfortable width. Do not constrain one from
          the outside when it already knows.
        </caption>
        <thead>
          <tr>
            <th scope="col">Component</th>
            <th scope="col">Declaration</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.selector + row.property}>
              <th scope="row">{row.label}</th>
              <td>
                <code>
                  {row.selector} · {row.property}
                </code>
              </td>
              <td>
                <code>{row.value ?? "—"}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
