import type { Meta, StoryObj } from "@storybook/react-vite";
import { Prose } from "./prose";

const meta = {
  title: "Prose/Lists",
  parameters: {
    docs: {
      description: {
        component: [
          "Ordered, unordered, nested, task, and definition lists.",
          "",
          "The one decision worth stating: a nested list sits tight under the item it belongs to, and the gap opens between siblings instead. Proximity is what says which bullet a sub-list belongs to — with equal gaps above and below, the grouping is guesswork.",
          "",
          "Ordered lists get wider indentation than unordered ones, and `type=\"a\"` and `type=\"i\"` wider again, because a number, a letter, and a roman numeral are three different marker widths and equal padding lands their text in three different places.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Nesting: Story = {
  render: () => (
    <Prose>
      <h2>What ships in each package</h2>
      <ul>
        <li>
          <strong>@jflamb/keycaps-tokens</strong>
          <ul>
            <li>Custom properties: primitives and both semantic themes</li>
            <li>Local Piazzolla and Sofia Sans WOFF2</li>
            <li>The base reset, and the opt-in prose stylesheet</li>
          </ul>
        </li>
        <li>
          <strong>@jflamb/keycaps-react</strong>
          <ul>
            <li>Button, Field, Select, Popover, Banner, Badge, Card</li>
            <li>One stylesheet; the components ship no inline styles</li>
          </ul>
        </li>
        <li>Nothing is fetched at runtime, from either package.</li>
      </ul>

      <h3>Ordered, and the marker widths</h3>
      <ol>
        <li>Decimal markers get 1.75rem of indentation.</li>
        <li>The text of every item lands in the same place.</li>
        <li>A third item, to show the marker is not the widest thing here.</li>
      </ol>

      <ol type="a">
        <li>Lettered markers get 2rem.</li>
        <li>Same gap between marker and text as the list above.</li>
      </ol>

      <ol type="i">
        <li>Roman numerals get 2.25rem, because they grow fastest.</li>
        <li>By the eighth item a roman list is twice as wide as a decimal one.</li>
      </ol>
    </Prose>
  ),
};

/**
 * Items containing paragraphs are a different rhythm problem: the space inside
 * an item has to be smaller than the space between items, or the list stops
 * reading as a list.
 */
export const ComplexItems: Story = {
  render: () => (
    <Prose>
      <h2>The release gates</h2>
      <ol>
        <li>
          <p>
            <strong>API review.</strong> The public surface is owned, so the
            behavior dependency can be replaced without a consumer-visible break.
          </p>
          <p>
            A component that leaks its implementation's props has not passed
            this one.
          </p>
        </li>
        <li>
          <p>
            <strong>Automated interaction and accessibility checks.</strong>{" "}
            Every story carries a play function or an axe pass, usually both.
          </p>
        </li>
        <li>
          <p>
            <strong>Responsive and forced-color verification.</strong> The 320
            Rule is a gate, not a guideline.
          </p>
        </li>
      </ol>
    </Prose>
  ),
};

export const TaskAndDefinition: Story = {
  render: () => (
    <Prose>
      <h2>Task lists</h2>
      <ul>
        <li>
          <input defaultChecked disabled id="task-tokens" type="checkbox" />
          <label htmlFor="task-tokens">Token layer published</label>
        </li>
        <li>
          <input defaultChecked disabled id="task-prose" type="checkbox" />
          <label htmlFor="task-prose">Prose stylesheet documented</label>
        </li>
        <li>
          <input disabled id="task-at" type="checkbox" />
          <label htmlFor="task-at">
            Manual assistive-technology coverage recorded
          </label>
        </li>
      </ul>
      <p>
        The checkbox takes <code>accent-color</code> from the mint accent border
        — the system's "yes" — rather than the browser default blue.
      </p>

      <h2>Definition lists</h2>
      <dl>
        <dt>Plate</dt>
        <dd>
          The warm near-white ground the whole system sits on. It asks for
          nothing and holds everything.
        </dd>
        <dt>Key edge</dt>
        <dd>
          The darker band beneath a key's face that makes the cap read as an
          object with height rather than a colored rectangle.
        </dd>
        <dt>Optical weight</dt>
        <dd>
          The weight a role needs at its own size, rather than the nearest
          hundred on the ladder.
        </dd>
      </dl>
    </Prose>
  ),
};
