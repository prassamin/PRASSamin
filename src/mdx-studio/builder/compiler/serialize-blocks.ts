import {
  MdxBlock,
  MdxBlockType,
  TypeTableProperty,
  FileTreeNode,
  ListType,
  ListItem,
} from "../types";
import { buildUserMentionTag } from "../components/user-mention-utils";
import { slugify, serializeFileTree } from "./utils";

export interface BlocksToMdxOptions {
  forPreview?: boolean;
}

const singleBlockMdxCache = new WeakMap<
  Record<string, any>,
  { type: MdxBlockType; mdx: string }
>();
const templateVarsCache = new WeakMap<MdxBlock[], string[]>();

export function blocksToMdx(
  blocks: MdxBlock[],
  options?: BlocksToMdxOptions,
): string {
  if (!blocks || blocks.length === 0) return "";

  const segments: string[] = [];

  for (const block of blocks) {
    const { type, props } = block;
    const prevLength = segments.length;

    const cached =
      props && typeof props === "object"
        ? singleBlockMdxCache.get(props)
        : undefined;

    if (cached && cached.type === type) {
      if (cached.mdx) {
        if (options?.forPreview && block.id && type !== "template") {
          segments.push(
            `<div data-block-id="${block.id}" className="mdx-preview-block">\n\n${cached.mdx}\n\n</div>`,
          );
        } else {
          segments.push(cached.mdx);
        }
      }
      continue;
    }

    switch (type) {
      case "heading": {
        const level = props.level || 2;
        const hashes = "#".repeat(level);
        let text = props.text || "Heading";
        if (props.isBold && !text.startsWith("**")) text = `**${text}**`;
        if (props.isItalic && !text.startsWith("*")) text = `*${text}*`;

        const cleanId = props.id
          ? props.id.trim().replace(/[^a-zA-Z0-9_-]/g, "")
          : "";

        // If custom ID or alignment is present, compile to Fumadocs' <Heading as="hN" id="...">
        // to preserve the signature left accent border, typography, and section anchor linking.
        if (cleanId || props.align === "center" || props.align === "right") {
          const Tag = "Heading";
          const classes = [
            props.align === "center" && "text-center",
            props.align === "right" && "text-right",
          ]
            .filter(Boolean)
            .join(" ");

          const classAttr = classes ? ` className="${classes}"` : "";
          const idAttr = cleanId ? ` id="${cleanId}"` : "";
          segments.push(
            `<${Tag} as="h${level}"${idAttr}${classAttr}>${text}</${Tag}>`,
          );
        } else {
          segments.push(`${hashes} ${text}`);
        }
        break;
      }

      case "paragraph": {
        let text = props.text || "";
        if (props.isBold && !text.startsWith("**")) text = `**${text}**`;
        if (props.isItalic && !text.startsWith("*")) text = `*${text}*`;

        const classes = [
          props.align === "center" && "text-center",
          props.align === "right" && "text-right",
          props.fontSize === "sm" && "text-sm text-neutral-400",
          props.fontSize === "lg" && "text-lg",
          props.fontSize === "xl" && "text-xl font-medium",
        ]
          .filter(Boolean)
          .join(" ");

        if (classes) {
          segments.push(`<p className="${classes}">\n  ${text}\n</p>`);
        } else {
          segments.push(text);
        }
        break;
      }

      case "list": {
        const listType: ListType = props.listType || "bullet";
        const items: ListItem[] = Array.isArray(props.items) ? props.items : [];
        if (items.length === 0) {
          segments.push(
            listType === "task" ? "- [ ] " : listType === "ordered" ? "" : "- ",
          );
          break;
        }

        const formatted = items
          .map((item, idx) => {
            const rawText = item?.text || "";
            if (listType === "task") {
              const check = item?.checked ? "x" : " ";
              return `- [${check}] ${rawText}`;
            }
            if (listType === "ordered") {
              return `${idx + 1}. ${rawText}`;
            }
            return `- ${rawText}`;
          })
          .join("\n");

        segments.push(formatted);
        break;
      }

      case "divider": {
        if (props.style || props.spacing) {
          const borderStyle =
            props.style === "dashed"
              ? "border-dashed"
              : props.style === "dotted"
                ? "border-dotted"
                : "border-solid";
          const margin =
            props.spacing === "sm"
              ? "my-3"
              : props.spacing === "lg"
                ? "my-10"
                : "my-6";
          segments.push(
            `<hr className="${borderStyle} ${margin} border-white/10" />`,
          );
        } else {
          segments.push("---");
        }
        break;
      }

      case "break": {
        segments.push("<br />");
        break;
      }

      case "callout": {
        const rawType = String(props.calloutType || "info").toLowerCase();
        const calloutType =
          rawType === "danger" || rawType === "error"
            ? "danger"
            : rawType === "warning" || rawType === "warn"
              ? "warning"
              : "info";
        const titleAttr = props.title ? ` title="${props.title}"` : "";
        const iconAttr = props.icon ? ` icon="${props.icon}"` : "";
        const collapsibleAttr = props.collapsible ? ` collapsible` : "";
        segments.push(
          `<Callout type="${calloutType}"${titleAttr}${iconAttr}${collapsibleAttr}>\n  ${
            props.content || ""
          }\n</Callout>`,
        );
        break;
      }

      case "banner": {
        const variant = props.variant || "normal";
        const variantAttr = variant !== "normal" ? ` variant="${variant}"` : "";
        // fumadocs' Banner only renders a close button / remembers dismissal
        // when it has an id (stored in localStorage as `nd-banner-<id>`)
        const idAttr =
          props.dismissible !== false
            ? ` id="${props.id || "site-banner"}"`
            : "";
        const body = (props.text || "").trim().replace(/\n/g, "\n  ");
        segments.push(`<Banner${variantAttr}${idAttr}>\n  ${body}\n</Banner>`);
        break;
      }

      case "card": {
        const titleAttr = props.title
          ? ` title="${String(props.title).replace(/"/g, "&quot;")}"`
          : "";
        const badgeAttr = props.badge
          ? ` badge="${String(props.badge).replace(/"/g, "&quot;")}"`
          : "";
        const bodyContent = (props.content || "").trim();
        segments.push(
          `<Card${titleAttr}${badgeAttr}>\n\n${
            bodyContent || "Card details, key points, and description."
          }\n\n</Card>`,
        );
        break;
      }

      case "cards": {
        const cards: any[] = props.cards || [];
        const cardSnippets = cards
          .map((card) => {
            const titleAttr = card.title
              ? ` title="${String(card.title).replace(/"/g, "&quot;")}"`
              : "";
            const badgeAttr = card.badge
              ? ` badge="${String(card.badge).replace(/"/g, "&quot;")}"`
              : "";
            const bodyContent = (card.content || "").trim();
            return `  <Card${titleAttr}${badgeAttr}>\n\n${
              bodyContent || "Card details, key points, and description."
            }\n\n  </Card>`;
          })
          .join("\n\n");

        segments.push(`<Cards>\n${cardSnippets}\n</Cards>`);
        break;
      }

      case "accordion": {
        const typeAttr = props.allowMultiple === false ? ' type="single"' : "";
        const items = props.items || [];
        const itemSnippets = items
          .map(
            (it: { title: string; content: string }) =>
              `  <AccordionItem title="${it.title}">\n    ${it.content}\n  </AccordionItem>`,
          )
          .join("\n");
        segments.push(`<Accordion${typeAttr}>\n${itemSnippets}\n</Accordion>`);
        break;
      }

      case "steps": {
        const steps: { title?: string; content?: string }[] = props.steps || [];
        const stepSnippets = steps
          .map((s) => {
            const title = (s.title || "").trim();
            const body = (s.content || "").trim();

            // Fumadocs v15 enters each step through a <Step> wrapper; the heading
            // is authored inside it as markdown so the preview styles normally.
            const inner = title
              ? body
                ? `### ${title}\n\n${body}`
                : `### ${title}`
              : body;

            return `<Step>\n${inner}\n</Step>`;
          })
          .join("\n\n");

        segments.push(`<Steps>\n${stepSnippets}\n</Steps>`);
        break;
      }

      case "tabs": {
        const tabs: any[] = props.tabs || [];
        const itemsJson = JSON.stringify(tabs.map((t) => t.title || "Tab"));
        const groupIdAttr = props.groupId ? ` groupId="${props.groupId}"` : "";
        const tabSnippets = tabs
          .map((t) => {
            let innerMdx = "";
            if (t.blocks && Array.isArray(t.blocks) && t.blocks.length > 0) {
              innerMdx = blocksToMdx(t.blocks);
            } else if (t.content) {
              innerMdx = t.content;
            }
            const indented = innerMdx
              ? innerMdx
                  .split("\n")
                  .map((l: string) => (l.trim() ? `  ${l}` : ""))
                  .join("\n")
              : "  Write content here...";

            return `  <Tab value="${t.title || "Tab"}">\n${indented}\n  </Tab>`;
          })
          .join("\n\n");

        segments.push(
          `<Tabs items={${itemsJson}}${groupIdAttr}>\n${tabSnippets}\n</Tabs>`,
        );
        break;
      }

      case "codeBlockTabs": {
        const tabs: any[] = props.tabs || [];
        const defaultVal =
          props.defaultValue || tabs[0]?.value || tabs[0]?.label || "npm";

        const triggers = tabs
          .map(
            (t) =>
              `    <CodeBlockTabsTrigger value="${t.value || t.label}">${t.label || t.value}</CodeBlockTabsTrigger>`,
          )
          .join("\n");

        const tabContents = tabs
          .map((t) => {
            const val = t.value || t.label;
            const lang = t.language || "bash";
            const titleAttr = t.title ? ` title="${t.title}"` : "";
            const rawCode = t.code || "";
            return `  <CodeBlockTab value="${val}">\n\n    \`\`\`${lang}${titleAttr}\n${rawCode}\n    \`\`\`\n\n  </CodeBlockTab>`;
          })
          .join("\n\n");

        segments.push(
          `<CodeBlockTabs defaultValue="${defaultVal}">\n  <CodeBlockTabsList>\n${triggers}\n  </CodeBlockTabsList>\n\n${tabContents}\n</CodeBlockTabs>`,
        );
        break;
      }

      case "chipGroup": {
        const chips = props.chips || [];
        const color = props.color || "accent";
        const variant = props.variant || "soft";
        const size = props.size || "sm";
        const chipElements = chips
          .map(
            (c: string) =>
              `  <Chip size="${size}" variant="${variant}" color="${color}">${c}</Chip>`,
          )
          .join("\n");
        segments.push(
          `<div className="flex flex-wrap gap-2 my-2">\n${chipElements}\n</div>`,
        );
        break;
      }

      case "stacks": {
        const stacksList = Array.isArray(props.stacks) ? props.stacks : [];
        const stackItems = stacksList
          .map((s: string) => `  <Stack name="${s}" />`)
          .join("\n");
        segments.push(
          stackItems.length > 0
            ? `<Stacks>\n${stackItems}\n</Stacks>`
            : `<Stacks />`,
        );
        break;
      }

      case "code": {
        const lang = props.language || "typescript";
        const titleAttr = props.title ? ` title="${props.title}"` : "";
        const lineNumbers = props.showLineNumbers ? " showLineNumbers" : "";
        const highlightAttr = props.highlight
          ? ` {${props.highlight.trim().replace(/^\{+|\}+$/g, "")}}`
          : "";
        const wrapAttr = props.wrapLines ? " wrap" : "";
        segments.push(
          `\`\`\`${lang}${titleAttr}${lineNumbers}${highlightAttr}${wrapAttr}\n${props.code || ""}\n\`\`\``,
        );
        break;
      }

      case "image": {
        const alt = props.alt || "Image";
        const src = (props.src || "").trim();
        if (!src) break;
        const caption = props.caption ? `\n\n*${props.caption}*` : "";

        const size = props.size || "full";
        const align = props.align || "center";
        const aspectRatio = props.aspectRatio || "auto";
        const objectFit = props.objectFit || "cover";
        const rounded = props.rounded || "md";
        const width = props.width ? Number(props.width) : undefined;
        const height = props.height ? Number(props.height) : undefined;

        const hasCustomProps =
          Boolean(props.zoomable) ||
          size !== "full" ||
          align !== "center" ||
          aspectRatio !== "auto" ||
          objectFit !== "cover" ||
          rounded !== "md" ||
          Boolean(width) ||
          Boolean(height);

        if (!hasCustomProps) {
          segments.push(`![${alt}](${src})${caption}`);
          break;
        }

        const classes = [
          "block",
          size === "sm" && "w-1/3",
          size === "md" && "w-1/2",
          size === "lg" && "w-3/4",
          size === "full" && !width && "w-full",
          align === "left" && "mr-auto",
          align === "center" && "mx-auto",
          align === "right" && "ml-auto",
          aspectRatio === "16/9" && "aspect-video",
          aspectRatio === "4/3" && "aspect-4/3",
          aspectRatio === "1/1" && "aspect-square",
          aspectRatio === "21/9" && "aspect-[21/9]",
          (aspectRatio !== "auto" || height || objectFit === "contain") &&
            (objectFit === "contain" ? "object-contain" : "object-cover"),
          rounded === "none" && "rounded-none",
          rounded === "md" && "rounded-md",
          rounded === "xl" && "rounded-xl",
          rounded === "2xl" && "rounded-2xl",
          rounded === "full" && "rounded-full",
        ]
          .filter(Boolean)
          .join(" ");

        const classAttr = classes ? ` className="${classes}"` : "";
        const widthAttr = width ? ` width={${width}}` : "";
        const heightAttr = height ? ` height={${height}}` : "";
        const Tag = props.zoomable ? "ImageZoom" : "img";

        segments.push(
          `<${Tag} src="${src}" alt="${alt}"${widthAttr}${heightAttr}${classAttr} />${caption}`,
        );
        break;
      }

      case "table": {
        const headers: string[] =
          Array.isArray(props.headers) && props.headers.length > 0
            ? props.headers
            : ["Column 1", "Column 2"];
        const alignments: string[] = Array.isArray(props.alignments)
          ? props.alignments
          : headers.map(() => "left");
        const rows: string[][] = Array.isArray(props.rows) ? props.rows : [];

        // Header row
        const headerCells = headers.map((h) =>
          (h || " ").replace(/\|/g, "\\|"),
        );
        const headerLine = `| ${headerCells.join(" | ")} |`;

        // Delimiter row
        const delimiterCells = headers.map((_, i) => {
          const align = alignments[i] || "left";
          if (align === "center") return ":---:";
          if (align === "right") return "---:";
          return ":---";
        });
        const delimiterLine = `| ${delimiterCells.join(" | ")} |`;

        // Body rows
        const rowLines = rows.map((r) => {
          const cells = headers.map(
            (_, i) => (r[i] ?? "").replace(/\|/g, "\\|") || " ",
          );
          return `| ${cells.join(" | ")} |`;
        });

        segments.push([headerLine, delimiterLine, ...rowLines].join("\n"));
        break;
      }

      case "typeTable": {
        const parameters: TypeTableProperty[] = Array.isArray(props.parameters)
          ? props.parameters
          : [];

        const obj: Record<string, any> = {};
        for (const p of parameters) {
          if (!p.name || !p.name.trim()) continue;
          const key = p.name.trim();
          const entry: Record<string, any> = {
            type: p.type || "string",
          };
          if (p.description) entry.description = p.description;
          if (p.default !== undefined && p.default !== "") {
            entry.default = p.default;
          }
          if (p.required) entry.required = true;
          if (p.deprecated) entry.deprecated = true;
          if (p.typeDescriptionLink) {
            entry.typeDescriptionLink = p.typeDescriptionLink;
          }
          obj[key] = entry;
        }

        segments.push(
          `<TypeTable\n  type={${JSON.stringify(obj, null, 2)}}\n/>`,
        );
        break;
      }

      case "files": {
        const items: FileTreeNode[] = Array.isArray(props.items)
          ? props.items
          : [];
        const inner = serializeFileTree(items, 2);
        segments.push(`<Files>\n${inner}\n</Files>`);
        break;
      }

      case "avatar": {
        const { items, max, size, shape, bordered, align } = props;
        const attrs: string[] = [];
        if (
          max !== undefined &&
          max !== Infinity &&
          max !== "infinity" &&
          max !== "∞" &&
          Number.isFinite(Number(max))
        ) {
          attrs.push(`max={${max}}`);
        }
        if (size && size !== "md") attrs.push(`size="${size}"`);
        if (shape && shape !== "circle") attrs.push(`shape="${shape}"`);
        if (align && align !== "left") attrs.push(`align="${align}"`);
        if (bordered === false) attrs.push(`bordered={false}`);

        const itemList = Array.isArray(items) ? items : [];
        if (itemList.length > 0) {
          const serialized = JSON.stringify(itemList, null, 2).replace(
            /\n/g,
            "\n  ",
          );
          segments.push(
            `<AvatarGroup${attrs.length ? " " + attrs.join(" ") : ""}\n  items={${serialized}}\n/>`,
          );
        } else {
          segments.push(
            `<AvatarGroup${attrs.length ? " " + attrs.join(" ") : ""} />`,
          );
        }
        break;
      }

      case "profile": {
        const { src, name, description, size, shape, bordered, color, href } =
          props;
        const attrs: string[] = [];
        if (name) attrs.push(`name="${name}"`);
        if (description) attrs.push(`description="${description}"`);
        if (src) attrs.push(`src="${src}"`);
        if (size && size !== "md") attrs.push(`size="${size}"`);
        if (shape && shape !== "circle") attrs.push(`shape="${shape}"`);
        if (bordered === false) attrs.push(`bordered={false}`);
        if (color && color !== "default") attrs.push(`color="${color}"`);
        if (href) attrs.push(`href="${href}"`);
        segments.push(`<Profile ${attrs.join(" ")} />`);
        break;
      }

      case "blockquote": {
        const { quote, author, role, cite, avatar, borderStyle } = props;
        // If rich props exist (author, role, cite, avatar, or non-default borderStyle), compile as <Blockquote ...>
        if (
          author ||
          role ||
          cite ||
          avatar ||
          (borderStyle && borderStyle !== "left-accent")
        ) {
          const attrs: string[] = [];
          if (author) attrs.push(`author="${author}"`);
          if (role) attrs.push(`role="${role}"`);
          if (cite) attrs.push(`cite="${cite}"`);
          if (avatar) attrs.push(`avatar="${avatar}"`);
          if (borderStyle && borderStyle !== "left-accent")
            attrs.push(`borderStyle="${borderStyle}"`);
          segments.push(
            `<Blockquote${attrs.length ? " " + attrs.join(" ") : ""}>\n  ${quote || ""}\n</Blockquote>`,
          );
        } else {
          // Standard markdown quote format (> ...)
          const text = quote || "";
          const lines = text.split("\n").map((line: string) => `> ${line}`);
          segments.push(lines.join("\n"));
        }
        break;
      }

      case "template": {
        const rawName = String(props.name || "my-template")
          .trim()
          .replace(/["'<>]/g, "");
        const name = rawName || "my-template";
        const nestedBlocks: MdxBlock[] = Array.isArray(props.blocks)
          ? props.blocks
          : [];
        const innerMdx =
          nestedBlocks.length > 0 ? blocksToMdx(nestedBlocks) : "";

        const indented = innerMdx
          ? innerMdx
              .split("\n")
              .map((l: string) => (l.trim() ? `  ${l}` : ""))
              .join("\n")
          : "";
        segments.push(
          indented
            ? `<Template name="${name}">\n${indented}\n</Template>`
            : `<Template name="${name}">\n</Template>`,
        );
        break;
      }

      case "useTemplate": {
        const rawName = String(props.name || "")
          .trim()
          .replace(/["'<>]/g, "");
        const varValues: Record<string, string> =
          props.values && typeof props.values === "object" ? props.values : {};
        const varEntries = Object.entries(varValues).filter(([k, v]) => {
          const safeKey = k.trim();
          return (
            /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(safeKey) &&
            safeKey !== "name" &&
            String(v ?? "").trim() !== ""
          );
        });

        // If shorthand mode is chosen (or no variables defined), compile as clean #template-name or #template-name(k="v")!
        if (props.mode === "shorthand" && rawName) {
          if (varEntries.length === 0) {
            segments.push(`#${rawName}`);
          } else {
            const argParts = varEntries.map(([key, val]) => {
              const safeKey = key.trim();
              const escapedVal = String(val ?? "")
                .replace(/"/g, '\\"')
                .replace(/\r?\n/g, " ");
              return `${safeKey}="${escapedVal}"`;
            });
            segments.push(`#${rawName}(${argParts.join(", ")})`);
          }
          break;
        }

        const attrParts = [`name="${rawName}"`];
        for (const [key, val] of varEntries) {
          const safeKey = key.trim();
          const escapedVal = String(val ?? "")
            .replace(/"/g, "&quot;")
            .replace(/\r?\n/g, " ");
          attrParts.push(`${safeKey}="${escapedVal}"`);
        }
        segments.push(`<UseTemplate ${attrParts.join(" ")} />`);
        break;
      }

      case "user": {
        segments.push(buildUserMentionTag(props as any));
        break;
      }

      case "html": {
        const rawCode = String(props.code || "").trim();
        if (rawCode) {
          segments.push(rawCode);
        }
        break;
      }

      default:
        break;
    }

    const blockMdx =
      segments.length > prevLength
        ? segments.slice(prevLength).join("\n\n")
        : "";

    if (props && typeof props === "object") {
      singleBlockMdxCache.set(props, { type, mdx: blockMdx });
    }

    if (
      options?.forPreview &&
      block.id &&
      type !== "template" &&
      segments.length > prevLength
    ) {
      segments.splice(
        prevLength,
        segments.length - prevLength,
        `<div data-block-id="${block.id}" className="mdx-preview-block">\n\n${blockMdx}\n\n</div>`,
      );
    }
  }

  return segments.join("\n\n");
}

/**
 * Extracts unique `{{variable}}` placeholder names (in order of first appearance)
 * from a template's nested blocks.
 */
export function extractTemplateVariables(blocks: MdxBlock[]): string[] {
  if (!Array.isArray(blocks) || blocks.length === 0) return [];
  const cached = templateVarsCache.get(blocks);
  if (cached) return cached;
  const compiled = blocksToMdx(blocks);
  const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
  const seen = new Set<string>();
  const vars: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(compiled)) !== null) {
    const varName = match[1];
    if (varName && varName !== "name" && !seen.has(varName)) {
      seen.add(varName);
      vars.push(varName);
    }
  }
  templateVarsCache.set(blocks, vars);
  return vars;
}
