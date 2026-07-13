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
    group: "General",
  },
  {
    key: "effortLevel",
    label: "Effort Level",
    description: "Persist adaptive reasoning effort across sessions.",
    control: "select" as const,
    group: "General",
    options: [
      { value: "low", label: "low" },
      { value: "high", label: "high" },
    ],
  },
  {
    key: "permissions",
    label: "Permissions",
    description: "Tool usage permissions configuration.",
    control: "json" as const,
    group: "Permissions",
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

  const toggle = screen.getByRole("switch", { name: "Always Thinking Enabled" });
  expect((toggle as HTMLInputElement).checked).toBe(true);
});

test("enum field renders as custom dropdown", () => {
  render(
    <SettingsForm
      fields={sampleFields}
      defaultValues={{ alwaysThinkingEnabled: false, effortLevel: "high" }}
      onSubmit={vi.fn()}
    />,
  );

  const trigger = screen.getByLabelText("Effort Level");
  expect(trigger.tagName).toBe("BUTTON");
  expect(trigger.textContent).toContain("high");
});

test("save bar appears only once a setting changes", () => {
  render(
    <SettingsForm
      fields={sampleFields}
      defaultValues={{ alwaysThinkingEnabled: false, effortLevel: "high" }}
      onSubmit={vi.fn()}
    />,
  );

  expect(screen.queryByRole("button", { name: "Save settings" })).toBeNull();
  fireEvent.click(screen.getByRole("switch", { name: "Always Thinking Enabled" }));
  expect(screen.getByText(/unsaved change/)).toBeTruthy();
  expect(screen.getByRole("button", { name: "Save settings" })).toHaveProperty("disabled", false);
});

test("discard reverts changes and hides the save bar", () => {
  render(
    <SettingsForm
      fields={sampleFields}
      defaultValues={{ alwaysThinkingEnabled: false, effortLevel: "high" }}
      onSubmit={vi.fn()}
    />,
  );

  fireEvent.click(screen.getByRole("switch", { name: "Always Thinking Enabled" }));
  fireEvent.click(screen.getByRole("button", { name: "Discard" }));

  expect(screen.queryByRole("button", { name: "Save settings" })).toBeNull();
  const toggle = screen.getByRole("switch", { name: "Always Thinking Enabled" });
  expect((toggle as HTMLInputElement).checked).toBe(false);
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

  fireEvent.click(screen.getByRole("switch", { name: "Always Thinking Enabled" }));
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
          group: "General",
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

  fireEvent.click(screen.getByRole("switch", { name: "Always Thinking Enabled" }));
  fireEvent.click(screen.getByRole("button", { name: "Save settings" }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      alwaysThinkingEnabled: true,
      effortLevel: "low",
    });
  });
});

test("renders grouped section navigation", () => {
  render(
    <SettingsForm
      fields={sampleFields}
      defaultValues={{ alwaysThinkingEnabled: false, effortLevel: "high" }}
      onSubmit={vi.fn()}
    />,
  );

  expect(screen.getByRole("navigation", { name: "Settings sections" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "General" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Permissions" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: /General \(\d+\)/ })).toBeTruthy();
  expect(screen.getByRole("heading", { name: /Permissions \(\d+\)/ })).toBeTruthy();
});

test("filters settings by search query", () => {
  render(
    <SettingsForm
      fields={sampleFields}
      defaultValues={{ alwaysThinkingEnabled: false, effortLevel: "high" }}
      onSubmit={vi.fn()}
    />,
  );

  fireEvent.change(screen.getByRole("searchbox", { name: "Search settings" }), {
    target: { value: "permissions" },
  });

  expect(screen.queryByRole("heading", { name: /General \(\d+\)/ })).toBeNull();
  expect(screen.getByRole("heading", { name: /Permissions \(\d+\)/ })).toBeTruthy();
  expect(screen.getByText("1 result")).toBeTruthy();
});

test("search highlights matching field key and description", () => {
  render(
    <SettingsForm
      fields={sampleFields}
      defaultValues={{ alwaysThinkingEnabled: false, effortLevel: "high" }}
      onSubmit={vi.fn()}
    />,
  );

  fireEvent.change(screen.getByRole("searchbox", { name: "Search settings" }), {
    target: { value: "effort" },
  });

  expect(screen.getAllByText("effort").length).toBeGreaterThan(0);
  expect(screen.getByText("Effort")).toBeTruthy();
  expect(screen.queryByText("effortLevel")).toBeNull();
  expect(document.querySelectorAll("mark").length).toBeGreaterThan(0);
});

test("Overrides group appears in navigation when field has Overrides group", () => {
  const fieldsWithOverrides = [
    ...sampleFields,
    {
      key: "skillOverrides",
      label: "Skill Overrides",
      description: "Disable specific skills to reduce context bloat.",
      control: "json" as const,
      group: "Overrides",
    },
  ];

  render(<SettingsForm fields={fieldsWithOverrides} defaultValues={{}} onSubmit={vi.fn()} />);

  expect(screen.getByRole("button", { name: "Overrides" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: /Overrides \(\d+\)/ })).toBeTruthy();
});
