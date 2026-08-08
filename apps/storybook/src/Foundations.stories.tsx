import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Badge,
  Banner,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Field,
  Popover,
  PopoverTrigger,
  Select,
} from "@jflamb/keycaps-react";

const meta = {
  title: "Foundations/Component showcase",
  parameters: {
    docs: {
      description: {
        component:
          "A realistic composition used for visual, theme, reflow, keyboard, reduced-motion, forced-color, and no-third-party-request verification.",
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Showcase() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <main className="kc-story-column" aria-labelledby="showcase-title">
      <header className="kc-story-section">
        <Badge tone="info">Keycaps beta</Badge>
        <h1 id="showcase-title">A calm foundation for consequential work</h1>
        <p>
          Locally hosted type, semantic themes, sturdy keycap controls, and clear recovery language.
        </p>
      </header>

      {showBanner ? (
        <Banner
          onDismiss={() => setShowBanner(false)}
          title="Draft saved"
          tone="success"
        >
          Your work is local and has not been published.
        </Banner>
      ) : null}

      <Card aria-labelledby="account-card-title">
        <CardHeader>
          <CardTitle id="account-card-title">Project settings</CardTitle>
          <CardDescription>
            Fields remain labeled and usable across input methods and themes.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Field
            description="Use a name people will recognize later."
            inputProps={{ placeholder: "Personal assistant" }}
            label="Project name"
          />
          <Select
            description="Choose where the durable record belongs."
            label="Destination"
            options={[
              { id: "projects", label: "Projects" },
              { id: "areas", label: "Areas" },
              { id: "resources", label: "Resources" },
              { id: "archive", label: "Archive" },
            ]}
          />
        </CardBody>
        <CardFooter>
          <Button>Save settings</Button>
          <PopoverTrigger>
            <Button variant="secondary">Why this matters</Button>
            <Popover aria-label="Why the destination matters" placement="top start">
              <strong>Choose for future retrieval.</strong>
              <p>The destination does not change who can access the project.</p>
            </Popover>
          </PopoverTrigger>
        </CardFooter>
      </Card>
    </main>
  );
}

export const Default: Story = {
  render: () => <Showcase />,
};
