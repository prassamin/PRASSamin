/**
 * Remark plugin that adds per-document reusable templating support to MDX.
 *
 * Define a reusable block template (hidden from rendered output):
 * ```mdx
 * <Template name="feature-card">
 *   <Card title="{{title}}" badge="{{badge}}">
 *     {{description}}
 *   </Card>
 * </Template>
 * ```
 *
 * Reuse it anywhere in the same MDX document with custom prop values:
 * - Tag syntax: `<UseTemplate name="feature-card" title="Fast" badge="v2" description="Instant builds." />`
 * - Shorthand syntax: `#feature-card` or `#feature-card(title="Fast", badge="v2", description="Instant builds.")`
 *
 * Supports:
 * - Static reusable blocks (no variables)
 * - `{{variable}}` placeholders in markdown text, headings, links, images, code blocks,
 *   and JSX string/expression attributes
 * - Shorthand `#name` and `#name(key="val", key2="val2")` both standalone and inline
 * - Forward references (templates can be defined anywhere in the document)
 * - Nested template composition (with circular-reference and max-depth protection)
 */

interface TemplateDefinition {
  children: any[];
}

const VAR_INLINE_REGEX = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
const VAR_EXPR_REGEX = /^\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}$/;
const MAX_EXPANSION_DEPTH = 5;

// Matches `#template-name` or `#template-name(k="v", k2="v2")`
// Always instantiate a fresh local RegExp in loops so recursive calls never clobber `lastIndex`!
const SHORTHAND_SOURCE =
  "(?:^|(?<=\\s))#([a-zA-Z_][a-zA-Z0-9_-]*)(?:\\(([^)\\r\\n]*)\\))?(?![a-zA-Z0-9_-])";

const STANDALONE_SHORTHAND_REGEX =
  /^#([a-zA-Z_][a-zA-Z0-9_-]*)(?:\(([^)\r\n]*)\))?$/;

export function parseShorthandParams(rawArgs?: string): Record<string, string> {
  const vars: Record<string, string> = {};
  if (!rawArgs || !rawArgs.trim()) return vars;

  const attrRegex =
    /([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^\s,)]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRegex.exec(rawArgs)) !== null) {
    const key = match[1];
    const val =
      match[2] !== undefined
        ? match[2].replace(/\\"/g, '"').replace(/&quot;/g, '"')
        : match[3] !== undefined
          ? match[3].replace(/\\'/g, "'").replace(/&quot;/g, '"')
          : (match[4] ?? "");
    vars[key] = val;
  }
  return vars;
}

function cloneAstNode<T>(node: T): T {
  if (node === null || typeof node !== "object") {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map((item) => cloneAstNode(item)) as unknown as T;
  }
  const cloned: Record<string, any> = {};
  for (const [key, value] of Object.entries(node as Record<string, any>)) {
    // Strip source positions on cloned nodes to avoid stale location metadata
    if (key === "position") continue;
    cloned[key] = cloneAstNode(value);
  }
  return cloned as T;
}

function isJsxElement(node: any, tagName: string): boolean {
  return (
    node &&
    (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
    node.name === tagName
  );
}

function extractAttributeValue(attr: any): string | undefined {
  if (!attr || attr.type !== "mdxJsxAttribute") return undefined;

  if (typeof attr.value === "string") {
    return attr.value;
  }

  // Boolean shorthand attribute like `<UseTemplate name="x" active />`
  if (attr.value === null) {
    return "true";
  }

  // Expression attribute like `count={3}` or `title={"Hello"}`
  if (
    attr.value &&
    typeof attr.value === "object" &&
    attr.value.type === "mdxJsxAttributeValueExpression"
  ) {
    const raw = String(attr.value.value ?? "").trim();
    if (
      (raw.startsWith('"') && raw.endsWith('"')) ||
      (raw.startsWith("'") && raw.endsWith("'")) ||
      (raw.startsWith("`") && raw.endsWith("`"))
    ) {
      return raw.slice(1, -1);
    }
    return raw;
  }

  return undefined;
}

function getJsxAttributes(node: any): Record<string, string> {
  const result: Record<string, string> = {};
  if (!Array.isArray(node?.attributes)) return result;

  for (const attr of node.attributes) {
    if (attr?.type === "mdxJsxAttribute" && typeof attr.name === "string") {
      const val = extractAttributeValue(attr);
      if (val !== undefined) {
        result[attr.name] = val;
      }
    }
  }
  return result;
}

function replacePlaceholdersInString(
  str: string,
  vars: Record<string, string>,
): string {
  if (!str || !str.includes("{{")) return str;
  return str.replace(VAR_INLINE_REGEX, (match, varName: string) => {
    if (
      Object.prototype.hasOwnProperty.call(vars, varName) &&
      vars[varName] !== ""
    ) {
      return vars[varName];
    }
    return match;
  });
}

function replacePlaceholdersInEstree(
  node: any,
  vars: Record<string, string>,
): void {
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node)) {
    for (const item of node) {
      replacePlaceholdersInEstree(item, vars);
    }
    return;
  }

  if (node.type === "Literal" && typeof node.value === "string") {
    const replaced = replacePlaceholdersInString(node.value, vars);
    if (replaced !== node.value) {
      node.value = replaced;
      node.raw = JSON.stringify(replaced);
    }
    return;
  }

  if (node.type === "TemplateElement" && node.value) {
    if (typeof node.value.raw === "string") {
      node.value.raw = replacePlaceholdersInString(node.value.raw, vars);
    }
    if (typeof node.value.cooked === "string") {
      node.value.cooked = replacePlaceholdersInString(node.value.cooked, vars);
    }
    return;
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end") continue;
    if (value && typeof value === "object") {
      replacePlaceholdersInEstree(value, vars);
    }
  }
}

function substituteNode(node: any, vars: Record<string, string>): any {
  if (!node || typeof node !== "object") return node;

  // 1. Inline MDX expression `{{varName}}` (parsed by MDX as mdxTextExpression with value `{varName}`)
  // Always convert to a safe `text` node so unprovided variables render as `{{varName}}`
  // instead of evaluating `{varName}` as an undefined JavaScript identifier at runtime!
  if (node.type === "mdxTextExpression" && typeof node.value === "string") {
    const match = node.value.trim().match(VAR_EXPR_REGEX);
    if (match) {
      const varName = match[1];
      const resolved =
        Object.prototype.hasOwnProperty.call(vars, varName) &&
        vars[varName] !== ""
          ? vars[varName]
          : `{{${varName}}}`;
      return {
        type: "text",
        value: resolved,
      };
    }
    return node;
  }

  // 2. Block-level MDX expression `{{varName}}` on its own line (parsed as mdxFlowExpression)
  if (node.type === "mdxFlowExpression" && typeof node.value === "string") {
    const match = node.value.trim().match(VAR_EXPR_REGEX);
    if (match) {
      const varName = match[1];
      const resolved =
        Object.prototype.hasOwnProperty.call(vars, varName) &&
        vars[varName] !== ""
          ? vars[varName]
          : `{{${varName}}}`;
      return {
        type: "paragraph",
        children: [{ type: "text", value: resolved }],
      };
    }
    return node;
  }

  // 3. Plain text, inlineCode, code blocks
  if (
    (node.type === "text" ||
      node.type === "inlineCode" ||
      node.type === "code") &&
    typeof node.value === "string"
  ) {
    node.value = replacePlaceholdersInString(node.value, vars);
    if (node.type === "code") {
      if (typeof node.meta === "string") {
        node.meta = replacePlaceholdersInString(node.meta, vars);
      }
      if (typeof node.lang === "string") {
        node.lang = replacePlaceholdersInString(node.lang, vars);
      }
    }
  }

  // 4. Links and Images
  if (node.type === "link" || node.type === "image") {
    if (typeof node.url === "string") {
      node.url = replacePlaceholdersInString(node.url, vars);
    }
    if (typeof node.title === "string") {
      node.title = replacePlaceholdersInString(node.title, vars);
    }
    if (typeof node.alt === "string") {
      node.alt = replacePlaceholdersInString(node.alt, vars);
    }
  }

  // 5. JSX Element attributes (string attributes and expression attributes)
  if (
    (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") &&
    Array.isArray(node.attributes)
  ) {
    for (const attr of node.attributes) {
      if (attr?.type !== "mdxJsxAttribute") continue;

      if (typeof attr.value === "string") {
        attr.value = replacePlaceholdersInString(attr.value, vars);
      } else if (
        attr.value &&
        typeof attr.value === "object" &&
        attr.value.type === "mdxJsxAttributeValueExpression"
      ) {
        if (typeof attr.value.value === "string") {
          const exprMatch = attr.value.value.trim().match(VAR_EXPR_REGEX);
          if (exprMatch) {
            const varName = exprMatch[1];
            const resolved =
              Object.prototype.hasOwnProperty.call(vars, varName) &&
              vars[varName] !== ""
                ? vars[varName]
                : `{{${varName}}}`;
            attr.value = resolved;
            continue;
          }
          attr.value.value = replacePlaceholdersInString(
            attr.value.value,
            vars,
          );
        }
        if (attr.value.data?.estree) {
          replacePlaceholdersInEstree(attr.value.data.estree, vars);
        }
      }
    }
  }

  // 6. Recurse into children
  if (Array.isArray(node.children)) {
    node.children = node.children.map((child: any) =>
      substituteNode(child, vars),
    );
  }

  return node;
}

export function remarkTemplates() {
  return (tree: any) => {
    if (!tree || !Array.isArray(tree.children)) return;

    const templates = new Map<string, TemplateDefinition>();

    // Pass 1: Collect all <Template name="..."> definitions and remove them from rendered output
    function collectTemplates(children: any[]): any[] {
      const kept: any[] = [];

      for (const node of children) {
        if (isJsxElement(node, "Template")) {
          const attrs = getJsxAttributes(node);
          const name = (attrs.name || "").trim();
          if (name && Array.isArray(node.children) && !templates.has(name)) {
            // First definition wins; later duplicates are ignored
            templates.set(name, {
              children: cloneAstNode(node.children),
            });
          }
          // Strip <Template> definition from rendered output
          continue;
        }

        if (Array.isArray(node.children)) {
          node.children = collectTemplates(node.children);
        }

        kept.push(node);
      }

      return kept;
    }

    tree.children = collectTemplates(tree.children);

    function extractInlineNodes(nodes: any[]): any[] {
      const result: any[] = [];
      for (const c of nodes) {
        if (c.type === "paragraph" && Array.isArray(c.children)) {
          result.push(...extractInlineNodes(c.children));
        } else if (c.type === "mdxJsxFlowElement") {
          result.push({ ...cloneAstNode(c), type: "mdxJsxTextElement" });
        } else {
          result.push(cloneAstNode(c));
        }
      }
      return result;
    }

    // Pass 2: Expand all <UseTemplate name="..." /> tags AND #template-name / #template-name(k="v") shorthand references
    function expandUsages(
      children: any[],
      depth: number,
      activeStack: Set<string>,
    ): any[] {
      const expanded: any[] = [];

      for (const node of children) {
        // Case A: <UseTemplate name="..." ... />
        if (isJsxElement(node, "UseTemplate")) {
          const attrs = getJsxAttributes(node);
          const name = (attrs.name || "").trim();

          if (
            !name ||
            !templates.has(name) ||
            depth >= MAX_EXPANSION_DEPTH ||
            activeStack.has(name)
          ) {
            continue;
          }

          const { name: _ignored, ...vars } = attrs;
          void _ignored;

          const tpl = templates.get(name)!;
          const templateChildren = cloneAstNode(tpl.children);
          const substituted = templateChildren.map((child) =>
            substituteNode(child, vars),
          );

          const nextStack = new Set(activeStack);
          nextStack.add(name);
          const recursivelyExpanded = expandUsages(
            substituted,
            depth + 1,
            nextStack,
          );

          if (
            node.type === "mdxJsxTextElement" ||
            (recursivelyExpanded.length === 1 &&
              recursivelyExpanded[0]?.type === "paragraph" &&
              Array.isArray(recursivelyExpanded[0].children))
          ) {
            expanded.push(...extractInlineNodes(recursivelyExpanded));
          } else {
            expanded.push(...recursivelyExpanded);
          }
          continue;
        }

        // Case B: Standalone paragraph containing ONLY `#template-name` or `#template-name(k="v")`
        if (
          node.type === "paragraph" &&
          Array.isArray(node.children) &&
          node.children.length === 1 &&
          node.children[0].type === "text"
        ) {
          const trimmedText = String(node.children[0].value || "").trim();
          const standaloneMatch = trimmedText.match(STANDALONE_SHORTHAND_REGEX);
          if (standaloneMatch) {
            const candidateName = standaloneMatch[1];
            const rawArgs = standaloneMatch[2];
            if (
              templates.has(candidateName) &&
              depth < MAX_EXPANSION_DEPTH &&
              !activeStack.has(candidateName)
            ) {
              const vars = parseShorthandParams(rawArgs);
              const tpl = templates.get(candidateName)!;
              const nextStack = new Set(activeStack);
              nextStack.add(candidateName);
              const substituted = cloneAstNode(tpl.children).map((child) =>
                substituteNode(child, vars),
              );
              const recursivelyExpanded = expandUsages(
                substituted,
                depth + 1,
                nextStack,
              );

              expanded.push(...recursivelyExpanded);
              continue;
            }
          }
        }

        // Case C: Text node containing inline `#template-name` or `#template-name(k="v")`
        if (
          node.type === "text" &&
          typeof node.value === "string" &&
          node.value.includes("#") &&
          depth < MAX_EXPANSION_DEPTH
        ) {
          const textVal = node.value;
          const pieces: any[] = [];
          let lastIndex = 0;
          // Local RegExp instance so recursive `expandUsages` calls never reset `lastIndex`!
          const localRegex = new RegExp(SHORTHAND_SOURCE, "g");
          let match: RegExpExecArray | null;

          while ((match = localRegex.exec(textVal)) !== null) {
            const candidateName = match[1];
            const rawArgs = match[2];
            const matchStart = match.index;
            const matchEnd = localRegex.lastIndex;

            if (templates.has(candidateName) && !activeStack.has(candidateName)) {
              const beforeText = textVal.slice(lastIndex, matchStart);
              if (beforeText) {
                pieces.push({ type: "text", value: beforeText });
              }

              const vars = parseShorthandParams(rawArgs);
              const tpl = templates.get(candidateName)!;
              const nextStack = new Set(activeStack);
              nextStack.add(candidateName);
              const substituted = cloneAstNode(tpl.children).map((child) =>
                substituteNode(child, vars),
              );
              const recursivelyExpanded = expandUsages(
                substituted,
                depth + 1,
                nextStack,
              );
              pieces.push(...extractInlineNodes(recursivelyExpanded));
              lastIndex = matchEnd;
            }
          }

          if (lastIndex > 0) {
            const remainingText = textVal.slice(lastIndex);
            if (remainingText) {
              pieces.push({ type: "text", value: remainingText });
            }
            expanded.push(...pieces);
            continue;
          }
        }

        if (Array.isArray(node.children)) {
          node.children = expandUsages(node.children, depth, activeStack);
        }

        expanded.push(node);
      }

      return expanded;
    }

    tree.children = expandUsages(tree.children, 0, new Set());
  };
}

export default remarkTemplates;
