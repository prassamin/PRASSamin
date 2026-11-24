import { MdxBlock, ListType, ListItem } from "../types";
import { parseUserMentions } from "../components/user-mention-utils";
import { parseShorthandParams } from "@/lib/remark-templates";
import {
  createBlock,
  dedentCode,
  parseCardSnippet,
  parseMarkdownTable,
  parseTypeTableParameters,
  parseFilesChildren,
  extractItemsProp,
} from "./utils";
import { splitMdxIntoBlocks } from "./split-mdx-chunks";

export function mdxToBlocks(mdx: string): MdxBlock[] {
  if (!mdx || mdx.trim() === "") {
    return [];
  }

  // Pre-normalize spacing around headings to ensure that content missing an empty
  // line between a heading and its following bullet list/paragraph parses cleanly into
  // separate AST blocks instead of collapsing into a single raw paragraph block.
  const normalizedMdx = mdx
    .replace(/\r\n/g, "\n")
    .replace(/(^|[^\n])\n(#{1,6}[ \t]+[^\n]+)/g, "$1\n\n$2")
    .replace(/(#{1,6}[ \t]+[^\n]+)\n([^\n#])/g, "$1\n\n$2");

  const blocks: MdxBlock[] = [];
  const rawSegments = splitMdxIntoBlocks(normalizedMdx);

  for (const raw of rawSegments) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Standalone #template-name or #template-name(k="v") shorthand usage
    const shorthandMatch = trimmed.match(
      /^#([a-zA-Z_][a-zA-Z0-9_-]*)(?:\(([^)\r\n]*)\))?$/,
    );
    if (shorthandMatch) {
      const values = parseShorthandParams(shorthandMatch[2]);
      blocks.push(
        createBlock("useTemplate", {
          name: shorthandMatch[1],
          mode: "shorthand",
          values,
        }),
      );
      continue;
    }

    // Template definition (<Template name="..." ...>...</Template>)
    const templateDefMatch = trimmed.match(
      /^<Template\b([^>]*)>([\s\S]*?)<\/Template>$/i,
    );
    if (templateDefMatch) {
      const attrs = templateDefMatch[1] || "";
      const nameMatch = attrs.match(/name=["']([^"']*)["']/i);
      const name =
        (nameMatch ? nameMatch[1] : "my-template").trim() || "my-template";
      const innerContent = dedentCode(templateDefMatch[2] || "").trim();
      const userMention = parseUserMentions(innerContent)[0] ?? null;

      let nestedBlocks: MdxBlock[] = [];
      if (
        userMention &&
        /^<User(?![A-Za-z0-9_])[\s\S]*?\/>$/i.test(innerContent)
      ) {
        nestedBlocks = [
          createBlock("user", {
            name: userMention.name,
            avatar: userMention.avatar || "",
            role: userMention.role || "",
            href: userMention.href || "",
            bio: userMention.bio || "",
          }),
        ];
      } else if (innerContent) {
        nestedBlocks = mdxToBlocks(innerContent);
      }

      blocks.push(
        createBlock("template", {
          name,
          blocks: nestedBlocks,
        }),
      );
      continue;
    }

    // Template usage (<UseTemplate name="..." prop="val" />)
    const useTemplateDefMatch = trimmed.match(
      /^<UseTemplate\b([^>]*?)(?:\/>|>[\s\S]*?<\/UseTemplate>)$/i,
    );
    if (useTemplateDefMatch) {
      const attrsStr = useTemplateDefMatch[1] || "";
      let templateName = "";
      const values: Record<string, string> = {};
      const attrRegex =
        /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/g;
      let attrMatch: RegExpExecArray | null;
      while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
        const key = attrMatch[1];
        let val = "";
        if (attrMatch[2] !== undefined) {
          val = attrMatch[2].replace(/&quot;/g, '"');
        } else if (attrMatch[3] !== undefined) {
          val = attrMatch[3].replace(/&quot;/g, '"');
        } else if (attrMatch[4] !== undefined) {
          val = attrMatch[4].trim().replace(/^["'`]|["'`]$/g, "");
        }
        if (key === "name") {
          templateName = val.trim();
        } else {
          values[key] = val;
        }
      }
      blocks.push(
        createBlock("useTemplate", {
          name: templateName,
          values,
        }),
      );
      continue;
    }

    // Heading (#, ##, ###, ####, #####, ######)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      blocks.push(createBlock("heading", { level, text }));
      continue;
    }

    // 1b. Heading JSX (<Heading as="h1..6" ...>...</Heading>) or standard HTML <h1>..<h6>
    const jsxHeadingMatch =
      trimmed.match(/^<Heading\b([^>]*)>([\s\S]*?)<\/Heading>$/i) ||
      trimmed.match(/^<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>$/i);
    if (jsxHeadingMatch) {
      const isHtmlHeading = /^<h[1-6]\b/i.test(trimmed);
      const attrs = (isHtmlHeading ? jsxHeadingMatch[2] : jsxHeadingMatch[1]) || "";
      const text = (isHtmlHeading ? jsxHeadingMatch[3] : jsxHeadingMatch[2] || "").trim();
      const asMatch = attrs.match(/as=["']h([1-6])["']/i);
      const level = isHtmlHeading
        ? Number(jsxHeadingMatch[1])
        : asMatch
          ? Number(asMatch[1])
          : 2;
      const idMatch = attrs.match(/id=["']([^"']*)["']/i);
      const alignMatch = attrs.match(/(?:className|class)=["']([^"']*)["']/i);
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

    // Divider (--- or <hr ... />)
    if (trimmed === "---" || trimmed === "***" || /^<hr\b[^>]*\/?>$/i.test(trimmed)) {
      const clsMatch = trimmed.match(/(?:className|class)=["']([^"']*)["']/i);
      const cls = clsMatch ? clsMatch[1] : "";
      const style = cls.includes("border-dashed")
        ? "dashed"
        : cls.includes("border-dotted")
          ? "dotted"
          : undefined;
      const spacing = cls.includes("my-3")
        ? "sm"
        : cls.includes("my-10")
          ? "lg"
          : undefined;
      blocks.push(
        createBlock("divider", {
          ...(style ? { style } : {}),
          ...(spacing ? { spacing } : {}),
        }),
      );
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

      const rawType = String(typeMatch ? typeMatch[1] : "").toLowerCase();
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
      const typeStr = String(calloutMatch[1] || "").toLowerCase();
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
          zoomable: String(tagName || "").toLowerCase() === "imagezoom",
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
      // Match self-closing <Card ... /> and block <Card>...</Card>
      const rawCards: string[] =
        cardsBody.match(/<Card\b[^>]*\/>|<Card[\s\S]*?<\/Card>/gi) ||
        [];
      if (rawCards.length > 0) {
        const parsedCards = rawCards
          .map((rc) => {
            const parsed = parseCardSnippet(rc.trim());
            if (!parsed) return null;
            return {
              id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              title: parsed.title,
              badge: parsed.badge,
              content: parsed.content,
            };
          })
          .filter(Boolean);
        blocks.push(createBlock("cards", { cards: parsedCards }));
        continue;
      }
    }

    // Single Card (<Card>...</Card> or self-closing <Card ... />)
    const cardMatch = trimmed.match(/^<Card\b[^>]*\/>$|^<Card[\s\S]*?<\/Card>$/i);
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

    // 9g-2. Standalone Inline User Mention block (<User ... />)
    // Inline user components cannot be placed independently; convert to an inline template
    const userBlockMatch = trimmed.match(
      /^<User(?![A-Za-z0-9_])[\s\S]*?\/>$/i,
    );
    if (userBlockMatch) {
      const parsed = parseUserMentions(trimmed)[0];
      if (parsed) {
        const tplName =
          (parsed.name || "user")
            .toLowerCase()
            .replace(/[^a-z0-9_-]/g, "-")
            .replace(/^-+|-+$/g, "") || "user";
        const userBlock = createBlock("user", {
          name: parsed.name,
          avatar: parsed.avatar || "",
          role: parsed.role || "",
          bio: parsed.bio || "",
          href: parsed.href || "",
        });
        blocks.push(
          createBlock("template", {
            name: tplName,
            blocks: [userBlock],
          }),
        );
        continue;
      }
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
            checked: String(taskMatch[1] || "").toLowerCase() === "x",
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

    // 10a. Styled HTML <p className="...">...</p> paragraph
    const htmlParagraphMatch = trimmed.match(
      /^<p(?:\s+([^>]*))?>([\s\S]*?)<\/p>$/i,
    );
    if (htmlParagraphMatch) {
      const attrs = htmlParagraphMatch[1] || "";
      const innerText = dedentCode(htmlParagraphMatch[2] || "").trim();
      if (!/<(?:div|figure|table|ul|ol|pre|blockquote|section)\b/i.test(innerText)) {
        const clsMatch = attrs.match(/(?:className|class)=["']([^"']*)["']/i);
        const cls = clsMatch ? clsMatch[1] : "";
        const align = cls.includes("text-center")
          ? "center"
          : cls.includes("text-right")
            ? "right"
            : "left";
        const fontSize = cls.includes("text-xl")
          ? "xl"
          : cls.includes("text-lg")
            ? "lg"
            : cls.includes("text-sm")
              ? "sm"
              : "base";
        blocks.push(
          createBlock("paragraph", {
            text: innerText,
            ...(align !== "left" ? { align } : {}),
            ...(fontSize !== "base" ? { fontSize } : {}),
          }),
        );
        continue;
      }
    }

    // 10b. Standard HTML <figure> containing a single <img> / <ImageZoom> and optional <figcaption>
    const figureMatch = trimmed.match(
      /^<figure\b([^>]*)>([\s\S]*?)<\/figure>$/i,
    );
    if (figureMatch) {
      const figAttrs = figureMatch[1] || "";
      const figInner = figureMatch[2].trim();
      const imgMatches = [
        ...figInner.matchAll(/<(ImageZoom|img)\b([^>]*?)\/?>/gi),
      ];
      // Only auto-convert to Image block if it's a clean single-image figure without extra nested HTML elements
      const strippedCheck = figInner
        .replace(/<(?:ImageZoom|img)\b[^>]*?\/?>/gi, "")
        .replace(/<figcaption\b[^>]*>[\s\S]*?<\/figcaption>/gi, "")
        .trim();

      if (imgMatches.length === 1 && !figAttrs.trim() && strippedCheck === "") {
        const imgTag = imgMatches[0][1];
        const attrs = imgMatches[0][2] || "";
        const captionMatch = figInner.match(
          /<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>/i,
        );
        const caption = captionMatch ? captionMatch[1].trim() : "";
        const srcMatch = attrs.match(/src=["']([^"']*)["']/i);
        const altMatch = attrs.match(/alt=["']([^"']*)["']/i);
        const widthMatch = attrs.match(/width=\{?["']?(\d+)["']?\}?/i);
        const heightMatch = attrs.match(/height=\{?["']?(\d+)["']?\}?/i);

        if (srcMatch && srcMatch[1]) {
          blocks.push(
            createBlock("image", {
              src: srcMatch[1],
              alt: altMatch ? altMatch[1] : "Image",
              zoomable: String(imgTag || "").toLowerCase() === "imagezoom",
              width: widthMatch ? Number(widthMatch[1]) : "",
              height: heightMatch ? Number(heightMatch[1]) : "",
              caption,
            }),
          );
          continue;
        }
      }
    }

    // 10c. Any other Custom HTML or JSX Block (<figure>, <details>, <video>, <iframe>, <div...>, <section>, <svg>, etc.)
    // Preserves the exact HTML/JSX markup 1:1 in a dedicated Custom HTML / JSX block!
    if (
      /^<([a-zA-Z][a-zA-Z0-9._-]*)\b[\s\S]*>$/.test(trimmed) ||
      /^<!--[\s\S]*-->$/.test(trimmed)
    ) {
      blocks.push(createBlock("html", { code: trimmed }));
      continue;
    }

    // Default: Plain text paragraph
    blocks.push(createBlock("paragraph", { text: trimmed }));
  }
  return blocks;
}
