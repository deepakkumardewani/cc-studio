export type ControlType = "toggle" | "select" | "input" | "json";

export type SelectOption = {
  value: string;
  label: string;
};

export type FieldMetadata = {
  key: string;
  label: string;
  description: string;
  control: ControlType;
  options?: SelectOption[];
};

export const SETTINGS_FIELD_METADATA: FieldMetadata[] = [
  {
    key: "apiKeyHelper",
    label: "Api Key Helper",
    description:
      "Path to a script that outputs authentication values. See https://code.claude.com/docs/en/settings#available-settings",
    control: "input",
  },
  {
    key: "autoMemoryEnabled",
    label: "Auto Memory Enabled",
    description:
      "Enable automatic memory saves that capture useful context to .claude/memory/. Also configurable via CLAUDE_CODE_DISABLE_AUTO_MEMORY environment variable (set to 1 to disable, 0 to enable). See https://code.claude.com/docs/en/memory#auto-memory",
    control: "toggle",
  },
  {
    key: "autoUpdatesChannel",
    label: "Auto Updates Channel",
    description:
      'Release channel to follow for updates. Use "stable" for a version that is typically about one week old and skips versions with major regressions, or "latest" (default) for the most recent release. Set DISABLE_AUTOUPDATER=1 to disable background auto-updates, or DISABLE_UPDATES=1 (added in v2.1.118) to block all update paths including manual `claude update`.',
    control: "select",
    options: [
      {
        value: "stable",
        label: "stable",
      },
      {
        value: "latest",
        label: "latest",
      },
    ],
  },
  {
    key: "awsCredentialExport",
    label: "Aws Credential Export",
    description:
      "Path to a script that exports AWS credentials. See https://code.claude.com/docs/en/settings#available-settings",
    control: "input",
  },
  {
    key: "awsAuthRefresh",
    label: "Aws Auth Refresh",
    description:
      "Path to a script that refreshes AWS authentication. See https://code.claude.com/docs/en/settings#available-settings",
    control: "input",
  },
  {
    key: "claudeMdExcludes",
    label: "Claude Md Excludes",
    description:
      "Glob patterns for CLAUDE.md files to exclude from loading. Useful in monorepos to skip irrelevant instructions from other teams. Patterns match against absolute file paths. Arrays merge across settings layers. Managed policy CLAUDE.md files cannot be excluded. See https://code.claude.com/docs/en/memory#exclude-specific-claude-md-files",
    control: "json",
  },
  {
    key: "cleanupPeriodDays",
    label: "Cleanup Period Days",
    description:
      "Number of days to retain sessions, orphaned subagent worktrees, tasks, shell snapshots, and backups. Minimum is 1; setting 0 is rejected with a validation error. See https://code.claude.com/docs/en/settings#available-settings",
    control: "input",
  },
  {
    key: "env",
    label: "Env",
    description:
      "Environment variables to set for Claude Code sessions. Many environment variables provide settings dimensions not available as dedicated settings.json properties (e.g., thinking tokens, prompt caching, bash timeouts, shell configuration). See https://code.claude.com/docs/en/settings#environment-variables for the full list.",
    control: "json",
  },
  {
    key: "attribution",
    label: "Attribution",
    description:
      "Customize attribution for git commits and pull requests. See https://code.claude.com/docs/en/settings#attribution-settings",
    control: "json",
  },
  {
    key: "includeGitInstructions",
    label: "Include Git Instructions",
    description:
      "Include built-in git commit and PR workflow instructions in Claude's system prompt. Also configurable via CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS environment variable (set to 1 to disable). See https://code.claude.com/docs/en/settings#available-settings",
    control: "toggle",
  },
  {
    key: "includeCoAuthoredBy",
    label: "Include Co Authored By",
    description:
      "DEPRECATED. Use 'attribution' instead. Whether to include the co-authored-by Claude byline in git commits and pull requests (default: true)",
    control: "toggle",
  },
  {
    key: "plansDirectory",
    label: "Plans Directory",
    description:
      "Customize where plan files are stored. Path is relative to project root (default: ~/.claude/plans)",
    control: "input",
  },
  {
    key: "respectGitignore",
    label: "Respect Gitignore",
    description:
      "Control whether the @ file picker respects .gitignore patterns. When true (default), files matching .gitignore patterns are excluded from suggestions",
    control: "toggle",
  },
  {
    key: "permissions",
    label: "Permissions",
    description:
      "Tool usage permissions configuration. See https://code.claude.com/docs/en/permissions and https://code.claude.com/docs/en/settings#permission-settings See https://code.claude.com/docs/en/tools-reference for full list of tools available to Claude.",
    control: "json",
  },
  {
    key: "language",
    label: "Language",
    description:
      'Configure Claude\'s preferred response language (e.g., "japanese", "spanish", "french"). Claude will respond in this language by default. Also sets the voice dictation language and terminal tab session title generation. See https://code.claude.com/docs/en/settings#available-settings',
    control: "input",
  },
  {
    key: "model",
    label: "Model",
    description:
      "Override the default model used by Claude Code. For finer control, use environment variables: ANTHROPIC_MODEL (runtime override), ANTHROPIC_DEFAULT_OPUS_MODEL, ANTHROPIC_DEFAULT_SONNET_MODEL, ANTHROPIC_DEFAULT_HAIKU_MODEL (per-class pinning), CLAUDE_CODE_SUBAGENT_MODEL (subagent model). See https://code.claude.com/docs/en/model-config",
    control: "input",
  },
  {
    key: "availableModels",
    label: "Available Models",
    description:
      "Restrict which models users can select. When defined at multiple settings levels (user, project, etc.), arrays are merged and deduplicated. See https://code.claude.com/docs/en/model-config#restrict-model-selection",
    control: "json",
  },
  {
    key: "modelOverrides",
    label: "Model Overrides",
    description:
      "Map Anthropic model IDs to provider-specific model IDs such as Bedrock inference profile ARNs, Vertex AI version names, or Foundry deployment names. Each model picker entry uses its mapped value when calling the provider API. Unknown keys are ignored. See https://code.claude.com/docs/en/model-config#override-model-ids-per-version",
    control: "json",
  },
  {
    key: "effortLevel",
    label: "Effort Level",
    description:
      "Persist adaptive reasoning effort across sessions. Effort is supported on Opus 4.7, Opus 4.6, and Sonnet 4.6. Opus 4.7 supports low/medium/high/xhigh/max (xhigh sits between high and max, added in v2.1.111); Opus 4.6 and Sonnet 4.6 support low/medium/high/max (xhigh falls back to high). Defaults: Opus 4.6 and Sonnet 4.6 default to high on all plans (Pro/Max raised from medium to high in v2.1.117); Opus 4.7 defaults to xhigh on Max plan. The max value is session-only unless set via CLAUDE_CODE_EFFORT_LEVEL. Use /effort auto to reset to model default. Also configurable via CLAUDE_CODE_EFFORT_LEVEL environment variable. See https://code.claude.com/docs/en/model-config#adjust-effort-level",
    control: "select",
    options: [
      {
        value: "low",
        label: "low",
      },
      {
        value: "medium",
        label: "medium",
      },
      {
        value: "high",
        label: "high",
      },
      {
        value: "xhigh",
        label: "xhigh",
      },
      {
        value: "max",
        label: "max",
      },
    ],
  },
  {
    key: "fastMode",
    label: "Fast Mode",
    description:
      "Enable fast mode, which uses Claude Opus 4.7 by default for 2.5x faster output at higher per-token cost. Requires extra usage enabled. Toggle with /fast command. Set CLAUDE_CODE_OPUS_4_6_FAST_MODE_OVERRIDE=1 to pin fast mode to Opus 4.6. See https://code.claude.com/docs/en/fast-mode",
    control: "toggle",
  },
  {
    key: "fastModePerSessionOptIn",
    label: "Fast Mode Per Session Opt In",
    description:
      "Require per-session opt-in for fast mode. When true, fast mode does not persist across sessions and users must enable it with /fast each session. Useful for controlling costs. See https://code.claude.com/docs/en/fast-mode",
    control: "toggle",
  },
  {
    key: "feedbackSurveyRate",
    label: "Feedback Survey Rate",
    description:
      "Probability (0–1) that the session quality survey appears when eligible. A value of 0.05 means 5% of eligible sessions. See https://code.claude.com/docs/en/settings#available-settings",
    control: "input",
  },
  {
    key: "enableAllProjectMcpServers",
    label: "Enable All Project Mcp Servers",
    description:
      "Whether to automatically approve all MCP servers in the project. See https://code.claude.com/docs/en/mcp",
    control: "toggle",
  },
  {
    key: "enabledMcpjsonServers",
    label: "Enabled Mcpjson Servers",
    description:
      "List of approved MCP servers from .mcp.json. See https://code.claude.com/docs/en/mcp",
    control: "json",
  },
  {
    key: "disabledMcpjsonServers",
    label: "Disabled Mcpjson Servers",
    description:
      "List of rejected MCP servers from .mcp.json. See https://code.claude.com/docs/en/mcp",
    control: "json",
  },
  {
    key: "allowedMcpServers",
    label: "Allowed Mcp Servers",
    description:
      "Enterprise allowlist of MCP servers that can be used. Applies to all scopes including enterprise servers from managed-mcp.json. If undefined, all servers are allowed. If empty array, no servers are allowed. Denylist takes precedence - if a server is on both lists, it is denied. See https://code.claude.com/docs/en/mcp#restriction-options",
    control: "json",
  },
  {
    key: "deniedMcpServers",
    label: "Denied Mcp Servers",
    description:
      "Enterprise denylist of MCP servers that are explicitly blocked. If a server is on the denylist, it will be blocked across all scopes including enterprise. Denylist takes precedence over allowlist - if a server is on both lists, it is denied. See https://code.claude.com/docs/en/mcp#restriction-options",
    control: "json",
  },
  {
    key: "httpHookAllowedEnvVars",
    label: "Http Hook Allowed Env Vars",
    description:
      "Allowlist of environment variable names HTTP hooks may interpolate into headers. When set, each hook's effective allowedEnvVars is the intersection with this list. Undefined = no restriction. Arrays merge across settings sources. See https://code.claude.com/docs/en/settings#hook-configuration",
    control: "json",
  },
  {
    key: "hooks",
    label: "Hooks",
    description:
      "Custom commands to run before/after tool executions. See https://code.claude.com/docs/en/hooks",
    control: "json",
  },
  {
    key: "disableAllHooks",
    label: "Disable All Hooks",
    description:
      "Disable all hooks and statusLine execution. When true in managed settings, user and project-level disableAllHooks cannot override it. See https://code.claude.com/docs/en/hooks#disable-or-remove-hooks",
    control: "toggle",
  },
  {
    key: "allowedChannelPlugins",
    label: "Allowed Channel Plugins",
    description:
      "(Managed settings only) Allowlist of plugin IDs whose MCP servers may advertise channel notifications when channelsEnabled is true. When set, only the listed plugins can push inbound messages. See https://code.claude.com/docs/en/mcp",
    control: "json",
  },
  {
    key: "allowedHttpHookUrls",
    label: "Allowed Http Hook Urls",
    description:
      "Allowlist of URL patterns that HTTP hooks may target. Supports * as a wildcard. When set, hooks with non-matching URLs are blocked. Undefined = no restriction, empty array = block all HTTP hooks. Arrays merge across settings sources. See https://code.claude.com/docs/en/settings#hook-configuration",
    control: "json",
  },
  {
    key: "allowManagedHooksOnly",
    label: "Allow Managed Hooks Only",
    description:
      "(Managed settings only) Prevent loading of user, project, and plugin hooks. Only allows managed hooks and SDK hooks. See https://code.claude.com/docs/en/settings#hook-configuration",
    control: "toggle",
  },
  {
    key: "allowManagedPermissionRulesOnly",
    label: "Allow Managed Permission Rules Only",
    description:
      "(Managed settings only) Prevent user and project settings from defining allow, ask, or deny permission rules. Only rules in managed settings apply. See https://code.claude.com/docs/en/settings#permission-settings",
    control: "toggle",
  },
  {
    key: "statusLine",
    label: "Status Line",
    description:
      "Custom status line display configuration. See https://code.claude.com/docs/en/statusline",
    control: "json",
  },
  {
    key: "fileSuggestion",
    label: "File Suggestion",
    description:
      "Configure a custom script for @ file autocomplete. See https://code.claude.com/docs/en/settings#file-suggestion-settings",
    control: "json",
  },
  {
    key: "enabledPlugins",
    label: "Enabled Plugins",
    description:
      'Enabled plugins using plugin-id@marketplace-id format. Example: { "formatter@anthropic-tools": true }. See https://code.claude.com/docs/en/plugins',
    control: "json",
  },
  {
    key: "extraKnownMarketplaces",
    label: "Extra Known Marketplaces",
    description:
      "Additional marketplaces to make available for this repository. Typically used in repository .claude/settings.json to ensure team members have required plugin sources. See https://code.claude.com/docs/en/plugin-marketplaces",
    control: "json",
  },
  {
    key: "strictKnownMarketplaces",
    label: "Strict Known Marketplaces",
    description:
      "(Managed settings only) Allowlist of plugin marketplaces users can add. Undefined = no restrictions, empty array = lockdown. Uses exact matching for source specifications. See https://code.claude.com/docs/en/settings#strictknownmarketplaces",
    control: "json",
  },
  {
    key: "skippedMarketplaces",
    label: "Skipped Marketplaces",
    description: "List of marketplace names the user has chosen not to install when prompted",
    control: "json",
  },
  {
    key: "skippedPlugins",
    label: "Skipped Plugins",
    description:
      "List of plugin IDs (plugin@marketplace format) the user has chosen not to install when prompted",
    control: "json",
  },
  {
    key: "forceLoginMethod",
    label: "Force Login Method",
    description:
      'Force a specific login method: "claudeai" for Claude Pro/Max, "console" for Console billing',
    control: "select",
    options: [
      {
        value: "claudeai",
        label: "claudeai",
      },
      {
        value: "console",
        label: "console",
      },
    ],
  },
  {
    key: "forceLoginOrgUUID",
    label: "Force Login Org U U I D",
    description: "Organization UUID to use for OAuth login",
    control: "input",
  },
  {
    key: "otelHeadersHelper",
    label: "Otel Headers Helper",
    description: "Path to a script that outputs OpenTelemetry headers",
    control: "input",
  },
  {
    key: "outputStyle",
    label: "Output Style",
    description:
      "Controls the output style for assistant responses. Built-in styles: default, Explanatory, Learning. Custom styles can be added in ~/.claude/output-styles/ or .claude/output-styles/. See https://code.claude.com/docs/en/output-styles",
    control: "input",
  },
  {
    key: "skipWebFetchPreflight",
    label: "Skip Web Fetch Preflight",
    description:
      "Skip the WebFetch blocklist check for enterprise environments with restrictive security policies. See https://code.claude.com/docs/en/settings#available-settings",
    control: "toggle",
  },
  {
    key: "sandbox",
    label: "Sandbox",
    description: "Sandbox execution configuration. See https://code.claude.com/docs/en/sandboxing",
    control: "json",
  },
  {
    key: "spinnerVerbs",
    label: "Spinner Verbs",
    description: "Customize the verbs shown in spinner progress messages",
    control: "json",
  },
  {
    key: "spinnerTipsEnabled",
    label: "Spinner Tips Enabled",
    description:
      "Show tips in the spinner while Claude is working. Set to false to disable tips (default: true)",
    control: "toggle",
  },
  {
    key: "spinnerTipsOverride",
    label: "Spinner Tips Override",
    description:
      "Customize the tips displayed in the spinner while Claude is working. See https://code.claude.com/docs/en/settings#available-settings",
    control: "json",
  },
  {
    key: "terminalProgressBarEnabled",
    label: "Terminal Progress Bar Enabled",
    description:
      "Enable the terminal progress bar that shows progress in supported terminals like Windows Terminal and iTerm2 (default: true)",
    control: "toggle",
  },
  {
    key: "showTurnDuration",
    label: "Show Turn Duration",
    description:
      'Show turn duration messages after responses (e.g., "Cooked for 1m 6s"). Set to false to hide these messages (default: true)',
    control: "toggle",
  },
  {
    key: "skillOverrides",
    label: "Skill Overrides",
    description:
      "Per-skill visibility overrides. Controls whether skills appear to Claude and in the / picker. Values: 'on' (name and description shown, default), 'name-only' (name only), 'user-invocable-only' (hidden from Claude, visible in /), 'off' (hidden everywhere). Plugin skills are not affected by this setting. See https://code.claude.com/docs/en/skills#override-skill-visibility-from-settings",
    control: "json",
  },
  {
    key: "prefersReducedMotion",
    label: "Prefers Reduced Motion",
    description:
      "Reduce or disable UI animations (spinners, shimmer, flash effects) for accessibility",
    control: "toggle",
  },
  {
    key: "prUrlTemplate",
    label: "Pr Url Template",
    description:
      "URL template for the PR badge shown in the footer and in tool-result summaries. Substitutes placeholders {host}, {owner}, {repo}, {number}, {url} from the gh-reported PR URL. Use this to point PR links at an internal code-review tool instead of github.com. Does not affect #123 autolinks in Claude's prose. See https://code.claude.com/docs/en/settings#available-settings",
    control: "input",
  },
  {
    key: "alwaysThinkingEnabled",
    label: "Always Thinking Enabled",
    description:
      "Enable extended thinking by default for all sessions. Typically configured via the /config command rather than editing directly. See https://code.claude.com/docs/en/common-workflows#use-extended-thinking-thinking-mode",
    control: "toggle",
  },
  {
    key: "companyAnnouncements",
    label: "Company Announcements",
    description:
      "Company announcements to display at startup (one will be randomly selected if multiple are provided)",
    control: "json",
  },
  {
    key: "teammateMode",
    label: "Teammate Mode",
    description:
      'How agent team teammates display: "auto" picks split panes in tmux or iTerm2, in-process otherwise. Agent teams are experimental and disabled by default. Enable them by adding CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS to your settings.json or environment. See https://code.claude.com/docs/en/agent-teams',
    control: "select",
    options: [
      {
        value: "auto",
        label: "auto",
      },
      {
        value: "in-process",
        label: "in-process",
      },
      {
        value: "tmux",
        label: "tmux",
      },
    ],
  },
  {
    key: "worktree",
    label: "Worktree",
    description:
      "Configuration for --worktree sessions. See https://code.claude.com/docs/en/settings#worktree-settings",
    control: "json",
  },
  {
    key: "parentSettingsBehavior",
    label: "Parent Settings Behavior",
    description:
      "(Admin/managed settings only) Controls how SDK managedSettings (parent tier) merge with inherited settings. 'first-wins': first non-empty value applies (default). 'merge': merge arrays and objects. See https://code.claude.com/docs/en/server-managed-settings",
    control: "select",
    options: [
      {
        value: "first-wins",
        label: "first-wins",
      },
      {
        value: "merge",
        label: "merge",
      },
    ],
  },
  {
    key: "pluginTrustMessage",
    label: "Plugin Trust Message",
    description:
      "(Managed settings only) Custom message appended to the plugin trust warning shown before installation. Use to provide organization-specific context about approved plugins. See https://code.claude.com/docs/en/settings#plugin-settings",
    control: "input",
  },
  {
    key: "pluginConfigs",
    label: "Plugin Configs",
    description:
      "Per-plugin configuration including MCP server user configs and plugin options, keyed by plugin ID (plugin@marketplace format). See https://code.claude.com/docs/en/plugins",
    control: "json",
  },
  {
    key: "allowManagedMcpServersOnly",
    label: "Allow Managed Mcp Servers Only",
    description:
      "(Managed settings only) Only allowedMcpServers from managed settings are respected. deniedMcpServers still merges from all sources. Users can still add their own MCP servers, but only the admin-defined allowlist applies.",
    control: "toggle",
  },
  {
    key: "blockedMarketplaces",
    label: "Blocked Marketplaces",
    description:
      "(Managed settings only) Blocklist of marketplace sources. These exact sources are blocked from being added as marketplaces. The check happens before downloading, so blocked sources never touch the filesystem.",
    control: "json",
  },
  {
    key: "agent",
    label: "Agent",
    description:
      "Name of an agent (built-in or custom) to use for the main thread. Applies the agent's system prompt, tool restrictions, and model. See https://code.claude.com/docs/en/sub-agents",
    control: "input",
  },
  {
    key: "autoMemoryDirectory",
    label: "Auto Memory Directory",
    description:
      "Custom directory path for auto-memory storage. Supports ~/ prefix for home-directory expansion. Ignored if set in checked-in project settings (.claude/settings.json) for security. Defaults to ~/.claude/projects/<sanitized-cwd>/memory/ when unset. See https://code.claude.com/docs/en/memory",
    control: "input",
  },
  {
    key: "autoMode",
    label: "Auto Mode",
    description:
      'Customization for the auto mode classifier prompt. Typically configured in managed settings to tune the allow/deny rules used when permissions.defaultMode is "auto". By default, allow, soft_deny, and environment REPLACE the corresponding built-in classifier section entirely. Include the literal string "$defaults" as an array entry (added in v2.1.118) to splice the built-in defaults in at that position alongside your custom rules. See https://code.claude.com/docs/en/permissions',
    control: "json",
  },
  {
    key: "channelsEnabled",
    label: "Channels Enabled",
    description:
      "(Teams/Enterprise) Opt-in for channel notifications — MCP servers with the claude/channel capability pushing inbound messages. Default off. When true, users can select servers via --channels. See https://code.claude.com/docs/en/mcp",
    control: "toggle",
  },
  {
    key: "defaultShell",
    label: "Default Shell",
    description:
      'Default shell for input-box ! commands. Default: bash. Using "powershell" routes ! commands through PowerShell on Windows and requires CLAUDE_CODE_USE_POWERSHELL_TOOL=1 with pwsh on PATH. See https://code.claude.com/docs/en/settings#available-settings',
    control: "select",
    options: [
      {
        value: "bash",
        label: "bash",
      },
      {
        value: "powershell",
        label: "powershell",
      },
    ],
  },
  {
    key: "disableDeepLinkRegistration",
    label: "Disable Deep Link Registration",
    description:
      'Set to "disable" to prevent Claude Code from registering the `claude://` deep-link protocol handler on startup. Most useful in managed settings where users cannot override it. See https://code.claude.com/docs/en/settings#available-settings',
    control: "select",
    options: [
      {
        value: "disable",
        label: "disable",
      },
    ],
  },
  {
    key: "disableSkillShellExecution",
    label: "Disable Skill Shell Execution",
    description:
      "Disable inline shell execution for `` !`...` `` and ` ```! ` blocks in skills and custom slash commands from user, project, plugin, or additional-directory sources. Commands are replaced with [shell command execution disabled by policy] instead of being run. Bundled and managed skills are not affected. Most useful in managed settings where users cannot override it. See https://code.claude.com/docs/en/settings#available-settings",
    control: "toggle",
  },
  {
    key: "forceRemoteSettingsRefresh",
    label: "Force Remote Settings Refresh",
    description:
      "(Managed settings only) Block CLI startup until remote managed settings are freshly fetched from the server. If the fetch fails, the CLI exits (fail-closed) rather than continuing with cached settings. When not set, startup continues without waiting for remote settings. See https://code.claude.com/docs/en/server-managed-settings",
    control: "toggle",
  },
  {
    key: "minimumVersion",
    label: "Minimum Version",
    description:
      "Minimum Claude Code version to stay on. Prevents downgrades when switching release channels. See https://code.claude.com/docs/en/settings#available-settings",
    control: "input",
  },
  {
    key: "showClearContextOnPlanAccept",
    label: "Show Clear Context On Plan Accept",
    description:
      'When true, the plan-approval dialog offers a "clear context" option. Defaults to false.',
    control: "toggle",
  },
  {
    key: "showThinkingSummaries",
    label: "Show Thinking Summaries",
    description:
      "Show thinking summaries in the transcript view (Ctrl+O). Thinking summaries are not generated by default in interactive sessions; set to true to restore. See https://code.claude.com/docs/en/settings#available-settings",
    control: "toggle",
  },
  {
    key: "skipDangerousModePermissionPrompt",
    label: "Skip Dangerous Mode Permission Prompt",
    description:
      "Whether the user has accepted the bypass permissions mode dialog. Typically managed by the CLI rather than set by hand.",
    control: "toggle",
  },
  {
    key: "strictPluginOnlyCustomization",
    label: "Strict Plugin Only Customization",
    description:
      '(Managed settings) Block non-plugin customization sources for the listed surfaces. Array form locks specific surfaces (e.g., ["skills", "hooks"]); true locks all four; false is an explicit no-op. See https://code.claude.com/docs/en/plugins-reference',
    control: "json",
  },
  {
    key: "tui",
    label: "Tui",
    description:
      'TUI rendering mode. Use "fullscreen" for the flicker-free alt-screen renderer with virtualized scrollback; "default" for the classic main-screen renderer. Corresponds to the /tui command. See https://code.claude.com/docs/en/settings#available-settings',
    control: "select",
    options: [
      {
        value: "fullscreen",
        label: "fullscreen",
      },
      {
        value: "default",
        label: "default",
      },
    ],
  },
  {
    key: "viewMode",
    label: "View Mode",
    description:
      'Transcript view mode. "default" shows standard interactive view; "verbose" shows expanded tool details; "focus" shows prompt, one-line tool summaries, and final response only (Ctrl+O toggle). See https://code.claude.com/docs/en/settings#available-settings',
    control: "select",
    options: [
      {
        value: "default",
        label: "default",
      },
      {
        value: "verbose",
        label: "verbose",
      },
      {
        value: "focus",
        label: "focus",
      },
    ],
  },
  {
    key: "useAutoModeDuringPlan",
    label: "Use Auto Mode During Plan",
    description:
      "When true, apply the auto mode classifier during plan mode to auto-approve safe read-only tool calls while planning. Has no effect unless permissions.defaultMode allows auto. See https://code.claude.com/docs/en/permissions",
    control: "toggle",
  },
  {
    key: "voiceEnabled",
    label: "Voice Enabled",
    description:
      "Enable push-to-talk voice dictation. Typically written automatically when /voice is used. Requires a Claude.ai account. See https://code.claude.com/docs/en/settings#available-settings",
    control: "toggle",
  },
  {
    key: "wslInheritsWindowsSettings",
    label: "Wsl Inherits Windows Settings",
    description:
      "(Windows managed settings only) When true, Claude Code on WSL reads managed settings from the Windows policy chain in addition to /etc/claude-code, with Windows sources taking priority. Only honored when set in the HKLM registry key or C:\\Program Files\\ClaudeCode\\managed-settings.json, both of which require Windows admin to write. For HKCU policy to also apply on WSL, the flag must additionally be set in HKCU itself. Has no effect on native Windows. See https://code.claude.com/docs/en/settings#available-settings",
    control: "toggle",
  },
  {
    key: "subagentStatusLine",
    label: "Subagent Status Line",
    description:
      "Status line configuration for subagent sessions. See https://code.claude.com/docs/en/statusline#subagent-status-lines",
    control: "json",
  },
];

export function getSettingsFieldMetadata(): FieldMetadata[] {
  return SETTINGS_FIELD_METADATA;
}
