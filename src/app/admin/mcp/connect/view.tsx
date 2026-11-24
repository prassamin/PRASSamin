"use client";

import React, { useState, useMemo } from "react";
import { Select, type SelectOption } from "@/components/ui/select";
import { CodeBlock } from "@/components/code-block";
import { cn } from "@heroui/react";
import {
  CLIENTS,
  getStepsForClient,
  type ClientId,
  type StepItem,
} from "./steps";
import { MCP_SERVER_ENDPOINT } from "@/config/mcp";

/* ────────────────────────────────────────────────────────────────
 * StepContent — shared typography wrapper for step body content.
 *
 * All tag styling lives here via Tailwind [&_…] selectors, so step
 * content can be written with plain semantic tags (h4, p, strong, code,
 * a, ul/li…) without per-element classes.
 * ──────────────────────────────────────────────────────────────── */

const StepContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "space-y-2.5 text-xs text-neutral-400 leading-relaxed",
        "[&_h4]:text-[13px] [&_h4]:font-semibold [&_h4]:text-white [&_h4]:font-rethink [&_h4]:mt-4 [&_h4:first-child]:mt-0",
        "[&_h5]:text-[12px] [&_h5]:text-white [&_h5]:font-rethink [&_h5]:mt-2 [&_h5:first-child]:mt-0",
        "[&_p]:leading-relaxed [&_p]:text-neutral-400",
        "[&_a]:text-neutral-200 [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-neutral-600 [&_a:hover]:decoration-white [&_a:hover]:text-white [&_a]:transition-colors",
        "[&_ul]:space-y-1 [&_ul]:pl-4 [&_ul]:list-disc [&_li]:marker:text-neutral-600",
        "[&_ol]:space-y-1 [&_ol]:pl-4 [&_ol]:list-decimal [&_li]:marker:text-neutral-500",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const McpConnectView: React.FC<{ origin: string }> = ({ origin }) => {
  const [selectedClient, setSelectedClient] = useState<ClientId>("claude-code");

  const endpointUrl = MCP_SERVER_ENDPOINT(origin);

  // Generate Steps for the selected client
  const steps: StepItem[] = useMemo(
    () => getStepsForClient(selectedClient, endpointUrl),
    [selectedClient, endpointUrl],
  );

  const clientOptions: SelectOption<ClientId>[] = useMemo(
    () =>
      (Object.keys(CLIENTS) as ClientId[]).map((key) => ({
        id: key,
        value: key,
        label: CLIENTS[key],
        textValue: CLIENTS[key],
      })),
    [],
  );

  return (
    <div className="layout mx-auto py-4 px-2 sm:px-4 text-neutral-200">
      {/* ────────────────────────────────────────────────────────────
       * TOP SECTION: Configuration Form (Supabase Clean Style)
       * ──────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Row: Client Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-start gap-2 sm:gap-6">
          <span className="text-sm font-normal text-neutral-300 pt-2.5">
            Client
          </span>
          <div className="w-full">
            <Select<ClientId>
              value={selectedClient}
              onChange={(val) => {
                if (val) setSelectedClient(val);
              }}
              options={clientOptions}
              description="The MCP client you are using."
              triggerClassName="h-10 border-neutral-800 text-neutral-200 text-sm rounded-xl hover:border-inherit"
            />
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────
       * DIVIDER
       * ──────────────────────────────────────────────────────────── */}
      <hr className="border-neutral-800 my-8" />

      {/* ────────────────────────────────────────────────────────────
       * BOTTOM SECTION: "Follow these steps" (Supabase Exact Layout)
       * ──────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Header with "Follow these steps" and "Copy prompt" button */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">
            Follow these steps
          </h2>
        </div>

        {/* Steps List with Left Track Numbers and Right Code Blocks */}
        <div className="relative space-y-8">
          {/* Subtle vertical connection line */}
          <div className="absolute left-3.25 top-4 bottom-6 w-px bg-neutral-800 z-0" />

          {steps.map((step) => {
            return (
              <div
                key={step.number}
                className="relative z-10 flex items-start gap-4"
              >
                {/* Step circle number */}
                <div className="size-7 rounded-lg border border-white/5 bg-muted text-xs font-medium text-neutral-400 flex items-center justify-center shrink-0">
                  {step.number}
                </div>

                {/* Step content: 2-column on md screens (Left text, Right code) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 items-start">
                  {/* Step title & description */}
                  <div className="space-y-1 pt-0.5">
                    <h3 className="text-sm font-semibold text-white">
                      {step.title}
                    </h3>
                    <StepContent>{step.description}</StepContent>
                  </div>

                  {/* Step code box */}
                  <div className="space-y-1.5 w-full min-w-0">
                    {step.content ? (
                      <StepContent>{step.content}</StepContent>
                    ) : (
                      <>
                        <CodeBlock
                          lang={
                            step?.code?.trim().startsWith("{") ? "json" : "bash"
                          }
                          links={[
                            {
                              match: "<YOUR_MCP_TOKEN>",
                              href: "/admin/mcp/tokens",
                              className: "link-subtle",
                            },
                          ]}
                        >
                          {step.code}
                        </CodeBlock>

                        {step.subtext && (
                          <StepContent>{step.subtext}</StepContent>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default McpConnectView;
