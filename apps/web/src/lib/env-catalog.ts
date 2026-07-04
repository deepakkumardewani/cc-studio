export type EnvVarDef = {
  name: string;
  category: string;
  description: string;
  example: string;
  /** 0/1 flag — the value editor offers a 1 / 0 choice. */
  flag?: boolean;
  /** Fixed set of allowed values — rendered as a dropdown. */
  options?: string[];
};

/**
 * A curated set of the most useful Claude Code environment variables. Not exhaustive —
 * users can still add any custom variable by name. See https://code.claude.com/docs/en/env-vars.
 */
export const ENV_VAR_CATALOG: EnvVarDef[] = [
  // Model & reasoning
  {
    name: "ANTHROPIC_MODEL",
    category: "Model & reasoning",
    description: "Model used for the main session (overrides the model setting).",
    example: "claude-opus-4-6",
  },
  {
    name: "ANTHROPIC_DEFAULT_OPUS_MODEL",
    category: "Model & reasoning",
    description: "Pin the Opus-class model in the picker.",
    example: "claude-opus-4-6",
  },
  {
    name: "ANTHROPIC_DEFAULT_SONNET_MODEL",
    category: "Model & reasoning",
    description: "Pin the Sonnet-class model in the picker.",
    example: "claude-sonnet-4-6",
  },
  {
    name: "ANTHROPIC_DEFAULT_HAIKU_MODEL",
    category: "Model & reasoning",
    description: "Pin the Haiku-class model in the picker.",
    example: "claude-haiku-4-5",
  },
  {
    name: "CLAUDE_CODE_SUBAGENT_MODEL",
    category: "Model & reasoning",
    description: "Model used for subagents dispatched during a session.",
    example: "claude-sonnet-4-6",
  },
  {
    name: "MAX_THINKING_TOKENS",
    category: "Model & reasoning",
    description: "Extended-thinking token budget. Set to 0 to disable thinking.",
    example: "31999",
  },
  {
    name: "CLAUDE_CODE_EFFORT_LEVEL",
    category: "Model & reasoning",
    description: "Persisted adaptive reasoning effort.",
    example: "high",
    options: ["low", "medium", "high", "xhigh", "max"],
  },
  {
    name: "CLAUDE_CODE_MAX_OUTPUT_TOKENS",
    category: "Model & reasoning",
    description: "Maximum output tokens Claude may generate per response.",
    example: "8192",
  },

  // Authentication & routing
  {
    name: "ANTHROPIC_API_KEY",
    category: "Auth & routing",
    description: "API key sent as the X-Api-Key header (overrides your subscription).",
    example: "sk-ant-…",
  },
  {
    name: "ANTHROPIC_AUTH_TOKEN",
    category: "Auth & routing",
    description: "Custom value for the Authorization header (prefixed with Bearer).",
    example: "my-gateway-token",
  },
  {
    name: "ANTHROPIC_BASE_URL",
    category: "Auth & routing",
    description: "Route API requests through a proxy or LLM gateway.",
    example: "https://gateway.example.com",
  },
  {
    name: "ANTHROPIC_CUSTOM_HEADERS",
    category: "Auth & routing",
    description: "Extra request headers in Name: Value form (newline-separated).",
    example: "X-Team: platform",
  },
  {
    name: "ANTHROPIC_BETAS",
    category: "Auth & routing",
    description: "Comma-separated anthropic-beta header values to opt into.",
    example: "context-1m-2025-08-07",
  },

  // Providers
  {
    name: "CLAUDE_CODE_USE_BEDROCK",
    category: "Providers",
    description: "Route requests through Amazon Bedrock.",
    example: "1",
    flag: true,
  },
  {
    name: "CLAUDE_CODE_USE_VERTEX",
    category: "Providers",
    description: "Route requests through Google Vertex AI.",
    example: "1",
    flag: true,
  },
  {
    name: "AWS_REGION",
    category: "Providers",
    description: "AWS region used when routing through Bedrock.",
    example: "us-east-1",
  },
  {
    name: "CLOUD_ML_REGION",
    category: "Providers",
    description: "Region used when routing through Vertex AI.",
    example: "us-east5",
  },
  {
    name: "ANTHROPIC_VERTEX_PROJECT_ID",
    category: "Providers",
    description: "Google Cloud project ID for Vertex AI requests.",
    example: "my-gcp-project",
  },

  // Timeouts & limits
  {
    name: "API_TIMEOUT_MS",
    category: "Timeouts & limits",
    description: "Overall timeout for a single API request.",
    example: "1200000",
  },
  {
    name: "BASH_DEFAULT_TIMEOUT_MS",
    category: "Timeouts & limits",
    description: "Default timeout for Bash tool commands.",
    example: "300000",
  },
  {
    name: "BASH_MAX_TIMEOUT_MS",
    category: "Timeouts & limits",
    description: "Maximum timeout the model may set for a Bash command.",
    example: "600000",
  },
  {
    name: "BASH_MAX_OUTPUT_LENGTH",
    category: "Timeouts & limits",
    description: "Characters of Bash output kept before truncation.",
    example: "30000",
  },
  {
    name: "MCP_TIMEOUT",
    category: "Timeouts & limits",
    description: "Timeout for MCP server startup.",
    example: "30000",
  },
  {
    name: "MCP_TOOL_TIMEOUT",
    category: "Timeouts & limits",
    description: "Timeout for a single MCP tool call.",
    example: "60000",
  },
  {
    name: "MAX_MCP_OUTPUT_TOKENS",
    category: "Timeouts & limits",
    description: "Maximum tokens allowed in an MCP tool response.",
    example: "25000",
  },

  // Features & behavior
  {
    name: "CLAUDE_CODE_DISABLE_AUTO_MEMORY",
    category: "Features & behavior",
    description: "Disable automatic memory saves (1 disable, 0 enable).",
    example: "1",
    flag: true,
  },
  {
    name: "CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS",
    category: "Features & behavior",
    description: "Drop built-in git commit/PR instructions from the system prompt.",
    example: "1",
    flag: true,
  },
  {
    name: "DISABLE_AUTOUPDATER",
    category: "Features & behavior",
    description: "Disable background auto-updates.",
    example: "1",
    flag: true,
  },
  {
    name: "DISABLE_UPDATES",
    category: "Features & behavior",
    description: "Block all update paths, including manual claude update.",
    example: "1",
    flag: true,
  },
  {
    name: "CLAUDE_CODE_DISABLE_TERMINAL_TITLE",
    category: "Features & behavior",
    description: "Stop Claude Code from updating the terminal tab title.",
    example: "1",
    flag: true,
  },
  {
    name: "DISABLE_COST_WARNINGS",
    category: "Features & behavior",
    description: "Hide cost-warning messages during a session.",
    example: "1",
    flag: true,
  },
  {
    name: "DISABLE_NON_ESSENTIAL_MODEL_CALLS",
    category: "Features & behavior",
    description: "Skip non-essential model calls such as flavor text.",
    example: "1",
    flag: true,
  },

  // Telemetry & privacy
  {
    name: "DISABLE_TELEMETRY",
    category: "Telemetry & privacy",
    description: "Opt out of usage telemetry.",
    example: "1",
    flag: true,
  },
  {
    name: "DISABLE_ERROR_REPORTING",
    category: "Telemetry & privacy",
    description: "Opt out of error reporting.",
    example: "1",
    flag: true,
  },
  {
    name: "CLAUDE_CODE_ENABLE_TELEMETRY",
    category: "Telemetry & privacy",
    description: "Enable OpenTelemetry metrics and events export.",
    example: "1",
    flag: true,
  },
  {
    name: "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC",
    category: "Telemetry & privacy",
    description: "Disable all non-essential network calls in one switch.",
    example: "1",
    flag: true,
  },

  // Network
  {
    name: "HTTP_PROXY",
    category: "Network",
    description: "Proxy URL for outbound HTTP requests.",
    example: "http://proxy.internal:8080",
  },
  {
    name: "HTTPS_PROXY",
    category: "Network",
    description: "Proxy URL for outbound HTTPS requests.",
    example: "http://proxy.internal:8080",
  },
  {
    name: "NO_PROXY",
    category: "Network",
    description: "Comma-separated hosts that bypass the proxy.",
    example: "localhost,127.0.0.1",
  },
];

export const ENV_VAR_BY_NAME = new Map(ENV_VAR_CATALOG.map((entry) => [entry.name, entry]));

export function searchEnvCatalog(query: string, exclude: Set<string>): EnvVarDef[] {
  const normalized = query.trim().toLowerCase();
  return ENV_VAR_CATALOG.filter((entry) => {
    if (exclude.has(entry.name)) {
      return false;
    }
    if (!normalized) {
      return true;
    }
    return (
      entry.name.toLowerCase().includes(normalized) ||
      entry.description.toLowerCase().includes(normalized) ||
      entry.category.toLowerCase().includes(normalized)
    );
  });
}
