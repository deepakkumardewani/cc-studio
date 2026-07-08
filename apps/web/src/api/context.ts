export type ContextItem = {
  name: string;
  tokens?: number;
};

export type ContextCategory = {
  name: string;
  tokens: number;
  percentage: number;
  items?: ContextItem[];
};

export type ContextDetails = {
  model: string; // e.g., "Sonnet 4.6"
  model_id: string; // e.g., "claude-sonnet-4-6"
  total_tokens: number;
  max_tokens: number;
  percentage: number;
  is_estimated: boolean;
  categories: ContextCategory[];
};

export type ContextDetailsResponse =
  | { success: true; data: ContextDetails }
  | { success: false; error: string };

/**
 * Fetch context details from /api/context/all endpoint.
 * Returns real global context data including model, tokens, and category breakdown.
 */
export async function fetchContextDetails(): Promise<ContextDetailsResponse> {
  try {
    const response = await fetch("/api/context/all");
    const json = await response.json();
    if (!response.ok || !json.success) {
      return { success: false, error: json.error || "Failed to fetch" };
    }
    return { success: true, data: json };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch context details",
    };
  }
}
