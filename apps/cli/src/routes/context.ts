import { spawn } from "node:child_process";

type ContextEntry = {
  category: string;
  tokens: number;
  percentage: number;
};

type ContextSuccess = {
  success: true;
  breakdown: ContextEntry[];
  total: number;
};

type ContextError = {
  success: false;
  error: string;
};

export type ContextResponse = ContextSuccess | ContextError;

type ContextItem = {
  name: string;
  tokens?: number;
};

type ContextCategory = {
  name: string;
  tokens: number;
  percentage: number;
  items: ContextItem[];
};

type ContextAllSuccess = {
  success: true;
  model: string;
  model_id: string;
  total_tokens: number;
  max_tokens: number;
  percentage: number;
  is_estimated: boolean;
  categories: ContextCategory[];
};

type ContextAllError = {
  success: false;
  error: string;
};

export type ContextAllResponse = ContextAllSuccess | ContextAllError;

// Parses a compact token string like "7.3k", "1m", "~30", "516" into a number
function parseTokenCount(raw: string): number {
  const s = raw.trim().replace(/,/g, "").replace(/^~/, "");
  if (/m$/i.test(s)) {
    return Math.round(parseFloat(s) * 1_000_000);
  }
  if (/k$/i.test(s)) {
    return Math.round(parseFloat(s) * 1000);
  }
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

// Strips qualifiers like "(deferred)" before comparing names, since the summary table and
// detail sections label the same category differently (e.g. "MCP tools (deferred)" vs "MCP Tools").
function normalizeCategoryKey(name: string): string {
  return name
    .replace(/\(.*?\)/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function parseContextOutput(output: string): ContextSuccess | null {
  const lines = output.split("\n");
  const entries: ContextEntry[] = [];

  // Extract total from the "Tokens: 26.3k / 200k (13%)" header line
  let total = 0;
  for (const line of lines) {
    const totalMatch = line.match(/\*\*Tokens:\*\*\s*([\d.,k]+)\s*\/\s*[\d.,k]+/i);
    if (totalMatch) {
      total = parseTokenCount(totalMatch[1]);
      break;
    }
  }

  // Parse the markdown table rows: | Category | Tokens | Percentage |
  // Skip header and separator rows (contain "---")
  let inCategoryTable = false;
  for (const line of lines) {
    if (line.includes("Estimated usage by category")) {
      inCategoryTable = true;
      continue;
    }
    // Stop at next section heading after the category table
    if (inCategoryTable && line.startsWith("###") && !line.includes("Estimated")) {
      break;
    }
    if (!inCategoryTable) continue;

    const cols = line
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length < 3) continue;
    if (cols[0] === "Category" || cols[0].startsWith("-")) continue;

    const category = cols[0];
    const tokens = parseTokenCount(cols[1]);
    const pctStr = cols[2].replace("%", "").trim();
    const percentage = parseFloat(pctStr);

    if (!category || isNaN(tokens) || isNaN(percentage)) continue;
    entries.push({ category, tokens, percentage });
  }

  if (entries.length === 0) return null;

  // If total wasn't found in header, sum from entries (excluding "Free space")
  if (total === 0) {
    total = entries
      .filter((e) => e.category !== "Free space")
      .reduce((sum, e) => sum + e.tokens, 0);
  }

  return { success: true, breakdown: entries, total };
}

export async function getContextResponse(): Promise<ContextResponse> {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";

    // cwd: process.env.HOME ensures we fetch global context (from ~/.claude)
    // not project-scoped context
    const child = spawn("claude", ["/context"], {
      cwd: process.env.HOME,
      env: process.env,
      timeout: 10_000,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      resolve({
        success: false,
        error: err.message.includes("ENOENT")
          ? "claude CLI not available"
          : `failed to run claude: ${err.message}`,
      });
    });

    child.on("close", (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: stderr.trim() || `claude exited with code ${code}`,
        });
        return;
      }

      const parsed = parseContextOutput(stdout);
      if (!parsed) {
        resolve({
          success: false,
          error: "unable to parse context output",
        });
        return;
      }

      resolve(parsed);
    });
  });
}

function parseContextAllOutput(output: string): ContextAllSuccess | null {
  const lines = output.split("\n");

  // Extract model from its own line: "**Model:** claude-opus-4-7[1m]"
  let modelId = "";
  let modelName = "";
  for (const line of lines) {
    const modelMatch = line.match(/^\*\*Model:\*\*\s*(.+)$/);
    if (modelMatch) {
      // Strip trailing context-window annotations like "[1m]"
      modelId = modelMatch[1].replace(/\[.*?\]\s*$/, "").trim();
      // Convert model ID to display name (e.g., "claude-sonnet-4-6" -> "Sonnet 4.6")
      modelName = modelId
        .replace(/^claude-/, "")
        // Join a trailing "-<major>-<minor>" version pair with a dot before splitting on
        // dashes, so "sonnet-4-6" reads as "Sonnet 4.6" instead of "Sonnet 4 6".
        .replace(/-(\d+)-(\d+)$/, " $1.$2")
        .replace(/-/g, " ")
        .split(" ")
        .filter(Boolean)
        .map((word) => (/^\d/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
        .join(" ");
      break;
    }
  }

  if (!modelId) return null;

  // Extract usage line: "**Tokens:** 24.9k / 200k (12%)" or with ~ for estimated
  let totalTokens = 0;
  let maxTokens = 0;
  let percentage = 0;
  let isEstimated = false;

  for (const line of lines) {
    if (line.includes("Tokens:") && line.includes("/")) {
      // Check for estimated indicator (~)
      isEstimated = line.includes("~");

      const tokensMatch = line.match(
        /Tokens:\**\s*~?\s*([\d.]+[kKmM]?)\s*\/\s*([\d.]+[kKmM]?)\s*\(([\d.]+)%\)/,
      );
      if (tokensMatch) {
        totalTokens = parseTokenCount(tokensMatch[1]);
        maxTokens = parseTokenCount(tokensMatch[2]);
        percentage = parseFloat(tokensMatch[3]);
      }
      break;
    }
  }

  if (totalTokens === 0 || maxTokens === 0) return null;

  // Parse the top-level "Estimated usage by category" table: | Category | Tokens | Percentage |
  const topCategories = new Map<string, { name: string; tokens: number; percentage: number }>();
  {
    let inCategoryTable = false;
    for (const line of lines) {
      if (line.includes("Estimated usage by category")) {
        inCategoryTable = true;
        continue;
      }
      if (inCategoryTable && line.startsWith("###")) break;
      if (!inCategoryTable) continue;

      const cols = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cols.length < 3) continue;
      if (cols[0] === "Category" || cols[0].startsWith("-")) continue;

      const name = cols[0];

      const tokens = parseTokenCount(cols[1]);
      const pct = parseFloat(cols[2].replace("%", "").trim());
      if (!name || isNaN(tokens) || isNaN(pct)) continue;

      topCategories.set(normalizeCategoryKey(name), { name, tokens, percentage: pct });
    }
  }

  // Parse detail sections (### MCP Tools / Custom Agents / Memory Files / Skills), each a
  // markdown table whose first column is the item name and last column is its token count.
  // These sections don't map 1:1 onto the category-breakdown rows above (e.g. a section can
  // have all-zero-token items and no corresponding summary row), so they're merged by name.
  const sectionTitles = new Map<string, string>();
  const sectionItems = new Map<string, ContextItem[]>();
  {
    let currentKey: string | null = null;
    let sectionTableStarted = false;
    for (const line of lines) {
      const sectionMatch = line.match(/^###\s+(.+)$/);
      if (sectionMatch) {
        const title = sectionMatch[1].trim();
        if (title === "Estimated usage by category") {
          currentKey = null;
          continue;
        }
        currentKey = normalizeCategoryKey(title);
        sectionTitles.set(currentKey, title);
        sectionItems.set(currentKey, []);
        sectionTableStarted = false;
        continue;
      }

      if (!currentKey) continue;

      const cols = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cols.length < 2) continue;

      if (cols[0].startsWith("-")) {
        sectionTableStarted = true; // separator row marks end of the table header
        continue;
      }
      if (!sectionTableStarted) continue; // skip the table's own header row

      const name = cols[0];
      const tokens = parseTokenCount(cols[cols.length - 1]);
      if (!name) continue;

      sectionItems.get(currentKey)?.push({ name, tokens });
    }
  }

  // Merge: every category is either a summary row, a detail section, or both.
  const keys = new Set<string>([...topCategories.keys(), ...sectionItems.keys()]);
  const categories: ContextCategory[] = [];
  for (const key of keys) {
    const top = topCategories.get(key);
    const items = sectionItems.get(key) ?? [];
    const name = top?.name ?? sectionTitles.get(key) ?? key;
    const tokens = top?.tokens ?? items.reduce((sum, item) => sum + (item.tokens ?? 0), 0);
    const pct = top?.percentage ?? (totalTokens > 0 ? (tokens / totalTokens) * 100 : 0);
    categories.push({ name, tokens, percentage: pct, items });
  }

  if (categories.length === 0) return null;

  // "Free space" represents unused capacity, not actual usage — the CLI's own terminal
  // rendering always shows it last regardless of its position in the raw table, so match that.
  categories.sort((a, b) => {
    const aIsFree = normalizeCategoryKey(a.name) === "freespace";
    const bIsFree = normalizeCategoryKey(b.name) === "freespace";
    return aIsFree === bIsFree ? 0 : aIsFree ? 1 : -1;
  });

  return {
    success: true,
    model: modelName,
    model_id: modelId,
    total_tokens: totalTokens,
    max_tokens: maxTokens,
    percentage,
    is_estimated: isEstimated,
    categories,
  };
}

export async function getContextAllResponse(): Promise<ContextAllResponse> {
  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";

    // cwd: process.env.HOME ensures we fetch global context (from ~/.claude)
    // not project-scoped context
    const child = spawn("claude", ["/context", "all"], {
      cwd: process.env.HOME,
      env: process.env,
      timeout: 20_000,
      stdio: ["ignore", "pipe", "pipe"],
    });

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    child.on("error", (err) => {
      resolve({
        success: false,
        error: err.message.includes("ENOENT")
          ? "claude CLI not available"
          : `failed to run claude: ${err.message}`,
      });
    });

    child.on("close", (code) => {
      if (code !== 0) {
        resolve({
          success: false,
          error: stderr.trim() || `claude exited with code ${code}`,
        });
        return;
      }

      const parsed = parseContextAllOutput(stdout);
      if (!parsed) {
        resolve({
          success: false,
          error: "unable to parse context all output",
        });
        return;
      }

      resolve(parsed);
    });
  });
}
