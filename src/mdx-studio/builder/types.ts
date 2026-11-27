export type MdxBlockType =
  | "heading"
  | "paragraph"
  | "callout"
  | "card"
  | "cards"
  | "accordion"
  | "steps"
  | "tabs"
  | "code"
  | "image"
  | "chipGroup"
  | "banner"
  | "table"
  | "typeTable"
  | "files"
  | "avatar"
  | "profile"
  | "blockquote"
  | "divider"
  | "break"
  | "list"
  | "codeBlockTabs"
  | "template"
  | "useTemplate"
  | "user"
  | "stacks"
  | "html";

export interface TemplateDefinitionInfo {
  id: string;
  name: string;
  variables: string[];
  blockCount: number;
}

export type ListType = "bullet" | "ordered" | "task";

export interface ListItem {
  id: string;
  text: string;
  checked?: boolean;
}

export interface FileTreeNode {
  id: string;
  type: "file" | "folder";
  name: string;
  defaultOpen?: boolean;
  children?: FileTreeNode[];
}

export interface TypeTableProperty {
  name: string;
  type: string;
  description?: string;
  default?: string;
  required?: boolean;
  deprecated?: boolean;
  typeDescriptionLink?: string;
}

export interface MdxBlock {
  id: string;
  type: MdxBlockType;
  props: Record<string, any>;
}

export interface ComponentTrayItem {
  type: MdxBlockType;
  label: string;
  description: string;
  category: "Templates" | "Structure" | "Interactive" | "Code & Media";
  defaultProps: Record<string, any>;
}

export const COMPONENT_TRAY_ITEMS: ComponentTrayItem[] = [
  // Templates
  {
    type: "template",
    label: "Template",
    description: "Reusable template container (#template-name)",
    category: "Templates",
    defaultProps: {
      name: "my-template",
      blocks: [],
    },
  },
  {
    type: "useTemplate",
    label: "Use Template",
    description: "Insert template via #template-name or <UseTemplate />",
    category: "Templates",
    defaultProps: {},
  },

  // Structure
  {
    type: "heading",
    label: "Heading",
    description: "Section titles & headers",
    category: "Structure",
    defaultProps: {},
  },
  {
    type: "paragraph",
    label: "Text Paragraph",
    description: "Body text with rich formatting",
    category: "Structure",
    defaultProps: {},
  },
  {
    type: "list",
    label: "List",
    description: "Bullet, numbered, or task checklist items",
    category: "Structure",
    defaultProps: {},
  },
  {
    type: "blockquote",
    label: "Blockquote",
    description: "Highlighted quotation, testimonial, or citation",
    category: "Structure",
    defaultProps: {},
  },
  {
    type: "divider",
    label: "Divider Line",
    description: "Horizontal visual section break",
    category: "Structure",
    defaultProps: {},
  },
  {
    type: "break",
    label: "Line Break",
    description: "Line break for custom vertical spacing",
    category: "Structure",
    defaultProps: {},
  },
  {
    type: "table",
    label: "Table",
    description: "Structured data table",
    category: "Structure",
    defaultProps: {},
  },
  {
    type: "typeTable",
    label: "Type Table",
    description: "Prop documentation table with types",
    category: "Structure",
    defaultProps: {},
  },
  {
    type: "files",
    label: "Files Tree",
    description: "Interactive directory structure",
    category: "Structure",
    defaultProps: {},
  },

  // Interactive Components
  {
    type: "callout",
    label: "Callout Alert",
    description: "Accent alert box",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "card",
    label: "Card",
    description: "Elevated showcase container card",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "cards",
    label: "Cards Group",
    description: "A group of nested cards in a responsive grid",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "accordion",
    label: "Accordion",
    description: "Collapsible expandable accordion panels",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "steps",
    label: "Steps Guide",
    description: "Numbered step-by-step walkthrough",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "tabs",
    label: "Tabs Container",
    description: "Tabbed content switcher",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "chipGroup",
    label: "Tag Badges",
    description: "Horizontal tag badges",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "stacks",
    label: "Tech Stacks",
    description: "Technology badges with official icons",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "banner",
    label: "Announcement Banner",
    description: "Sticky top banner",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "profile",
    label: "Profile Card",
    description: "Author profile badge",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "avatar",
    label: "Avatar Group",
    description: "Overlapping avatars",
    category: "Interactive",
    defaultProps: {},
  },
  {
    type: "user",
    label: "Inline User",
    description: "Inline user mention pill",
    category: "Interactive",
    defaultProps: {},
  },

  // Code & Media
  {
    type: "code",
    label: "Code Snippet",
    description: "Syntax highlighted code block",
    category: "Code & Media",
    defaultProps: {},
  },
  {
    type: "codeBlockTabs",
    label: "Code Tabs",
    description: "Multi-tab code block switcher (npm, pnpm, etc.)",
    category: "Code & Media",
    defaultProps: {},
  },
  {
    type: "image",
    label: "Image Embed",
    description: "Image with optional caption",
    category: "Code & Media",
    defaultProps: {},
  },
  {
    type: "html",
    label: "Custom HTML / JSX",
    description: "Custom HTML or JSX markup (<figure>, <video>, <iframe>, etc.)",
    category: "Code & Media",
    defaultProps: {},
  },
];
