import { visit } from "unist-util-visit";

/**
 * Remark plugin to parse fenced code block metadata (e.g. title="app.ts" showLineNumbers wrap {1,3-5})
 * and assign them to MDAST `node.data.hProperties` so they survive rehype conversion.
 */
export function remarkCodeMeta() {
  return (tree: any) => {
    visit(tree, "code", (node: any) => {
      if (!node.data) node.data = {};
      if (!node.data.hProperties) node.data.hProperties = {};

      const meta = node.meta || "";
      if (!meta) return;

      // Title: title="foo" or title='foo'
      const titleMatch = meta.match(/title=["']([^"']+)["']/);
      if (titleMatch) {
        node.data.hProperties.title = titleMatch[1];
        node.data.hProperties["data-title"] = titleMatch[1];
      }

      // Line Numbers: showLineNumbers or lineNumbers
      if (/showLineNumbers\b/.test(meta) || /lineNumbers\b/.test(meta)) {
        node.data.hProperties["data-line-numbers"] = "true";
      }

      // Wrap Lines: wrap or wrapLines
      if (/\bwrap\b/.test(meta) || /\bwrapLines\b/.test(meta)) {
        node.data.hProperties["data-wrap"] = "true";
      }

      // Highlight Lines: {1, 3-5}
      const highlightMatch = meta.match(/\{([0-9,-]+)\}/);
      if (highlightMatch) {
        node.data.hProperties["data-highlight"] = highlightMatch[1];
      }
    });
  };
}

/**
 * Rehype plugin to ensure code element metadata is propagated upwards to the parent <pre> tag.
 */
export function rehypeCodeMeta() {
  return (tree: any) => {
    visit(tree, "element", (node: any) => {
      if (
        node.tagName === "pre" &&
        Array.isArray(node.children) &&
        node.children[0]?.tagName === "code"
      ) {
        const codeNode = node.children[0];
        const codeProps = codeNode.properties || {};
        if (!node.properties) node.properties = {};

        if (codeProps.title) node.properties.title = codeProps.title;
        if (codeProps["data-title"])
          node.properties["data-title"] = codeProps["data-title"];
        if (codeProps["data-line-numbers"])
          node.properties["data-line-numbers"] = codeProps["data-line-numbers"];
        if (codeProps["data-wrap"])
          node.properties["data-wrap"] = codeProps["data-wrap"];
        if (codeProps["data-highlight"])
          node.properties["data-highlight"] = codeProps["data-highlight"];
      }
    });
  };
}
