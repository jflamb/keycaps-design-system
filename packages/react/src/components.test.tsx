import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import {
  Badge,
  Banner,
  Button,
  Card,
  CardBody,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Popover,
  PopoverTrigger,
  Select,
} from "./index";

describe("Button", () => {
  it("has a native accessible name and activates from the keyboard", async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    render(<Button onPress={onPress}>Save settings</Button>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Save settings" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

describe("Field", () => {
  it("connects its label, description, and error message", () => {
    render(
      <Field
        description="Use a durable address."
        errorMessage="Enter a complete email address."
        inputProps={{ type: "email" }}
        isInvalid
        label="Email address"
      />,
    );

    const field = screen.getByRole("textbox", { name: "Email address" });
    expect(field).toHaveAccessibleDescription(
      /durable address.*complete email address/i,
    );
  });
});

describe("Select", () => {
  it("opens from the keyboard and exposes named options", async () => {
    const user = userEvent.setup();
    render(
      <Select
        label="Destination"
        options={[
          { id: "projects", label: "Projects" },
          { id: "resources", label: "Resources" },
        ]}
      />,
    );

    const trigger = screen.getByRole("button", { name: /Destination/ });
    trigger.focus();
    await user.keyboard("{ArrowDown}");
    expect(await screen.findByRole("listbox")).toBeVisible();
    expect(screen.getByRole("option", { name: "Resources" })).toBeVisible();
  });
});

describe("Popover", () => {
  it("opens from its trigger, closes with Escape, and restores focus", async () => {
    const user = userEvent.setup();
    render(
      <PopoverTrigger>
        <Button variant="secondary">Account help</Button>
        <Popover aria-label="Account help">Use your jflamb.com account.</Popover>
      </PopoverTrigger>,
    );

    const trigger = screen.getByRole("button", { name: "Account help" });
    await user.click(trigger);
    expect(await screen.findByRole("dialog", { name: "Account help" })).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Account help" })).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

describe("Banner, Badge, and Card", () => {
  it("uses status semantics, preserves text labels, and keeps a heading structure", async () => {
    const dismiss = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Banner onDismiss={dismiss} title="Connection lost" tone="danger">
          Reconnect Gmail to restore coverage.
        </Banner>
        <Card>
          <CardHeader>
            <Badge tone="warning">Review needed</Badge>
            <CardTitle>Filing destination</CardTitle>
            <CardDescription>Choose where this record belongs.</CardDescription>
          </CardHeader>
          <CardBody>Resources / Design systems</CardBody>
        </Card>
      </>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Reconnect Gmail");
    expect(screen.getByText("Review needed")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Filing destination", level: 2 })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Dismiss message" }));
    expect(dismiss).toHaveBeenCalledTimes(1);
  });
});

describe("automated accessibility baseline", () => {
  it("has no axe violations in a representative component composition", async () => {
    const { container } = render(
      <main>
        <Banner title="Draft saved" tone="success">
          Your work has not been published.
        </Banner>
        <Card aria-labelledby="settings-title">
          <CardHeader>
            <CardTitle id="settings-title">Project settings</CardTitle>
          </CardHeader>
          <CardBody>
            <Field label="Project name" inputProps={{ placeholder: "Keycaps" }} />
            <Select
              label="Destination"
              options={[
                { id: "projects", label: "Projects" },
                { id: "archive", label: "Archive" },
              ]}
            />
            <Button>Save settings</Button>
          </CardBody>
        </Card>
      </main>,
    );

    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
