import { isCategory, readFileText } from "../fs/scoped.js";

export async function getFileResponse(categoryParam: string, nameParam: string) {
  if (!isCategory(categoryParam)) {
    return { status: 400 as const, body: { error: "invalid category" } };
  }

  const name = nameParam.trim();
  if (!name && categoryParam !== "claudeMd" && categoryParam !== "settings") {
    return { status: 400 as const, body: { error: "name is required" } };
  }

  try {
    const relative = categoryParam === "claudeMd" || categoryParam === "settings" ? "" : name;
    const content = await readFileText(categoryParam, relative);
    return {
      status: 200 as const,
      body: {
        category: categoryParam,
        name: name || (categoryParam === "claudeMd" ? "CLAUDE.md" : "settings.json"),
        content,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unable to read file";
    if (message.includes("path escapes")) {
      return { status: 403 as const, body: { error: "forbidden path" } };
    }
    return { status: 404 as const, body: { error: "file not found" } };
  }
}
