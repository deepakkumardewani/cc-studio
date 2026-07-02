export const ROUTE_TO_CATEGORY = {
  skills: "skills",
  plans: "plans",
  commands: "commands",
  "claude-md": "claudeMd",
  settings: "settings",
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
