"use client";

import React from "react";
import { Link } from "@/components/link";
import { CodeBlock } from "@/components/code-block";
import { cn } from "@heroui/styles";
import { MCP_SERVER_NAME } from "@/config/mcp";

export type ClientId =
  | "claude-code"
  | "cursor"
  | "vscode"
  | "codex"
  | "grok"
  | "kimi-code"
  | "gemini"
  | "antigravity"
  | "opencode";

type ClientDefinition = Record<ClientId, string>;

export const CLIENTS: ClientDefinition = {
  "claude-code": "Claude Code",
  cursor: "Cursor",
  vscode: "VS Code",
  codex: "Codex",
  grok: "Grok",
  "kimi-code": "Kimi Code",
  gemini: "Gemini CLI",
  antigravity: "Antigravity",
  opencode: "OpenCode",
} as const;

export interface StepItem {
  number: number;
  title: string;
  description: React.ReactNode;
  code?: string;
  content?: React.ReactNode;
  subtext?: React.ReactNode;
}

const Help = ({ client }: { client: ClientId }) => {
  const url: Record<ClientId, string> = {
    "claude-code": "https://code.claude.com/docs/en/mcp",
    cursor: "https://cursor.com/docs/mcp",
    vscode: "https://code.visualstudio.com/docs/copilot/chat/mcp-servers",
    codex: "https://learn.chatgpt.com/docs/extend/mcp",
    grok: "https://docs.x.ai/build/features/mcp-servers",
    "kimi-code":
      "https://www.kimi.com/code/docs/en/kimi-code-cli/customization/mcp.html",
    gemini:
      "https://google-gemini.github.io/gemini-cli/docs/tools/mcp-server.html",
    antigravity: "https://antigravity.google/docs/mcp?tab=cli",
    opencode: "https://opencode.ai/docs/mcp-servers",
  };

  return (
    <p className="mt-5">
      Need help? <Link href={url[client]}>View {CLIENTS[client]} docs</Link>
    </p>
  );
};

const NeedToken = ({ className }: { className?: string }) => {
  return (
    <div className={cn("text-xs text-neutral-400 leading-relaxed", className)}>
      Need a token? Generate one in{" "}
      <Link
        href="/admin/mcp/tokens"
        className="text-neutral-300 hover:text-white underline underline-offset-2"
      >
        Tokens Management
      </Link>
      .
    </div>
  );
};

/**
 * VS Code connects to MCP servers via `.vscode/mcp.json` in your project
 * (supported natively since VS Code 1.51+, no extension required).
 */
function vscodeSteps(endpoint: string): StepItem[] {
  return [
    {
      number: 1,
      title: "Add MCP server",
      description: (
        <span>
          Add the {MCP_SERVER_NAME} server entry to{" "}
          <strong>.vscode/mcp.json</strong> in your project root.
        </span>
      ),
      code: JSON.stringify(
        {
          servers: {
            [MCP_SERVER_NAME]: {
              type: "http",
              url: endpoint,
              headers: {
                Authorization: "Bearer <YOUR_MCP_TOKEN>",
              },
            },
          },
        },
        null,
        2,
      ),
      subtext: <Help client="vscode" />,
    },
    {
      number: 2,
      title: "Reload window",
      description:
        "Run the Reload Window command so VS Code picks up the new server config.",
      code: "Cmd/Ctrl + Shift + P → Developer: Reload Window",
      subtext:
        "You can also toggle the server in the MCP panel (the server icon in the activity bar).",
    },
    {
      number: 3,
      title: "Use in Copilot Chat",
      description: `Open Copilot Chat (Cmd/Ctrl + I) and type @${MCP_SERVER_NAME} to invoke tools.`,
      code: `@${MCP_SERVER_NAME} list projects and career milestones`,
    },
  ];
}

function claudeCodeSteps(endpoint: string): StepItem[] {
  return [
    {
      number: 1,
      title: "Add MCP server",
      description:
        "Add the MCP server to your project config using the command line.",
      code: `claude mcp add --transport http --scope user ${MCP_SERVER_NAME} ${endpoint} --header "Authorization: Bearer <YOUR_MCP_TOKEN>"`,
      subtext: <Help client="claude-code" />,
    },
    {
      number: 2,
      title: "Verify connection",
      description: "Confirm the server registered and its tools are available.",
      code: "claude mcp list",
      subtext: (
        <>
          Look for{" "}
          <span className="px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-200 font-mono text-[11px] border border-neutral-700/60">
            pras-mcp
          </span>{" "}
          in the list — the bearer token from step 1 handles authentication
          automatically, no interactive login needed.
        </>
      ),
    },
    {
      number: 3,
      title: "Query portfolio",
      description:
        "Ask Claude Code to query portfolio projects, blog posts, and experience.",
      code: `claude "Summarize the portfolio projects and recent blog write-ups."`,
    },
  ];
}

function cursorSteps(endpoint: string): StepItem[] {
  return [
    {
      number: 1,
      title: "Add MCP server",
      description: (
        <span>
          Add the {MCP_SERVER_NAME} server entry to{" "}
          <strong>~/.cursor/mcp.json</strong> or your project&apos;s{" "}
          <strong>.cursor/mcp.json</strong>.
        </span>
      ),
      code: JSON.stringify(
        {
          mcpServers: {
            [MCP_SERVER_NAME]: {
              url: endpoint,
              headers: {
                Authorization: "Bearer <YOUR_MCP_TOKEN>",
              },
            },
          },
        },
        null,
        2,
      ),
      subtext: <Help client="cursor" />,
    },
    {
      number: 2,
      title: "Enable MCP",
      description: `Enable the ${MCP_SERVER_NAME} server for your setup — via the Cursor CLI or the IDE (details below).`,
      content: (
        <div>
          <h4>Using Cursor CLI</h4>
          <p>
            Cursor IDE and the Cursor CLI (agent) use the same MCP
            configuration. After you add the configuration above or install with
            the one-click button, manage the server from your terminal using the{" "}
            <Link href="https://cursor.com/docs/cli/mcp">Cursor CLI</Link>.
          </p>

          <h5>Approve the server locally:</h5>
          <CodeBlock lang={"bash"}>agent mcp enable supabase</CodeBlock>

          <h5>Check the server connection status:</h5>
          <CodeBlock lang={"bash"}>agent mcp list</CodeBlock>

          <h4 className="mt-5 mb-1">Using Cursor IDE</h4>
          <ol>
            <li>
              Press <strong>Ctrl/Cmd + Shift + P</strong> to open the command
              palette.
            </li>
            <li>
              Type <code>mcp</code> and select{" "}
              <strong>MCP: Open MCP Settings</strong>.
            </li>
            <li>
              In the MCP panel, toggle <strong>Enabled</strong> for the{" "}
              <code>{MCP_SERVER_NAME}</code> server.
            </li>
          </ol>

          <p className="mt-5">
            Need help?{" "}
            <Link href="https://cursor.com/docs/mcp">View Cursor docs</Link>
          </p>
        </div>
      ),
      subtext: `Verify the ${MCP_SERVER_NAME} server reports green with tools loaded.`,
    },
    {
      number: 3,
      title: "Use in Composer or Chat",
      description: (
        <p>
          Open Composer <strong>Cmd+I</strong> or Chat <strong>Cmd+L</strong>{" "}
          and type @{MCP_SERVER_NAME} to invoke tools.
        </p>
      ),
      code: `@${MCP_SERVER_NAME} list projects and career milestones`,
    },
  ];
}

function codexSteps(endpoint: string): StepItem[] {
  return [
    {
      number: 1,
      title: "Set the token in your environment",
      description: (
        <span className="leading-relaxed">
          Codex reads the bearer token from an environment variable, not from
          the config file. Create the variable in your shell profile (or the
          environment Codex runs in) with your MCP token as its value.
        </span>
      ),
      code: `export ${MCP_SERVER_NAME.toUpperCase()}_MCP_TOKEN="<YOUR_MCP_TOKEN>"`,
      subtext: (
        <>
          Add this line to <strong>~/.bashrc</strong>, <strong>~/.zshrc</strong>,
          or wherever your shell environment is defined — then restart your
          terminal so it takes effect.
          <NeedToken className="mt-5" />
        </>
      ),
    },
    {
      number: 2,
      title: "Add MCP server",
      description: (
        <span>
          Add the {MCP_SERVER_NAME} server to{" "}
          <strong>~/.codex/config.toml</strong> or your project&apos;s{" "}
          <strong>.codex/config.toml</strong>.
        </span>
      ),
      code: `[mcp_servers.${MCP_SERVER_NAME}]
url = "${endpoint}"
bearer_token_env_var = "${MCP_SERVER_NAME.toUpperCase()}_MCP_TOKEN"
`,
      subtext: <Help client="codex" />,
    },
    {
      number: 3,
      title: "Verify connection",
      description: `List configured servers and confirm ${MCP_SERVER_NAME} is ready.`,
      code: "codex mcp list",
    },
    {
      number: 4,
      title: "Use in Codex",
      description: `Ask Codex to query ${MCP_SERVER_NAME} content using the connected tools.`,
      code: `What projects and articles are hosted on the ${MCP_SERVER_NAME} server?`,
    },
  ];
}

function grokSteps(endpoint: string): StepItem[] {
  return [
    {
      number: 1,
      title: "Add MCP server",
      description: (
        <span>
          Add the MCP server to your project config using the command line.
        </span>
      ),
      code: `grok mcp add --transport http ${MCP_SERVER_NAME} ${endpoint} --header "Authorization: Bearer <YOUR_MCP_TOKEN>"`,
      subtext: <Help client="grok" />,
    },
    {
      number: 2,
      title: "Verify connection",
      description: "Confirm the server registered and its tools are available.",
      code: "grok mcp list",
      subtext: (
        <>
          Look for <strong>{MCP_SERVER_NAME}</strong> in the list. If anything
          looks off, run <strong>grok mcp doctor {MCP_SERVER_NAME}</strong>.
        </>
      ),
    },
    {
      number: 3,
      title: "Use in Grok",
      description: `Ask Grok to query ${MCP_SERVER_NAME} content using the connected tools.`,
      code: `What projects and articles are hosted on the ${MCP_SERVER_NAME} server?`,
    },
  ];
}

function kimiCodeSteps(endpoint: string): StepItem[] {
  return [
    {
      number: 1,
      title: "Add MCP server",
      description: (
        <span>
          Add the {MCP_SERVER_NAME} server entry to{" "}
          <strong>~/.kimi-code/mcp.json</strong> or your project&apos;s{" "}
          <strong>.kimi-code/mcp.json</strong>.
        </span>
      ),
      code: JSON.stringify(
        {
          mcpServers: {
            [MCP_SERVER_NAME]: {
              url: endpoint,
              headers: {
                Authorization: "Bearer <YOUR_MCP_TOKEN>",
              },
            },
          },
        },
        null,
        2,
      ),
      subtext: <Help client="kimi-code" />,
    },
    {
      number: 2,
      title: "Verify connection",
      description: "Check the connection status of all configured servers.",
      code: "/mcp",
    },
    {
      number: 3,
      title: "Use in Kimi Code",
      description: `Ask Kimi Code to query ${MCP_SERVER_NAME} content using the connected tools.`,
      code: `What projects and articles are hosted on the ${MCP_SERVER_NAME} server?`,
    },
  ];
}

function geminiSteps(endpoint: string): StepItem[] {
  return [
    {
      number: 1,
      title: "Add MCP server",
      description: (
        <span>
          Add the {MCP_SERVER_NAME} server to{" "}
          <strong>~/.gemini/settings.json</strong> or your project&apos;s{" "}
          <strong>.gemini/settings.json</strong>.
        </span>
      ),
      code: JSON.stringify(
        {
          mcpServers: {
            [MCP_SERVER_NAME]: {
              httpUrl: endpoint,
              headers: {
                Authorization: "Bearer <YOUR_MCP_TOKEN>",
              },
            },
          },
        },
        null,
        2,
      ),
      subtext: <Help client="gemini" />,
    },
    {
      number: 2,
      title: "Verify connection",
      description: "Check the connection status of all configured servers.",
      code: "gemini mcp list",
    },
    {
      number: 3,
      title: "Use in Gemini",
      description: `Ask Gemini to query ${MCP_SERVER_NAME} content using the connected tools.`,
      code: `What projects and articles are hosted on the ${MCP_SERVER_NAME} server?`,
    },
  ];
}

function antigravitySteps(endpoint: string): StepItem[] {
  return [
    {
      number: 1,
      title: "Add MCP server",
      description: (
        <span>
          Add the {MCP_SERVER_NAME} server to{" "}
          <strong>~/.gemini/config/mcp_config.json</strong> or your
          project&apos;s <strong>.agents/mcp_config.json</strong>.
        </span>
      ),
      code: JSON.stringify(
        {
          mcpServers: {
            [MCP_SERVER_NAME]: {
              serverUrl: endpoint,
              headers: {
                Authorization: "Bearer <YOUR_MCP_TOKEN>",
              },
            },
          },
        },
        null,
        2,
      ),
      subtext: <Help client="antigravity" />,
    },
    {
      number: 2,
      title: "Verify connection",
      description: "Run the MCP command to list configured servers.",
      code: "/mcp",
    },
    {
      number: 3,
      title: "Use in Antigravity",
      description: `Ask Antigravity to query ${MCP_SERVER_NAME} content using the connected tools.`,
      code: `What projects and articles are hosted on the ${MCP_SERVER_NAME} server?`,
    },
  ];
}

function opencodeSteps(endpoint: string): StepItem[] {
  return [
    {
      number: 1,
      title: "Add MCP server",
      description: (
        <span>
          Add the {MCP_SERVER_NAME} server to your{" "}
          <strong>opencode.json</strong> (project root) or global{" "}
          <strong>~/.config/opencode/opencode.json</strong>.
        </span>
      ),
      code: JSON.stringify(
        {
          $schema: "https://opencode.ai/config.json",
          mcp: {
            [MCP_SERVER_NAME]: {
              type: "remote",
              url: endpoint,
              enabled: true,
              headers: {
                Authorization: "Bearer <YOUR_MCP_TOKEN>",
              },
            },
          },
        },
        null,
        2,
      ),
      subtext: <Help client="opencode" />,
    },
    {
      number: 2,
      title: "Restart or reload",
      description:
        "Restart OpenCode to pick up the new configuration.",
      code: "opencode",
      subtext:
        "You can verify it's connected by asking OpenCode to list the available MCP tools.",
    },
    {
      number: 3,
      title: "Use in OpenCode",
      description: `Ask OpenCode to query ${MCP_SERVER_NAME} content using the connected tools.`,
      code: `What projects and articles are hosted on the ${MCP_SERVER_NAME} server?`,
    },
  ];
}

export function getStepsForClient(
  client: ClientId,
  endpoint: string,
): StepItem[] {
  switch (client) {
    case "claude-code":
      return claudeCodeSteps(endpoint);
    case "cursor":
      return cursorSteps(endpoint);
    case "vscode":
      return vscodeSteps(endpoint);
    case "codex":
      return codexSteps(endpoint);
    case "grok":
      return grokSteps(endpoint);
    case "kimi-code":
      return kimiCodeSteps(endpoint);
    case "gemini":
      return geminiSteps(endpoint);
    case "antigravity":
      return antigravitySteps(endpoint);
    case "opencode":
      return opencodeSteps(endpoint);
    default:
      return [];
  }
}
