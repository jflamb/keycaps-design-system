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
        component: [
          "All seven components in one realistic composition — the shape a Keycaps screen actually takes. Copy the source below: every element is inline, nothing is hidden behind a wrapper.",
          "",
          "It doubles as the project's verification fixture, which is why it is shaped as a page: a `main` landmark and a real heading outline, asserted by the axe check and the Playwright keyboard run.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <main className="kc-story-column" aria-labelledby="showcase-title">
      <header className="kc-story-section">
        <Badge tone="info">Keycaps beta</Badge>
        <h1 id="showcase-title">A calm foundation for consequential work</h1>
        <p className="kc-story-lede">
          Locally hosted type, semantic themes, sturdy keycap controls, and clear
          recovery language.
        </p>
      </header>

      <Banner title="Draft saved" tone="success">
        Your work is local and has not been published.
      </Banner>

      <Card aria-labelledby="account-card-title">
        <CardHeader>
          <CardTitle id="account-card-title">Project settings</CardTitle>
          <CardDescription>
            Fields remain labeled and usable across input methods and themes.
          </CardDescription>
        </CardHeader>
        <CardBody>
          <Field
            defaultValue="Personal assistant / 2026"
            description="Use a name people will recognize later."
            errorMessage="Remove the slash — project names can use letters, numbers, spaces and hyphens."
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
            <Button variant="quiet">Why this matters</Button>
            <Popover
              aria-label="Why the destination matters"
              placement="top start"
            >
              <strong>Choose for future retrieval.</strong>
              <p>
                The destination does not change who can access the project.
              </p>
            </Popover>
          </PopoverTrigger>
        </CardFooter>
      </Card>
    </main>
  ),
};
