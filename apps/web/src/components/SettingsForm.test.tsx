// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { SettingsForm } from "./SettingsForm";

afterEach(() => {
  cleanup();
});

const sampleFields = [
  {
    key: "alwaysThinkingEnabled",
    label: "Always Thinking Enabled",
    description: "Enable extended thinking by default.",
    control: "toggle" as const,
  },
  {
    key: "effortLevel",
    label: "Effort Level",
    description: "Persist adaptive reasoning effort across sessions.",
    control: "select" as const,
    options: [
      { value: "low", label: "low" },
      { value: "high", label: "high" },
    ],
  },
];

test("boolean field renders as editable toggle", () => {
  render(
    <SettingsForm
      fields={sampleFields}
      defaultValues={{ alwaysThinkingEnabled: true, effortLevel: "high" }}
      onSubmit={vi.fn()}
    />,
  );

  const toggle = screen.getByLabelText("Always Thinking Enabled");
  expect(toggle).toHaveProperty("type", "checkbox");
  expect((toggle as HTMLInputElement).checked).toBe(true);
});

test("enum field renders as editable select", () => {
  render(
    <SettingsForm
      fields={sampleFields}
      defaultValues={{ alwaysThinkingEnabled: false, effortLevel: "high" }}
      onSubmit={vi.fn()}
    />,
  );

  const select = screen.getByLabelText("Effort Level");
  expect(select.tagName).toBe("SELECT");
  expect((select as HTMLSelectElement).value).toBe("high");
});

test("invalid enum value surfaces inline error and blocks submit", async () => {
  const onSubmit = vi.fn();

  render(
    <SettingsForm
      fields={sampleFields}
      defaultValues={{ alwaysThinkingEnabled: false, effortLevel: "turbo" as never }}
      onSubmit={onSubmit}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Save settings" }));

  await waitFor(() => {
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  });
  expect(onSubmit).not.toHaveBeenCalled();
});

test("invalid number input surfaces inline error and blocks submit", async () => {
  const onSubmit = vi.fn();

  render(
    <SettingsForm
      fields={[
        {
          key: "cleanupPeriodDays",
          label: "Cleanup Period Days",
          description: "Number of days to retain sessions.",
          control: "input",
        },
      ]}
      defaultValues={{}}
      onSubmit={onSubmit}
    />,
  );

  fireEvent.change(screen.getByLabelText("Cleanup Period Days"), {
    target: { value: "not-a-number" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save settings" }));

  await waitFor(() => {
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  });
  expect(onSubmit).not.toHaveBeenCalled();
});

test("valid submit calls onSubmit with parsed values", async () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);

  render(
    <SettingsForm
      fields={sampleFields}
      defaultValues={{ alwaysThinkingEnabled: false, effortLevel: "low" }}
      onSubmit={onSubmit}
    />,
  );

  fireEvent.click(screen.getByLabelText("Always Thinking Enabled"));
  fireEvent.click(screen.getByRole("button", { name: "Save settings" }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      alwaysThinkingEnabled: true,
      effortLevel: "low",
    });
  });
});
