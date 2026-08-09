import {
  Badge,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@jflamb/keycaps-react";
import { SplitPanes, ThemeScope } from "./blocks";

function Resting() {
  return (
    <Card aria-labelledby="depth-resting-title">
      <CardHeader>
        <Badge tone="info">Rests on the plate</Badge>
        <CardTitle id="depth-resting-title">Project settings</CardTitle>
        <CardDescription>
          A card casts in light and stops casting in dark. Depth there is the
          surface ladder instead.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

/**
 * A static overlay surface. The class is the shipped one, but the element is not
 * a live Popover: React Aria portals a real popover to the document body, where
 * it would leave this scope and pick up the page's own theme.
 */
function Detached() {
  return (
    <div className="kc-popover kc-popover--static">
      <div className="kc-popover__dialog">
        <strong>Genuinely detached.</strong>
        <p>An overlay casts in both themes, because it is not resting on anything.</p>
      </div>
    </div>
  );
}

/** The same two objects under both physics, side by side. */
export function DepthSamples() {
  return (
    <SplitPanes>
      <ThemeScope label="Light — depth is cast" theme="light">
        <Resting />
        <Detached />
      </ThemeScope>
      <ThemeScope label="Dark — depth is tonal" theme="dark">
        <Resting />
        <Detached />
      </ThemeScope>
    </SplitPanes>
  );
}

/** The dark theme's three-step surface ladder, the job the cast shadow does in light. */
export function SurfaceLadder() {
  return (
    <SplitPanes>
      <ThemeScope label="Light" theme="light">
        <ul className="kc-ladder">
          <li className="kc-ladder__step" data-step="surface">
            <code>--kc-color-surface</code>
          </li>
          <li className="kc-ladder__step" data-step="raised">
            <code>--kc-color-surface-raised</code>
          </li>
          <li className="kc-ladder__step" data-step="hover">
            <code>--kc-color-surface-hover</code>
          </li>
        </ul>
      </ThemeScope>
      <ThemeScope label="Dark" theme="dark">
        <ul className="kc-ladder">
          <li className="kc-ladder__step" data-step="surface">
            <code>--kc-color-surface</code>
          </li>
          <li className="kc-ladder__step" data-step="raised">
            <code>--kc-color-surface-raised</code>
          </li>
          <li className="kc-ladder__step" data-step="hover">
            <code>--kc-color-surface-hover</code>
          </li>
        </ul>
      </ThemeScope>
    </SplitPanes>
  );
}
