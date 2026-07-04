import { safeParseSettings } from "schema";
import { listCategory, readFileText } from "../fs/scoped.js";

export type SkillEntry = {
  name: string;
  label: string;
  value: string;
};

export type SkillsResponse = {
  skills: SkillEntry[];
};

function toLabel(name: string): string {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function extractSkillNames(files: string[]): string[] {
  const names = new Set<string>();
  for (const file of files) {
    const slash = file.indexOf("/");
    const name = slash >= 0 ? file.slice(0, slash) : file.replace(/\.(md|json)$/, "");
    if (name && name !== "CLAUDE") {
      names.add(name);
    }
  }
  return [...names].sort();
}

export async function getSkillsResponse(): Promise<SkillsResponse> {
  let skillNames: string[] = [];
  try {
    const files = await listCategory("skills");
    skillNames = extractSkillNames(files);
  } catch {
    // skills directory may not exist
  }

  let overrides: Record<string, string> = {};
  try {
    const raw = await readFileText("settings", "");
    const parsed = safeParseSettings(JSON.parse(raw) as unknown);
    if (parsed.success && parsed.data.skillOverrides) {
      overrides = parsed.data.skillOverrides as Record<string, string>;
    }
  } catch {
    // settings may not exist; defaults apply
  }

  const skills = skillNames.map((name) => ({
    name,
    label: toLabel(name),
    value: overrides[name] ?? "on",
  }));

  return { skills };
}
