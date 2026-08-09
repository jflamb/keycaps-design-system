import { useLayoutEffect, useRef, useState } from "react";

interface Role {
  id: string;
  name: string;
  usage: string;
  sample: string;
}

const ROLES: Role[] = [
  {
    id: "display",
    name: "Display",
    usage: "h1 and h2. Sizes are not tokenized — the surface decides, the face does not.",
    sample: "A calm foundation for consequential work",
  },
  {
    id: "title",
    name: "Title",
    usage: "Card titles. The only place Fraunces appears inside a component.",
    sample: "Project settings",
  },
  {
    id: "body",
    name: "Body",
    usage:
      "Running text and input values. The generous leading is what makes dense forms breathable.",
    sample:
      "Fields remain labeled and usable across input methods and themes, and the destination does not change who can access the project.",
  },
  {
    id: "label",
    name: "Label",
    usage:
      "Field labels, button text, descriptions. Semibold rather than bold — a label should be findable, not loud.",
    sample: "Destination",
  },
  {
    id: "micro",
    name: "Micro",
    usage:
      "Badges and small keys. At this size, weight is the only hierarchy signal that survives.",
    sample: "Keycaps beta",
  },
];

interface Measured {
  family: string;
  size: string;
  weight: string;
  lineHeight: string;
  variation: string;
}

function shortFamily(family: string): string {
  const first = family.split(",")[0] ?? family;
  return first.replace(/["']/g, "").trim();
}

/**
 * The five typographic roles, each rendered in the face it actually ships with.
 * The specification under each sample is read back off the rendered element, so
 * it reports what the page is doing rather than what this file believes.
 */
export function TypeRoles() {
  const samples = useRef(new Map<string, HTMLElement>());
  const [measured, setMeasured] = useState<Record<string, Measured>>({});

  useLayoutEffect(() => {
    const next: Record<string, Measured> = {};
    for (const [id, element] of samples.current) {
      const computed = getComputedStyle(element);
      next[id] = {
        family: shortFamily(computed.fontFamily),
        size: computed.fontSize,
        weight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        variation: computed.fontVariationSettings,
      };
    }
    setMeasured(next);
  }, []);

  return (
    <div className="kc-roles">
      {ROLES.map((role) => {
        const spec = measured[role.id];
        return (
          <section className="kc-roles__item" key={role.id}>
            <p className="kc-roles__name">{role.name}</p>
            <p
              className={`kc-role kc-role--${role.id}`}
              ref={(element) => {
                if (element) samples.current.set(role.id, element);
                else samples.current.delete(role.id);
              }}
            >
              {role.sample}
            </p>
            <p className="kc-roles__usage">{role.usage}</p>
            {spec ? (
              <p className="kc-roles__spec">
                <code>{spec.family}</code> · <code>{spec.size}</code> ·{" "}
                <code>{spec.weight}</code> · line-height <code>{spec.lineHeight}</code>
                {spec.variation && spec.variation !== "normal" ? (
                  <>
                    {" "}
                    · <code>{spec.variation}</code>
                  </>
                ) : null}
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
