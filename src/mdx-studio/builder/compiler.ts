import {
  MdxBlock,
  MdxBlockType,
  COMPONENT_TRAY_ITEMS,
  TypeTableProperty,
  FileTreeNode,
  ListType,
  ListItem,
} from "./types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createBlock(
  type: MdxBlockType,
  initialProps?: Record<string, any>,
): MdxBlock {
  const item = COMPONENT_TRAY_ITEMS.find((c) => c.type === type);
  const defaultProps = item
    ? JSON.parse(JSON.stringify(item.defaultProps))
    : {};

  return {
    id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    props: {
      ...defaultProps,
      ...initialProps,
    },
  };
}

function serializeFileTree(nodes: FileTreeNode[], indent = 2): string {
  const spaces = " ".repeat(indent);
  const lines: string[] = [];
  for (const node of nodes) {
    if (node.type === "folder") {
      const openAttr = node.defaultOpen ? " defaultOpen" : "";
      lines.push(
        `${spaces}<Folder name="${node.name || "folder"}"${openAttr}>`,
      );
      if (node.children && node.children.length > 0) {
        lines.push(serializeFileTree(node.children, indent + 2));
      }
      lines.push(`${spaces}</Folder>`);
    } else {
      lines.push(`${spaces}<File name="${node.name || "file.txt"}" />`);
    }
  }
  return lines.join("\n");
}

export interface BlocksToMdxOptions {
  forPreview?: boolean;
}

export function blocksToMdx(
  blocks: MdxBlock[],
  options?: BlocksToMdxOptions,
): string {
  if (!blocks || blocks.length === 0) return "";

  const segments: string[] = [];

  for (const block of blocks) {
    const { type, props } = block;
    const prevLength = segments.length;

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
        const rawType = (props.calloutType || "info").toLowerCase();
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

      default:
        break;
    }

    if (options?.forPreview && block.id && segments.length > prevLength) {
      const added = segments.slice(prevLength).join("\n\n");
      segments.splice(
        prevLength,
        segments.length - prevLength,
        `<div data-block-id="${block.id}" className="mdx-preview-block">\n\n${added}\n\n</div>`,
      );
    }
  }

  return segments.join("\n\n");
}

export function dedentCode(code: string): string {
  const lines = code.split(/\r?\n/);
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  if (nonEmpty.length === 0) return code;
  const minIndent = Math.min(
    ...nonEmpty.map((l) => l.match(/^[ \t]*/)?.[0].length || 0),
  );
  if (minIndent === 0) return code;
  return lines
    .map((l) => (l.trim().length === 0 ? "" : l.slice(minIndent)))
    .join("\n");
}

export function splitMdxIntoBlocks(mdx: string): string[] {
  const blocks: string[] = [];
  let remaining = mdx.trim();

  while (remaining.length > 0) {
    // Code blocks (```...```) - support leading whitespace/indentation
    const codeMatch = remaining.match(/^[ \t]*```[\s\S]*?\r?\n[ \t]*```/);
    if (codeMatch) {
      blocks.push(codeMatch[0]);
      remaining = remaining.slice(codeMatch[0].length).trim();
      continue;
    }

    // Accordion blocks (<Accordion...>...</Accordion> or <Accordions...>...</Accordions>)
    const accordionMatch = remaining.match(
      /^<(?:Accordion|Accordions)[\s\S]*?<\/(?:Accordion|Accordions)>/i,
    );
    if (accordionMatch) {
      blocks.push(accordionMatch[0]);
      remaining = remaining.slice(accordionMatch[0].length).trim();
      continue;
    }

    // Tabs blocks (<Tabs...>...</Tabs>)
    const tabsMatch = remaining.match(/^<Tabs[\s\S]*?<\/Tabs>/i);
    if (tabsMatch) {
      blocks.push(tabsMatch[0]);
      remaining = remaining.slice(tabsMatch[0].length).trim();
      continue;
    }

    // CodeBlockTabs blocks (<CodeBlockTabs...>...</CodeBlockTabs>)
    const codeBlockTabsMatch = remaining.match(
      /^<CodeBlockTabs[\s\S]*?<\/CodeBlockTabs>/i,
    );
    if (codeBlockTabsMatch) {
      blocks.push(codeBlockTabsMatch[0]);
      remaining = remaining.slice(codeBlockTabsMatch[0].length).trim();
      continue;
    }

    // CodeBlock component blocks (<CodeBlock...>...</CodeBlock>)
    const codeBlockCompMatch = remaining.match(
      /^<CodeBlock[\s\S]*?<\/CodeBlock>/i,
    );
    if (codeBlockCompMatch) {
      blocks.push(codeBlockCompMatch[0]);
      remaining = remaining.slice(codeBlockCompMatch[0].length).trim();
      continue;
    }

    // Cards or Card blocks
    const cardsMatch = remaining.match(/^<Cards[\s\S]*?<\/Cards>/i);
    if (cardsMatch) {
      blocks.push(cardsMatch[0]);
      remaining = remaining.slice(cardsMatch[0].length).trim();
      continue;
    }

    const cardMatch = remaining.match(/^<Card[\s\S]*?<\/Card>/i);
    if (cardMatch) {
      blocks.push(cardMatch[0]);
      remaining = remaining.slice(cardMatch[0].length).trim();
      continue;
    }

    // Callout blocks (<Callout...>...</Callout>)
    const calloutMatch = remaining.match(/^<Callout[\s\S]*?<\/Callout>/i);
    if (calloutMatch) {
      blocks.push(calloutMatch[0]);
      remaining = remaining.slice(calloutMatch[0].length).trim();
      continue;
    }

    // 5a. Banner blocks (<Banner...>...</Banner>)
    const bannerMatch = remaining.match(/^<Banner[\s\S]*?<\/Banner>/i);
    if (bannerMatch) {
      blocks.push(bannerMatch[0]);
      remaining = remaining.slice(bannerMatch[0].length).trim();
      continue;
    }

    // 5b. Steps blocks (<Steps...>...</Steps> containing ### headings)
    const stepsMatch = remaining.match(/^<Steps[\s\S]*?<\/Steps>/i);
    if (stepsMatch) {
      blocks.push(stepsMatch[0]);
      remaining = remaining.slice(stepsMatch[0].length).trim();
      continue;
    }

    // 5c. Table block (| Header | Header |\n| --- | --- |\n...)
    const tableMatch = remaining.match(
      /^(?:\|[^\n]+\|\r?\n\|(?:\s*:?-+:?\s*\|)+(?:\r?\n\|[^\n]*\|)*)/,
    );
    if (tableMatch) {
      blocks.push(tableMatch[0].trim());
      remaining = remaining.slice(tableMatch[0].length).trim();
      continue;
    }

    // 5d. TypeTable block (<TypeTable ... /> or <TypeTable ...>...</TypeTable>)
    const typeTableMatch = remaining.match(
      /^<TypeTable[\s\S]*?(?:\/>|<\/TypeTable>)/i,
    );
    if (typeTableMatch) {
      blocks.push(typeTableMatch[0].trim());
      remaining = remaining.slice(typeTableMatch[0].length).trim();
      continue;
    }

    // 5e. Files Tree block (<Files...>...</Files>)
    const filesMatch = remaining.match(/^<Files[\s\S]*?<\/Files>/i);
    if (filesMatch) {
      blocks.push(filesMatch[0].trim());
      remaining = remaining.slice(filesMatch[0].length).trim();
      continue;
    }

    // 5f. Profile Card block (<Profile ... /> or <Profile ...>...</Profile>)
    const profileMatch = remaining.match(
      /^<Profile\b[^>]*(?:\/>|>[\s\S]*?<\/Profile>)/i,
    );
    if (profileMatch) {
      blocks.push(profileMatch[0].trim());
      remaining = remaining.slice(profileMatch[0].length).trim();
      continue;
    }

    // 5g. Avatar Group block (<AvatarGroup ... /> or <AvatarGroup ...>...</AvatarGroup>)
    const avatarGroupMatch = remaining.match(
      /^<AvatarGroup[\s\S]*?(?:\/>|<\/AvatarGroup>)/i,
    );
    if (avatarGroupMatch) {
      blocks.push(avatarGroupMatch[0].trim());
      remaining = remaining.slice(avatarGroupMatch[0].length).trim();
      continue;
    }

    // 5h. Standalone Avatar block (<Avatar ... /> or <Avatar ...>...</Avatar>)
    const avatarMatch = remaining.match(
      /^<Avatar\b[^>]*(?:\/>|>[\s\S]*?<\/Avatar>)/i,
    );
    if (avatarMatch) {
      blocks.push(avatarMatch[0].trim());
      remaining = remaining.slice(avatarMatch[0].length).trim();
      continue;
    }

    // 5i. Rich Blockquote component (<Blockquote ...>...</Blockquote>)
    const blockquoteMatch = remaining.match(
      /^<Blockquote\b[^>]*(?:\/>|>[\s\S]*?<\/Blockquote>)/i,
    );
    if (blockquoteMatch) {
      blocks.push(blockquoteMatch[0].trim());
      remaining = remaining.slice(blockquoteMatch[0].length).trim();
      continue;
    }

    // Blockquote (> ...)
    const quoteMatch = remaining.match(/^(?:>[^\n]*\n?)+/);
    if (quoteMatch) {
      blocks.push(quoteMatch[0].trim());
      remaining = remaining.slice(quoteMatch[0].length).trim();
      continue;
    }

    // 6b. Markdown List (- ..., * ..., + ..., ..., - [ ] ...)
    const listMatch = remaining.match(
      /^(?:[ \t]*(?:[-*+](?![ \t]*[-*+])[ \t]+|\d+\.[ \t]+)[^\n]*(?:\r?\n|$))+/,
    );
    if (listMatch) {
      blocks.push(listMatch[0].trim());
      remaining = remaining.slice(listMatch[0].length).trim();
      continue;
    }

    // Chip Group (<div className="flex flex-wrap gap-2...">...</div>)
    const chipGroupMatch = remaining.match(
      /^<div className="flex flex-wrap gap-2[^"]*">[\s\S]*?<\/div>/i,
    );
    if (chipGroupMatch) {
      blocks.push(chipGroupMatch[0]);
      remaining = remaining.slice(chipGroupMatch[0].length).trim();
      continue;
    }

    // 7c. Heading JSX tag (<Heading ...>...</Heading>)
    const headingJsxMatch = remaining.match(
      /^<Heading\b[^>]*>[\s\S]*?<\/Heading>/i,
    );
    if (headingJsxMatch) {
      blocks.push(headingJsxMatch[0]);
      remaining = remaining.slice(headingJsxMatch[0].length).trim();
      continue;
    }

    // 7d. Line break (<br />, <br/>, <br>)
    const brMatch = remaining.match(/^<br\s*\/?>/i);
    if (brMatch) {
      blocks.push(brMatch[0]);
      remaining = remaining.slice(brMatch[0].length).trim();
      continue;
    }

    // Regular markdown (paragraphs, headings, dividers, etc.) up to next double newline or start of a block
    const nextCode = remaining.search(/\n\n[ \t]*```/);
    const nextAcc = remaining.search(/\n\n<(?:Accordion|Accordions)/i);
    const nextCodeBlockTabs = remaining.search(/\n\n<CodeBlockTabs/i);
    const nextCodeBlockComp = remaining.search(/\n\n<CodeBlock\b/i);
    const nextTabs = remaining.search(/\n\n<Tabs/i);
    const nextCards = remaining.search(/\n\n<Cards/i);
    const nextCard = remaining.search(/\n\n<Card/i);
    const nextCallout = remaining.search(/\n\n<Callout/i);
    const nextBanner = remaining.search(/\n\n<Banner/i);
    const nextSteps = remaining.search(/\n\n<Steps/i);
    const nextFiles = remaining.search(/\n\n[ \t]*<Files/i);
    const nextTable = remaining.search(
      /\n\n\|[^\n]+\|\r?\n\|(?:\s*:?-+:?\s*\|)+/,
    );
    const nextQuote = remaining.search(/\n\n>/);
    const nextList = remaining.search(
      /\n\n[ \t]*(?:[-*+](?![ \t]*[-*+])[ \t]+|\d+\.[ \t]+)/,
    );
    const nextChips = remaining.search(
      /\n\n<div className="flex flex-wrap gap-2/i,
    );
    const nextDoubleNewline = remaining.indexOf("\n\n");

    const splitCandidates = [
      nextCode,
      nextAcc,
      nextCodeBlockTabs,
      nextCodeBlockComp,
      nextTabs,
      nextCards,
      nextCard,
      nextCallout,
      nextBanner,
      nextSteps,
      nextFiles,
      nextTable,
      nextQuote,
      nextList,
      nextChips,
      nextDoubleNewline,
    ].filter((pos) => pos !== -1);

    if (splitCandidates.length > 0) {
      const splitAt = Math.min(...splitCandidates);
      const chunk = remaining.slice(0, splitAt).trim();
      if (chunk) blocks.push(chunk);
      remaining = remaining.slice(splitAt).trim();
    } else {
      if (remaining.trim()) blocks.push(remaining.trim());
      remaining = "";
    }
  }

  return blocks;
}

// Helper to parse both compound and prop-based <Card> MDX structures
function parseCardSnippet(rawCard: string): {
  title: string;
  badge: string;
  content: string;
} | null {
  // Compound syntax: <Card><Card.Header><Card.Title>...</Card.Title>...<Card.Content>...</Card.Content></Card>
  const compoundMatch = rawCard.match(
    /<Card[\s\S]*?>[\s\S]*?<Card\.Title>(.*?)<\/Card\.Title>(?:[\s\S]*?<Chip[^>]*>(.*?)<\/Chip>)?[\s\S]*?<Card\.Content>([\s\S]*?)<\/Card\.Content>[\s\S]*?<\/Card>/i,
  );
  if (compoundMatch) {
    return {
      title: compoundMatch[1]?.trim() || "",
      badge: compoundMatch[2]?.trim() || "",
      content: compoundMatch[3]?.trim() || "",
    };
  }

  // Prop syntax: <Card title="..." badge="...">...body...</Card>
  const propMatch = rawCard.match(/^<Card\b([^>]*)>([\s\S]*?)<\/Card>$/i);
  if (propMatch) {
    const attrs = propMatch[1] || "";
    const content = propMatch[2]?.trim() || "";
    const titleMatch = attrs.match(
      /title=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/,
    );
    const badgeMatch = attrs.match(
      /badge=(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/,
    );
    return {
      title: (titleMatch
        ? titleMatch[1] || titleMatch[2] || titleMatch[3] || ""
        : ""
      )
        .replace(/&quot;/g, '"')
        .trim(),
      badge: (badgeMatch
        ? badgeMatch[1] || badgeMatch[2] || badgeMatch[3] || ""
        : ""
      )
        .replace(/&quot;/g, '"')
        .trim(),
      content,
    };
  }

  return null;
}

// Helper to parse GFM markdown tables into headers, alignments, and rows
function parseMarkdownTable(raw: string): {
  headers: string[];
  alignments: ("left" | "center" | "right")[];
  rows: string[][];
} | null {
  const lines = raw
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return null;

  const isRow = (l: string) => l.startsWith("|") && l.endsWith("|");
  if (!isRow(lines[0]) || !isRow(lines[1])) return null;

  // Check delimiter row
  const delimiterParts = lines[1]
    .slice(1, -1)
    .split("|")
    .map((p) => p.trim());
  const isDelimiter =
    delimiterParts.length > 0 &&
    delimiterParts.every((p) => /^:?-+:?$/.test(p));
  if (!isDelimiter) return null;

  const headers = lines[0]
    .slice(1, -1)
    .split("|")
    .map((h) => h.trim().replace(/\\\|/g, "|"));

  const alignments: ("left" | "center" | "right")[] = delimiterParts.map(
    (p) => {
      if (p.startsWith(":") && p.endsWith(":")) return "center";
      if (p.endsWith(":")) return "right";
      return "left";
    },
  );

  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    if (!isRow(lines[i])) break;
    const cells = lines[i]
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim().replace(/\\\|/g, "|"));
    while (cells.length < headers.length) cells.push("");
    rows.push(cells.slice(0, headers.length));
  }

  return { headers, alignments, rows };
}

// Helper to parse Fumadocs TypeTable <TypeTable type={{ ... }} /> into parameter objects
function parseTypeTableParameters(raw: string): TypeTableProperty[] {
  const typeIdx = raw.indexOf("type={");
  if (typeIdx === -1) return [];

  let depth = 0;
  let inString: string | null = null;
  let start = -1;

  for (let i = typeIdx + 5; i < raw.length; i++) {
    const ch = raw[i];
    const prev = raw[i - 1];

    if (inString) {
      if (ch === inString && prev !== "\\") {
        inString = null;
      }
      continue;
    }

    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const outer = raw.slice(start, i + 1);
        const inner = outer.replace(/^\{|\}$/g, "").trim();
        try {
          const obj = new Function("return (" + inner + ")")();
          if (obj && typeof obj === "object") {
            return Object.entries(obj).map(([name, val]: [string, any]) => ({
              name,
              type: typeof val?.type === "string" ? val.type : "string",
              description:
                typeof val?.description === "string" ? val.description : "",
              default: val?.default !== undefined ? String(val.default) : "",
              required: Boolean(val?.required),
              deprecated: Boolean(val?.deprecated),
              typeDescriptionLink:
                typeof val?.typeDescriptionLink === "string"
                  ? val.typeDescriptionLink
                  : "",
            }));
          }
        } catch {
          // ignore parsing error
        }
        break;
      }
    }
  }

  return [];
}

// Helper to parse Fumadocs <Files>...</Files> tree into FileTreeNode[]
function parseFilesChildren(content: string): FileTreeNode[] {
  const nodes: FileTreeNode[] = [];
  let remaining = content.trim();

  while (remaining.length > 0) {
    remaining = remaining.trim();
    if (!remaining) break;

    // Folder match: <Folder name="..." [defaultOpen]> ... </Folder>
    if (/^<Folder/i.test(remaining)) {
      let depth = 0;
      let endIdx = -1;
      const folderTagRegex = /<Folder\b[^>]*>|<\/Folder>/gi;
      let match: RegExpExecArray | null;

      while ((match = folderTagRegex.exec(remaining)) !== null) {
        if (match[0].startsWith("</")) {
          depth--;
          if (depth === 0) {
            endIdx = match.index + match[0].length;
            break;
          }
        } else {
          depth++;
        }
      }

      if (endIdx !== -1) {
        const fullFolder = remaining.slice(0, endIdx);
        remaining = remaining.slice(endIdx).trim();

        const openMatch = fullFolder.match(
          /^<Folder\b([^>]*)>([\s\S]*?)<\/Folder>$/i,
        );
        if (openMatch) {
          const attrs = openMatch[1];
          const inner = openMatch[2];
          const nameMatch = attrs.match(/name="([^"]*)"/i);
          const defaultOpen = /\bdefaultOpen\b/i.test(attrs);

          nodes.push({
            id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            type: "folder",
            name: nameMatch ? nameMatch[1] : "folder",
            defaultOpen,
            children: parseFilesChildren(inner),
          });
          continue;
        }
      }
    }

    // File match: <File name="..." [icon=...] /> or <File name="...">...</File>
    const fileMatch = remaining.match(
      /^<File\b([^>]*?)(?:\/>|>([\s\S]*?)<\/File>)/i,
    );
    if (fileMatch) {
      const attrs = fileMatch[1];
      const nameMatch = attrs.match(/name="([^"]*)"/i);
      nodes.push({
        id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        type: "file",
        name: nameMatch ? nameMatch[1] : "file",
      });
      remaining = remaining.slice(fileMatch[0].length).trim();
      continue;
    }

    // Advance past unknown tag/char
    const nextTag = remaining.indexOf("<", 1);
    if (nextTag !== -1) {
      remaining = remaining.slice(nextTag).trim();
    } else {
      break;
    }
  }

  return nodes;
}

function extractItemsProp(str: string): any[] {
  const startIdx = str.indexOf("items={");
  if (startIdx === -1) return [];
  let depth = 0;
  let inString: string | null = null;
  const jsonStart = startIdx + 7;
  let jsonEnd = -1;

  for (let i = startIdx + 6; i < str.length; i++) {
    const char = str[i];
    if (inString) {
      if (char === inString && str[i - 1] !== "\\") {
        inString = null;
      }
    } else if (char === '"' || char === "'" || char === "`") {
      inString = char;
    } else if (char === "{" || char === "[") {
      depth++;
    } else if (char === "}" || char === "]") {
      depth--;
      if (depth === 0) {
        jsonEnd = i;
        break;
      }
    }
  }

  if (jsonEnd !== -1) {
    const raw = str.slice(jsonStart, jsonEnd);
    try {
      const parsed = new Function(`return (${raw});`)();
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  return [];
}

export function mdxToBlocks(mdx: string): MdxBlock[] {
  if (!mdx || mdx.trim() === "") {
    return [];
  }

  const blocks: MdxBlock[] = [];
  const rawSegments = splitMdxIntoBlocks(mdx);

  for (const raw of rawSegments) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Heading (#, ##, ###, ####, #####, ######)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      blocks.push(createBlock("heading", { level, text }));
      continue;
    }

    // 1b. Heading JSX (<Heading as="h1..6" ...>...</Heading>)
    const jsxHeadingMatch = trimmed.match(
      /^<Heading\b([^>]*)>([\s\S]*?)<\/Heading>$/i,
    );
    if (jsxHeadingMatch) {
      const attrs = jsxHeadingMatch[1] || "";
      const text = jsxHeadingMatch[2].trim();
      const asMatch = attrs.match(/as=["']h([1-6])["']/i);
      const level = asMatch ? Number(asMatch[1]) : 2;
      const idMatch = attrs.match(/id=["']([^"']*)["']/i);
      const alignMatch = attrs.match(/className=["']([^"']*)["']/i);
      const classes = alignMatch ? alignMatch[1] : "";
      const align = classes.includes("text-center")
        ? "center"
        : classes.includes("text-right")
          ? "right"
          : "left";
      blocks.push(
        createBlock("heading", {
          level,
          text,
          ...(idMatch ? { id: idMatch[1] } : {}),
          ...(align !== "left" ? { align } : {}),
        }),
      );
      continue;
    }

    // Divider (---)
    if (trimmed === "---" || trimmed === "***") {
      blocks.push(createBlock("divider"));
      continue;
    }

    // 2b. Line break (<br/>, <br />, <br>)
    if (/^<br\s*\/?>$/i.test(trimmed)) {
      blocks.push(createBlock("break"));
      continue;
    }

    // Callout (<Callout ...> or > [!NOTE], etc.)
    const jsxCalloutMatch = trimmed.match(
      /<Callout\s*([^>]*?)>([\s\S]*?)<\/Callout>/i,
    );
    if (jsxCalloutMatch) {
      const attrs = jsxCalloutMatch[1];
      const content = jsxCalloutMatch[2].trim();

      const typeMatch = attrs.match(/type="([^"]*)"/i);
      const titleMatch = attrs.match(/title="([^"]*)"/i);

      const rawType = (typeMatch ? typeMatch[1] : "").toLowerCase();
      const calloutType =
        rawType === "error" || rawType === "danger"
          ? "danger"
          : rawType === "warn" || rawType === "warning"
            ? "warning"
            : "info";

      blocks.push(
        createBlock("callout", {
          calloutType,
          title: titleMatch ? titleMatch[1] : "",
          content,
        }),
      );
      continue;
    }

    const calloutMatch = trimmed.match(/^>\s*\[!([A-Z]+)\]\n?([\s\S]*)$/i);
    if (calloutMatch) {
      const typeStr = calloutMatch[1].toLowerCase();
      const body = calloutMatch[2]
        .split("\n")
        .map((l) => l.replace(/^>\s?/, ""))
        .join("\n")
        .trim();

      const boldTitleMatch = body.match(/^\*\*(.*?)\*\*\n?([\s\S]*)$/);
      const title = boldTitleMatch ? boldTitleMatch[1] : "";
      const content = boldTitleMatch ? boldTitleMatch[2].trim() : body;

      const calloutType =
        typeStr === "danger" || typeStr === "caution"
          ? "danger"
          : typeStr === "warning"
            ? "warning"
            : "info";

      blocks.push(
        createBlock("callout", {
          calloutType,
          title,
          content,
        }),
      );
      continue;
    }

    // 3b. Banner (<Banner ...> ... </Banner>)
    const bannerMatch = trimmed.match(/^<Banner([^>]*)>([\s\S]*?)<\/Banner>$/i);
    if (bannerMatch) {
      const attrs = bannerMatch[1] || "";
      const variantMatch = attrs.match(/variant=["']([^"']*)["']/i);
      const idMatch = attrs.match(/id=["']([^"']*)["']/i);
      blocks.push(
        createBlock("banner", {
          variant: variantMatch ? variantMatch[1] : "normal",
          dismissible: Boolean(idMatch),
          id: idMatch ? idMatch[1] : "site-banner",
          text: bannerMatch[2].trim(),
        }),
      );
      continue;
    }

    // Code Block (```lang [meta] ... ```) - tolerant to leading indentation on fences & body
    const codeMatch = trimmed.match(
      /^[ \t]*```([a-zA-Z0-9_#-]+)?([^\n]*)\r?\n([\s\S]*?)\r?\n[ \t]*```$/,
    );
    if (codeMatch) {
      const language = codeMatch[1] || "typescript";
      const meta = codeMatch[2] || "";
      const code = dedentCode(codeMatch[3] || "");

      const titleMatch = meta.match(/title=["']([^"']+)["']/);
      const title = titleMatch ? titleMatch[1] : "";
      const showLineNumbers =
        /showLineNumbers\b/.test(meta) || /lineNumbers\b/.test(meta);
      const wrapLines = /\bwrap\b/.test(meta) || /\bwrapLines\b/.test(meta);
      const highlightMatch = meta.match(/\{([0-9,-]+)\}/);
      const highlight = highlightMatch ? highlightMatch[1] : "";

      blocks.push(
        createBlock("code", {
          language,
          title,
          showLineNumbers,
          wrapLines,
          highlight,
          code,
        }),
      );
      continue;
    }

    // Image (![alt](src) or <ImageZoom ... /> or <img ... />)
    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)(?:\n+\*(.*?)\*)?$/);
    if (imageMatch) {
      blocks.push(
        createBlock("image", {
          alt: imageMatch[1] || "Image",
          src: imageMatch[2] || "",
          caption: imageMatch[3] || "",
        }),
      );
      continue;
    }

    const jsxImageMatch = trimmed.match(
      /^<(ImageZoom|img)\s+([^>]*?)\/>(?:\n+\*(.*?)\*)?$/i,
    );
    if (jsxImageMatch) {
      const tagName = jsxImageMatch[1];
      const attrs = jsxImageMatch[2] || "";
      const caption = jsxImageMatch[3] || "";

      const srcMatch = attrs.match(/src=["']([^"']*)["']/);
      const altMatch = attrs.match(/alt=["']([^"']*)["']/);
      const widthMatch = attrs.match(/width=\{?(\d+)\}?/);
      const heightMatch = attrs.match(/height=\{?(\d+)\}?/);
      const classMatch = attrs.match(/className=["']([^"']*)["']/);
      const cls = classMatch ? classMatch[1] : "";

      const size = cls.includes("w-1/3")
        ? "sm"
        : cls.includes("w-1/2")
          ? "md"
          : cls.includes("w-3/4")
            ? "lg"
            : widthMatch || heightMatch
              ? "custom"
              : "full";

      const align = cls.includes("mr-auto")
        ? "left"
        : cls.includes("ml-auto")
          ? "right"
          : "center";

      const aspectRatio = cls.includes("aspect-video")
        ? "16/9"
        : cls.includes("aspect-4/3")
          ? "4/3"
          : cls.includes("aspect-square")
            ? "1/1"
            : cls.includes("aspect-[21/9]")
              ? "21/9"
              : "auto";

      const objectFit = cls.includes("object-contain") ? "contain" : "cover";

      const rounded = cls.includes("rounded-none")
        ? "none"
        : cls.includes("rounded-2xl")
          ? "2xl"
          : cls.includes("rounded-xl")
            ? "xl"
            : cls.includes("rounded-full")
              ? "full"
              : "md";

      blocks.push(
        createBlock("image", {
          src: srcMatch ? srcMatch[1] : "",
          alt: altMatch ? altMatch[1] : "Image",
          zoomable: tagName.toLowerCase() === "imagezoom",
          size,
          align,
          aspectRatio,
          objectFit,
          rounded,
          width: widthMatch ? Number(widthMatch[1]) : "",
          height: heightMatch ? Number(heightMatch[1]) : "",
          caption,
        }),
      );
      continue;
    }

    // Cards Container (<Cards> ... </Cards>)
    const cardsContainerMatch = trimmed.match(
      /^<Cards[\s\S]*?>([\s\S]*?)<\/Cards>$/i,
    );
    if (cardsContainerMatch) {
      const cardsBody = cardsContainerMatch[1];
      const rawCards = cardsBody.match(/<Card[\s\S]*?<\/Card>/gi) || [];
      if (rawCards.length > 0) {
        for (const rc of rawCards) {
          const parsed = parseCardSnippet(rc.trim());
          if (parsed) {
            blocks.push(createBlock("card", parsed));
          }
        }
        continue;
      }
    }

    // Single Card (<Card>...</Card>)
    const cardMatch = trimmed.match(/^<Card[\s\S]*?<\/Card>$/i);
    if (cardMatch) {
      const parsed = parseCardSnippet(trimmed);
      if (parsed) {
        blocks.push(createBlock("card", parsed));
        continue;
      }
    }

    // Tabs Container (<Tabs ...> ... </Tabs>)
    const tabsMatch = trimmed.match(/<Tabs[\s\S]*?>([\s\S]*?)<\/Tabs>/i);
    if (tabsMatch) {
      const tabBody = tabsMatch[1];
      const tabItemMatches = [
        ...tabBody.matchAll(/<Tab\s+value=["'](.*?)["']>([\s\S]*?)<\/Tab>/gi),
      ];
      if (tabItemMatches.length > 0) {
        const parsedTabs = tabItemMatches.map((m) => {
          const title = m[1].trim();
          const innerContent = dedentCode(m[2]);
          const nested = mdxToBlocks(innerContent);
          return {
            id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            title,
            content: innerContent,
            blocks:
              nested.length > 0
                ? nested
                : [createBlock("paragraph", { text: innerContent || "" })],
          };
        });
        blocks.push(createBlock("tabs", { tabs: parsedTabs }));
        continue;
      }
    }

    // CodeBlockTabs Container (<CodeBlockTabs ...> ... </CodeBlockTabs>)
    const codeBlockTabsMatch = trimmed.match(
      /^<CodeBlockTabs\b([\s\S]*?)<\/CodeBlockTabs>$/i,
    );
    if (codeBlockTabsMatch) {
      const wholeContent = codeBlockTabsMatch[0];
      const defMatch = wholeContent.match(/defaultValue=["']([^"']*)["']/i);
      const defaultValue = defMatch ? defMatch[1] : undefined;

      // Extract triggers from <CodeBlockTabsList>
      const triggersMap = new Map<string, string>();
      const triggerMatches = [
        ...wholeContent.matchAll(
          /<CodeBlockTabsTrigger\s+value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/CodeBlockTabsTrigger>/gi,
        ),
      ];
      for (const tm of triggerMatches) {
        triggersMap.set(tm[1].trim(), tm[2].trim());
      }

      // Extract each <CodeBlockTab value="...">
      const tabMatches = [
        ...wholeContent.matchAll(
          /<CodeBlockTab\s+value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/CodeBlockTab>/gi,
        ),
      ];

      const parsedTabs: any[] = [];
      for (const tm of tabMatches) {
        const val = tm[1].trim();
        const inner = tm[2].trim();
        const label = triggersMap.get(val) || val;

        // Parse code block inside (handling indented markdown code fences)
        const trimmedInner = inner.trim();
        const codeFenceMatch = trimmedInner.match(
          /^```([a-zA-Z0-9_#-]+)?([^\n]*)\r?\n([\s\S]*?)\r?\n[ \t]*```$/,
        );

        if (codeFenceMatch) {
          const language = codeFenceMatch[1] || "bash";
          const meta = codeFenceMatch[2] || "";
          const code = dedentCode(codeFenceMatch[3] || "");
          const titleMatch = meta.match(/title=["']([^"']+)["']/);

          parsedTabs.push({
            id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            value: val,
            label,
            language,
            title: titleMatch ? titleMatch[1] : "",
            code,
          });
        } else {
          const cleaned = dedentCode(
            trimmedInner
              .replace(/^[ \t]*```[^\n]*\r?\n/, "")
              .replace(/\r?\n[ \t]*```$/, ""),
          );
          parsedTabs.push({
            id: `tab-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            value: val,
            label,
            language: "bash",
            code: cleaned,
          });
        }
      }

      if (parsedTabs.length > 0) {
        blocks.push(
          createBlock("codeBlockTabs", {
            defaultValue: defaultValue || parsedTabs[0]?.value,
            tabs: parsedTabs,
          }),
        );
        continue;
      }
    }

    // Accordion Container (<Accordion ...> ... </Accordion> or <Accordions ...>)
    const accordionMatch = trimmed.match(
      /<(?:Accordion|Accordions)([\s\S]*?)>([\s\S]*?)<\/(?:Accordion|Accordions)>/i,
    );
    if (accordionMatch) {
      const attrs = accordionMatch[1];
      const accBody = accordionMatch[2];
      const isSingle = /\btype=["']single["']/i.test(attrs);
      const itemMatches = [
        ...accBody.matchAll(
          /<(?:AccordionItem|Accordion)\s+[^>]*?title=["']([^"']*)["'][^>]*>([\s\S]*?)<\/(?:AccordionItem|Accordion)>/gi,
        ),
      ];
      if (itemMatches.length > 0) {
        const items = itemMatches.map((m) => ({
          title: m[1].trim(),
          content: m[2].trim(),
        }));
        blocks.push(
          createBlock("accordion", { items, allowMultiple: !isSingle }),
        );
        continue;
      }
    }

    // 8b. Steps Container (<Steps> ... </Steps>, fumadocs v15 <Step> wrappers,
    // or the legacy ###-heading directly under <Steps>)
    const stepsBlockMatch = trimmed.match(/^<Steps[^>]*>([\s\S]*?)<\/Steps>$/i);
    if (stepsBlockMatch) {
      const stepsBody = stepsBlockMatch[1];

      // Preferred modern form: <Step> wrappers
      const stepWrapperMatches = [
        ...stepsBody.matchAll(/<Step\b[^>]*>([\s\S]*?)<\/Step>/gi),
      ];
      if (stepWrapperMatches.length > 0) {
        const steps = stepWrapperMatches.map((m) => {
          const body = m[1].trim();
          const heading = body.match(/^\s*###\s+(.*)$/m);
          if (heading) {
            const start = (heading.index ?? 0) + heading[0].length;
            return {
              title: heading[1].trim(),
              content: body.slice(start).trim(),
            };
          }
          // Step without a ### heading (e.g. "**Bold lead.** explanation")
          return { title: "", content: body };
        });
        blocks.push(createBlock("steps", { steps }));
        continue;
      }

      // Legacy form: ### headings directly inside <Steps>
      const headingMatches = [...stepsBody.matchAll(/^\s*###\s+(.*)$/gm)];
      if (headingMatches.length > 0) {
        const steps = headingMatches.map((m, i) => {
          const title = m[1].trim();
          const start = (m.index ?? 0) + m[0].length;
          const end =
            i + 1 < headingMatches.length
              ? (headingMatches[i + 1].index ?? stepsBody.length)
              : stepsBody.length;
          const content = stepsBody.slice(start, end).trim();
          return { title, content };
        });
        blocks.push(createBlock("steps", { steps }));
        continue;
      }
    }

    // Chip Group (<div className="flex flex-wrap gap-2..."> ... </div>)
    const chipGroupMatch = trimmed.match(
      /^<div className="flex flex-wrap gap-2[^"]*">([\s\S]*?)<\/div>$/i,
    );
    if (chipGroupMatch) {
      const chipMatches = [
        ...chipGroupMatch[1].matchAll(/<Chip([^>]*)>(.*?)<\/Chip>/gi),
      ];
      if (chipMatches.length > 0) {
        const chips = chipMatches.map((m) => m[2].trim());
        const firstAttrs = chipMatches[0][1];
        const colorMatch = firstAttrs.match(/color=["'](.*?)["']/);
        const variantMatch = firstAttrs.match(/variant=["'](.*?)["']/);
        const sizeMatch = firstAttrs.match(/size=["'](.*?)["']/);
        blocks.push(
          createBlock("chipGroup", {
            chips,
            color: colorMatch ? colorMatch[1] : "accent",
            variant: variantMatch ? variantMatch[1] : "soft",
            size: sizeMatch ? sizeMatch[1] : "sm",
          }),
        );
        continue;
      }
    }

    // 9b. Table block
    const tableData = parseMarkdownTable(trimmed);
    if (tableData) {
      blocks.push(createBlock("table", tableData));
      continue;
    }

    // 9c. TypeTable block (<TypeTable ... /> or <TypeTable ...>...</TypeTable>)
    if (/^<TypeTable/i.test(trimmed)) {
      const parameters = parseTypeTableParameters(trimmed);
      blocks.push(createBlock("typeTable", { parameters }));
      continue;
    }

    // 9d. Files Tree block (<Files...>...</Files>)
    const filesBlockMatch = trimmed.match(
      /^<Files\b[^>]*>([\s\S]*?)<\/Files>/i,
    );
    if (filesBlockMatch) {
      const items = parseFilesChildren(filesBlockMatch[1]);
      blocks.push(createBlock("files", { items }));
      continue;
    }

    // 9e. Profile Card block (<Profile ... /> or <Profile ...>...</Profile>)
    const profileBlockMatch =
      trimmed.match(/^<Profile\b([^>]*)>(?:[\s\S]*?<\/Profile>)?/i) ||
      trimmed.match(/^<Profile\b([^>]*)\/>/i);
    if (profileBlockMatch) {
      const attrs = profileBlockMatch[1] || "";
      const getAttr = (name: string) => {
        const m = attrs.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
        return m ? m[1] : undefined;
      };
      const getBoolAttr = (name: string) => {
        const m = attrs.match(new RegExp(`${name}=\\{?(true|false)\\}?`, "i"));
        return m ? m[1] === "true" : undefined;
      };
      blocks.push(
        createBlock("profile", {
          src: getAttr("src") || "",
          name: getAttr("name") || "Alex Morgan",
          description: getAttr("description") || "",
          size: getAttr("size") || "md",
          shape: getAttr("shape") || "circle",
          align: getAttr("align") || "left",
          bordered: getBoolAttr("bordered") !== false,
          color: getAttr("color") || "default",
          href: getAttr("href") || "",
        }),
      );
      continue;
    }

    // 9f. Avatar Group block (<AvatarGroup ... /> or <AvatarGroup ...>...</AvatarGroup>)
    const avatarGroupBlockMatch =
      trimmed.match(/^<AvatarGroup\b([\s\S]*?)>([\s\S]*?)<\/AvatarGroup>/i) ||
      trimmed.match(/^<AvatarGroup\b([\s\S]*?)\/>/i);
    if (avatarGroupBlockMatch) {
      const attrs = avatarGroupBlockMatch[1] || "";
      const inner = avatarGroupBlockMatch[2] || "";
      const getAttr = (name: string) => {
        const m = attrs.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
        return m ? m[1] : undefined;
      };
      const getNumAttr = (name: string) => {
        const m = attrs.match(new RegExp(`${name}=\\{?([0-9]+)\\}?`, "i"));
        return m ? Number(m[1]) : undefined;
      };
      const getMaxAttr = () => {
        if (
          /max=\{?Infinity\}?/i.test(attrs) ||
          /max=["']infinity["']/i.test(attrs) ||
          /max=["']∞["']/i.test(attrs)
        ) {
          return Infinity;
        }
        return getNumAttr("max") ?? Infinity;
      };
      const getBoolAttr = (name: string) => {
        const m = attrs.match(new RegExp(`${name}=\\{?(true|false)\\}?`, "i"));
        return m ? m[1] === "true" : undefined;
      };

      const items: any[] = extractItemsProp(trimmed);

      if (items.length === 0 && inner) {
        const tagRegex = /<Avatar\b([^>]*)\/?>/gi;
        let m: RegExpExecArray | null;
        while ((m = tagRegex.exec(inner)) !== null) {
          const a = m[1];
          const gName = a.match(/name=["']([^"']*)["']/i);
          const gSrc = a.match(/src=["']([^"']*)["']/i);
          const gHref = a.match(/href=["']([^"']*)["']/i);
          items.push({
            name: gName ? gName[1] : "",
            src: gSrc ? gSrc[1] : "",
            href: gHref ? gHref[1] : "",
          });
        }
      }

      blocks.push(
        createBlock("avatar", {
          items,
          max: getMaxAttr(),
          size: getAttr("size") || "md",
          shape: getAttr("shape") || "circle",
          align: getAttr("align") || "left",
          bordered: getBoolAttr("bordered") !== false,
        }),
      );
      continue;
    }

    // 9g. Standalone Avatar block (<Avatar ... />)
    const singleAvatarMatch =
      trimmed.match(/^<Avatar\b([^>]*)>(?:[\s\S]*?<\/Avatar>)?/i) ||
      trimmed.match(/^<Avatar\b([^>]*)\/>/i);
    if (singleAvatarMatch) {
      const attrs = singleAvatarMatch[1] || "";
      const getAttr = (name: string) => {
        const m = attrs.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
        return m ? m[1] : undefined;
      };
      blocks.push(
        createBlock("avatar", {
          items: [
            {
              name: getAttr("name") || "",
              src: getAttr("src") || "",
              href: getAttr("href") || "",
            },
          ],
          size: getAttr("size") || "md",
        }),
      );
      continue;
    }

    // 9h. Rich <Blockquote ...>...</Blockquote> component
    const jsxBlockquoteMatch =
      trimmed.match(/^<Blockquote\b([^>]*)>([\s\S]*?)<\/Blockquote>/i) ||
      trimmed.match(/^<Blockquote\b([^>]*)\/>/i);
    if (jsxBlockquoteMatch) {
      const attrs = jsxBlockquoteMatch[1] || "";
      const innerContent = jsxBlockquoteMatch[2]
        ? jsxBlockquoteMatch[2].trim()
        : "";
      const getAttr = (name: string) => {
        const m = attrs.match(new RegExp(`${name}=["']([^"']*)["']`, "i"));
        return m ? m[1] : undefined;
      };
      blocks.push(
        createBlock("blockquote", {
          quote: innerContent || getAttr("quote") || "",
          author: getAttr("author") || "",
          role: getAttr("role") || "",
          cite: getAttr("cite") || "",
          avatar: getAttr("avatar") || "",
          borderStyle: getAttr("borderStyle") || "left-accent",
        }),
      );
      continue;
    }

    // 9i. Standard markdown quote (> ...) that is not a GitHub callout
    if (trimmed.startsWith(">")) {
      const lines = trimmed.split("\n").map((l) => l.replace(/^>\s?/, ""));
      const text = lines.join("\n").trim();
      blocks.push(
        createBlock("blockquote", {
          quote: text,
          author: "",
          role: "",
          cite: "",
          avatar: "",
          borderStyle: "left-accent",
        }),
      );
      continue;
    }

    // 9j. Markdown List (- ..., * ..., + ..., ..., - [ ] ...)
    const listLineRegex = /^[ \t]*(?:[-*+](?![ \t]*[-*+])[ \t]+|\d+\.[ \t]+)/;
    const lines = trimmed.split(/\r?\n/);
    if (
      lines.length > 0 &&
      lines.some((line) => listLineRegex.test(line)) &&
      lines.every((line) => !line.trim() || listLineRegex.test(line))
    ) {
      let detectedType: ListType = "bullet";
      let hasTask = false;
      let hasOrdered = false;

      const items: ListItem[] = [];
      for (const line of lines) {
        const lTrim = line.trim();
        if (!lTrim) continue;

        const taskMatch = lTrim.match(
          /^[-*+][ \t]+\[([ xX])\](?:[ \t]+(.*))?$/,
        );
        if (taskMatch) {
          hasTask = true;
          items.push({
            id: `li-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            checked: taskMatch[1].toLowerCase() === "x",
            text: taskMatch[2] || "",
          });
          continue;
        }

        const orderedMatch = lTrim.match(/^\d+\.[ \t]+(.*)$/);
        if (orderedMatch) {
          hasOrdered = true;
          items.push({
            id: `li-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            text: orderedMatch[1] || "",
          });
          continue;
        }

        const bulletMatch = lTrim.match(/^[-*+][ \t]+(.*)$/);
        if (bulletMatch) {
          items.push({
            id: `li-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            text: bulletMatch[1] || "",
          });
          continue;
        }
      }

      if (items.length > 0) {
        if (hasTask) detectedType = "task";
        else if (hasOrdered) detectedType = "ordered";
        else detectedType = "bullet";

        blocks.push(
          createBlock("list", {
            listType: detectedType,
            items,
          }),
        );
        continue;
      }
    }

    // Default: Plain text paragraph
    blocks.push(createBlock("paragraph", { text: trimmed }));
  }
  return blocks;
}
