import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";
import { Button } from "./Button";
import {
  Card,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "Card groups one coherent topic or decision. Do not wrap every section in a card; open layout and simple dividers are often clearer. Use heading levels that preserve the page outline.",
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card aria-labelledby="review-card-title">
      <CardHeader>
        <Badge tone="warning">Review needed</Badge>
        <CardTitle id="review-card-title">Confirm the filing destination</CardTitle>
        <CardDescription>
          This item looks like a durable resource, but it has not been moved.
        </CardDescription>
      </CardHeader>
      <CardBody>
        <p>
          Suggested destination: <strong>Resources / Design systems</strong>
        </p>
      </CardBody>
      <CardFooter>
        <Button>Confirm destination</Button>
        <Button variant="secondary">Choose another</Button>
      </CardFooter>
    </Card>
  ),
};
