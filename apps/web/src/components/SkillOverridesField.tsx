import { useEffect, useState } from "react";
import { fetchSkills, type SkillEntry } from "../lib/api";
import {
  EditorList,
  EmptyHint,
  ModeTabs,
  RawJsonPanel,
  type EditorMode,
} from "./structured-shared";

type OverrideValue = "on" | "name-only" | "user-invocable-only" | "off";

const OVERRIDE_OPTIONS: Array<{ value: OverrideValue; label: string }> = [
  { value: "on", label: "On" },
  { value: "name-only", label: "Name only" },
  { value: "user-invocable-only", label: "User invocable only" },
  { value: "off", label: "Off" },
];

function asOverrides(value: unknown): Record<string, string> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, string>)
    : {};
}

function SkillRow({
  skill,
  currentValue,
  onChange,
}: {
  skill: SkillEntry;
  currentValue: OverrideValue;
  onChange: (name: string, value: OverrideValue) => void;
}) {
  const isOff = currentValue === "off";

  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5">
      <span
        className={`min-w-0 flex-1 truncate font-mono text-xs transition-colors duration-200 ${isOff ? "text-text-muted line-through" : "text-text"}`}
        title={skill.name}
      >
        {skill.name}
      </span>
      <select
        aria-label={`Override for ${skill.name}`}
        value={currentValue}
        onChange={(e) => onChange(skill.name, e.target.value as OverrideValue)}
        className={`shrink-0 rounded-md border px-2 py-1 text-xs transition focus:outline-none focus:ring-2 focus:ring-ring ${
          isOff
            ? "border-border-subtle bg-surface text-text-muted"
            : "border-accent/30 bg-surface text-text"
        }`}
      >
        {OVERRIDE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SkillOverridesField({
  value,
  onChange,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<EditorMode>("fields");

  const overrides = asOverrides(value);

  useEffect(() => {
    fetchSkills()
      .then(({ skills: fetched }) => setSkills(fetched))
      .catch(() => setSkills([]))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(name: string, next: OverrideValue) {
    const updated = { ...overrides };
    if (next === "on") {
      delete updated[name];
    } else {
      updated[name] = next;
    }
    onChange(Object.keys(updated).length > 0 ? updated : undefined);
  }

  const offCount = skills.filter((s) => overrides[s.name] === "off").length;
  const overriddenCount = Object.keys(overrides).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-text-muted">
          {loading
            ? "Loading skills…"
            : `${skills.length} skills · ${overriddenCount} override${overriddenCount === 1 ? "" : "s"} · ${offCount} off`}
        </p>
        <ModeTabs mode={mode} onChange={setMode} />
      </div>

      {mode === "json" ? (
        <RawJsonPanel value={value} onChange={onChange} />
      ) : loading ? (
        <EmptyHint>Loading available skills…</EmptyHint>
      ) : skills.length === 0 ? (
        <EmptyHint>No skills found in ~/.claude/skills</EmptyHint>
      ) : (
        <EditorList>
          {skills.map((skill) => (
            <SkillRow
              key={skill.name}
              skill={skill}
              currentValue={(overrides[skill.name] as OverrideValue) ?? "on"}
              onChange={handleChange}
            />
          ))}
        </EditorList>
      )}
    </div>
  );
}
