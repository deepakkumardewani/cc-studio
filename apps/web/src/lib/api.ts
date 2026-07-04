export const ROUTE_TO_CATEGORY = {
  skills: "skills",
  plans: "plans",
  commands: "commands",
  "claude-md": "claudeMd",
  settings: "settings",
  agents: "agents",
  plugins: "plugins",
} as const;

export type RouteSegment = keyof typeof ROUTE_TO_CATEGORY;
export type ApiCategory = (typeof ROUTE_TO_CATEGORY)[RouteSegment];

export function isRouteSegment(value: string): value is RouteSegment {
  return value in ROUTE_TO_CATEGORY;
}

export function routeToCategory(segment: RouteSegment): ApiCategory {
  return ROUTE_TO_CATEGORY[segment];
}

export function categoryToRoute(category: ApiCategory): RouteSegment {
  const entry = Object.entries(ROUTE_TO_CATEGORY).find(
    ([, apiCategory]) => apiCategory === category,
  );
  if (!entry) {
    throw new Error(`unknown category: ${category}`);
  }
  return entry[0] as RouteSegment;
}

export function fileHref(category: ApiCategory, name: string): string {
  const segment = categoryToRoute(category);
  if (category === "claudeMd" || category === "settings") {
    return `/${segment}`;
  }
  return `/${segment}/${name.split("/").map(encodeURIComponent).join("/")}`;
}

export type TreeFile = {
  name: string;
};

export type TreeCategory = {
  category: ApiCategory;
  label: string;
  files: TreeFile[];
};

export type TreeResponse = {
  categories: TreeCategory[];
};

export type FileResponse = {
  category: ApiCategory;
  name: string;
  content: string;
};

export type SettingsField = {
  key: string;
  label: string;
  description: string;
  control: "toggle" | "select" | "input" | "json";
  group: string;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
};

export type SettingsSchemaResponse = {
  fields: SettingsField[];
};

export type SettingsResponse = {
  settings: Record<string, unknown>;
};

export type SkillEntry = {
  name: string;
  label: string;
  value: string;
};

export type SkillsResponse = {
  skills: SkillEntry[];
};

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchTree(): Promise<TreeResponse> {
  return parseJson<TreeResponse>(await fetch("/api/tree"));
}

export async function fetchFile(category: ApiCategory, name: string): Promise<FileResponse> {
  const params = new URLSearchParams({ category, name });
  return parseJson<FileResponse>(await fetch(`/api/file?${params.toString()}`));
}

export async function fetchSettingsSchema(): Promise<SettingsSchemaResponse> {
  return parseJson<SettingsSchemaResponse>(await fetch("/api/settings/schema"));
}

export async function fetchSettings(): Promise<SettingsResponse> {
  return parseJson<SettingsResponse>(await fetch("/api/settings"));
}

export async function fetchSkills(): Promise<SkillsResponse> {
  return parseJson<SkillsResponse>(await fetch("/api/skills"));
}

export type ContextEntry = {
  category: string;
  tokens: number;
  percentage: number;
};

export type ContextResponse =
  | { success: true; breakdown: ContextEntry[]; total: number }
  | { success: false; error: string };

export async function fetchContext(): Promise<ContextResponse> {
  return parseJson<ContextResponse>(await fetch("/api/context"));
}

export async function updateSettings(settings: Record<string, unknown>): Promise<SettingsResponse> {
  const response = await fetch("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(`request failed: ${response.status}`);
  }

  return response.json() as Promise<SettingsResponse>;
}
