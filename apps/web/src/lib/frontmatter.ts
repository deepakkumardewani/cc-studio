export type FrontmatterResult = {
  data: Record<string, string>;
  body: string;
  hasFrontmatter: boolean;
};

const FRONTMATTER_KEY = /^([\w-]+):\s*(.*)$/;

export function parseFrontmatter(raw: string): FrontmatterResult {
  if (!raw.startsWith("---")) {
    return { data: {}, body: raw, hasFrontmatter: false };
  }

  const closingIndex = raw.indexOf("\n---", 3);
  if (closingIndex === -1) {
    return { data: {}, body: raw, hasFrontmatter: false };
  }

  const yamlBlock = raw.slice(3, closingIndex).trim();
  const body = raw.slice(closingIndex + 4).replace(/^\n+/, "");
  const data: Record<string, string> = {};

  for (const line of yamlBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    const match = trimmed.match(FRONTMATTER_KEY);
    if (match) {
      data[match[1]] = match[2].trim();
    }
  }

  return { data, body, hasFrontmatter: true };
}
