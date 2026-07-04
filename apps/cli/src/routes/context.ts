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

// Parses a compact token string like "7.3k", "10.6k", "516", "140.7k" into a number
function parseTokenCount(raw: string): number {
  const s = raw.trim().replace(/,/g, "");
  if (s.endsWith("k") || s.endsWith("K")) {
    return Math.round(parseFloat(s) * 1000);
  }
  return parseInt(s, 10);
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

    const child = spawn("claude", ["/context"], {
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
