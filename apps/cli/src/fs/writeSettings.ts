import { copyFile, rename, writeFile } from "node:fs/promises";
import { safeParseSettings, type ClaudeSettings } from "schema";
import { safePath } from "./scoped.js";

export type WriteSettingsResult =
  | { success: true; settings: ClaudeSettings }
  | { success: false; issues: Array<{ message: string; path?: PropertyKey[] }> };

function settingsPaths() {
  const settingsPath = safePath("settings");
  return {
    settingsPath,
    backupPath: `${settingsPath}.bak`,
    tempPath: `${settingsPath}.tmp.${process.pid}`,
  };
}

/** Validate, back up, and atomically write settings.json. Only settings.json is writable. */
export async function writeSettings(input: unknown): Promise<WriteSettingsResult> {
  const parsed = safeParseSettings(input);
  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map((issue) => ({
        message: issue.message,
        path: issue.path,
      })),
    };
  }

  const { settingsPath, backupPath, tempPath } = settingsPaths();
  const content = `${JSON.stringify(parsed.data, null, 2)}\n`;

  try {
    await copyFile(settingsPath, backupPath);
  } catch (error) {
    const code = error instanceof Error && "code" in error ? String(error.code) : "";
    if (code !== "ENOENT") {
      throw error;
    }
  }

  await writeFile(tempPath, content, "utf8");
  await rename(tempPath, settingsPath);

  return { success: true, settings: parsed.data };
}
