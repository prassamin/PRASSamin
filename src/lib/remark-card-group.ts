/**
 * Remark plugin that automatically detects adjacent/consecutive `<Card>` JSX sibling elements
 * and groups them together inside a responsive `<Cards>` grid container.
 *
 * When 2 or more cards appear side-by-side as siblings in MDX, they render in a 2-column grid
 * on larger viewports instead of stretching full width.
 */
export function remarkCardGroup() {
  return (tree: any) => {
    function processChildren(children: any[]): any[] {
      const newChildren: any[] = [];
      let currentCardGroup: any[] = [];

      const flushGroup = () => {
        if (currentCardGroup.length === 0) return;
        if (currentCardGroup.length === 1) {
          newChildren.push(currentCardGroup[0]);
        } else {
          newChildren.push({
            type: "mdxJsxFlowElement",
            name: "Cards",
            attributes: [],
            children: currentCardGroup,
          });
        }
        currentCardGroup = [];
      };

      for (const node of children) {
        // Recursively process any nested children
        if (
          node.children &&
          Array.isArray(node.children) &&
          node.type !== "mdxJsxFlowElement" &&
          node.type !== "mdxJsxTextElement"
        ) {
          node.children = processChildren(node.children);
        }

        const isCard =
          (node.type === "mdxJsxFlowElement" ||
            node.type === "mdxJsxTextElement") &&
          node.name === "Card";

        const isIgnorableWhitespace =
          node.type === "text" && !node.value?.trim();

        if (isCard) {
          currentCardGroup.push(node);
        } else if (isIgnorableWhitespace && currentCardGroup.length > 0) {
          // Skip empty whitespace between adjacent cards so they stay grouped
          continue;
        } else {
          flushGroup();
          newChildren.push(node);
        }
      }

      flushGroup();
      return newChildren;
    }

    if (tree && Array.isArray(tree.children)) {
      tree.children = processChildren(tree.children);
    }
  };
}

export default remarkCardGroup;
