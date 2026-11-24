import { APP_NAME } from "@/config";

export interface PromptArgument {
  name: string;
  description?: string;
  required?: boolean;
}

export interface PromptDefinition {
  name: string;
  description?: string;
  arguments?: PromptArgument[];
}

export interface PromptMessage {
  role: "user" | "assistant";
  content: {
    type: "text";
    text: string;
  };
}

export interface GetPromptResult {
  description?: string;
  messages: PromptMessage[];
}

/**
 * Full reference catalog of every block type and JSX component recognized
 * by the portfolio MDX compiler and MDX Studio visual builder.
 */
export const MDX_COMPONENTS_REFERENCE = `### Comprehensive MDX Studio Blocks & Components Reference for ${APP_NAME}'s Portfolio

The portfolio MDX compiler and MDX Studio visual builder support 26 distinct block types and inline JSX helpers.
Always separate every block and section with a blank line (\`\\n\\n\`) so the builder AST parser can tokenize them into separate nodes.

---

### Category 1: Structure & Typography

1. **Heading (\`heading\`)**:
   - Standard: \`# H1\`, \`## H2\`, \`### H3\`, \`#### H4\`, \`##### H5\`, \`###### H6\`
   - With custom ID or alignment (compiles to \`<Heading>\`):
     \`<Heading as="h2" id="custom-anchor" className="text-center">Section Title</Heading>\`

2. **Text Paragraph (\`paragraph\`)**:
   - Standard markdown text separated by blank lines.
   - Rich aligned paragraph:
     \`<p className="text-center text-sm text-neutral-400">Centered secondary note</p>\`

3. **Lists & Task Checklists (\`list\`)**:
   - Bullet list: \`- Item 1\\n- Item 2\`
   - Ordered list: \`1. First step\\n2. Second step\`
   - Interactive task checklist: \`- [x] Completed task\\n- [ ] Pending task\`

4. **Divider Line (\`divider\`)**:
   - Standard markdown: \`---\`
   - Styled border: \`<hr className="border-dashed my-6 border-white/10" />\`

5. **Line Break (\`break\`)**:
   - Controlled vertical break: \`<br />\`

6. **Blockquote & Testimonial Quote (\`blockquote\`)**:
   - Standard Markdown: \`> Quote text\`
   - GitHub Alerts:
     \`> [!NOTE]\`
     \`> [!TIP]\`
     \`> [!WARNING]\`
     \`> [!IMPORTANT]\`
     \`> [!CAUTION]\`
   - Rich Attributed Quote:
     \`<Blockquote author="Satya Nadella" role="CEO, Microsoft" cite="https://microsoft.com" borderStyle="left-accent">\`
     \`  Empower every person and organization to achieve more.\`
     \`</Blockquote>\`

7. **Data Table (\`table\`)**:
   - Standard GFM markdown table:
     \`| Feature | Support | Description |\`
     \`| :--- | :---: | ---: |\`
     \`| TypeScript | Yes | Full type safety |\`

8. **Type Table (\`typeTable\`)**:
   - Interactive TypeScript API prop documentation table:
     \`<TypeTable\`
     \`  type={{\`
     \`    name: { type: "string", description: "User's full name", required: true },\`
     \`    age: { type: "number", default: "18" }\`
     \`  }}\`
     \`/>\`

9. **Files Tree (\`files\`)**:
   - Visual directory tree visualizer:
     \`<Files>\`
     \`  <Folder name="src" defaultOpen>\`
     \`    <Folder name="components">\`
     \`      <File name="button.tsx" />\`
     \`    </Folder>\`
     \`    <File name="main.ts" />\`
     \`  </Folder>\`
     \`  <File name="package.json" />\`
     \`</Files>\`

---

### Category 2: Interactive Components

10. **Callout Alert (\`callout\`)**:
    - Colored notification alert container:
      \`<Callout type="info" title="Pro Tip" icon="LuLightbulb" collapsible>\`
      \`  Always verify your build before pushing to production.\`
      \`</Callout>\`
    - Types: \`"info"\` (blue/accent), \`"warning"\` (amber), \`"danger"\` (rose/red).

11. **Card (\`card\`)**:
    - Single elevated container card:
      \`<Card title="Documentation" badge="v3.0" icon="LuBookOpen">\`
      \`  Read the full API guides and integration tutorials.\`
      \`</Card>\`

12. **Cards Group (\`cards\`)**:
    - Responsive grid container of cards:
      \`<Cards>\`
      \`  <Card title="Frontend" badge="React 19">\`
      \`    Next.js App Router, Tailwind CSS, HeroUI.\`
      \`  </Card>\`
      \`  <Card title="Backend" badge="Node">\`
      \`    PostgreSQL, Prisma ORM, MCP Protocol.\`
      \`  </Card>\`
      \`</Cards>\`

13. **Accordion / FAQ (\`accordion\`)**:
    - Collapsible section panels:
      \`<Accordion type="single">\`
      \`  <AccordionItem title="What is the Model Context Protocol?">\`
      \`    MCP connects AI assistants to real-time tools, data, and schemas.\`
      \`  </AccordionItem>\`
      \`  <AccordionItem title="Is write scope enforced?">\`
      \`    Yes, bearer tokens require write scope for mutations.\`
      \`  </AccordionItem>\`
      \`</Accordion>\`

14. **Steps Guide (\`steps\`)**:
    - Numbered walkthrough guide container:
      \`<Steps>\`
      \`<Step>\`
      \`### Clone Repository\`
      \`git clone https://github.com/example/repo.git\`
      \`</Step>\`
      \`<Step>\`
      \`### Install Dependencies\`
      \`bun install\`
      \`</Step>\`
      \`</Steps>\`

15. **Tabs Container (\`tabs\`)**:
    - Content tab switcher:
      \`<Tabs items={["Overview", "Installation", "Schema"]}>\`
      \`  <Tab value="Overview">\`
      \`    General architecture details.\`
      \`  </Tab>\`
      \`  <Tab value="Installation">\`
      \`    \`\`\`bash\\n    bun add @modelcontextprotocol/sdk\\n    \`\`\`\`
      \`  </Tab>\`
      \`</Tabs>\`

16. **Tag Badges / Chip Group (\`chipGroup\`)**:
    - Color variants: \`"default"\`, \`"accent"\`, \`"emerald"\`, \`"sky"\`
    - Style variants: \`"soft"\`, \`"outline"\`, \`"solid"\`, \`"ghost"\`
    - Container syntax:
      \`<div className="flex flex-wrap gap-2 my-2">\`
      \`  <Chip size="sm" variant="soft" color="emerald">Next.js 15</Chip>\`
      \`  <Chip size="sm" variant="soft" color="accent">TypeScript</Chip>\`
      \`</div>\`

17. **Announcement Banner (\`banner\`)**:
    - Dismissible top banner:
      \`<Banner variant="normal" id="release-notice">\`
      \`  v3.0 of the portfolio is now open-source and live!\`
      \`</Banner>\`

18. **Profile Card (\`profile\`)**:
    - Contributor / team profile card:
      \`<Profile name="PRAS Samin" description="Software Engineer" src="https://..." color="accent" href="https://pras.me" />\`

19. **Avatar & Avatar Group (\`avatar\`)**:
    - Overlapping avatars list:
      \`<AvatarGroup max={4} size="md" shape="circle"\`
      \`  items={[{ name: "Alex", src: "https://..." }, { name: "Sarah" }]}\`
      \`/>\`

20. **Inline User Mention (\`user\`)**:
    - Pill user reference inside paragraphs:
      \`<User name="Jane Doe" role="Tech Lead" avatar="https://..." href="https://github.com/..." />\`

21. **Inline Tooltip**:
    - Tooltip hover text inside running text:
      \`<InlineTooltip content="Model Context Protocol">MCP</InlineTooltip>\`

---

### Category 3: Code & Media

22. **Code Snippet (\`code\`)**:
    - Fenced code block with optional metadata:
      \`\`\`typescript title="src/server.ts" showLineNumbers {2,4-6}
      import { db } from "@/lib/db";
      export const users = await db.user.findMany();
      \`\`\`

23. **Code Tabs (\`codeBlockTabs\`)**:
    - Native package manager / multi-language switcher:
      \`<CodeBlockTabs defaultValue="bun">\`
      \`  <CodeBlockTabsList>\`
      \`    <CodeBlockTabsTrigger value="bun">bun</CodeBlockTabsTrigger>\`
      \`    <CodeBlockTabsTrigger value="npm">npm</CodeBlockTabsTrigger>\`
      \`  </CodeBlockTabsList>\`
      \`  <CodeBlockTab value="bun">\`
      \`    \`\`\`bash title="Terminal"\`
      \`    bun install\`
      \`    \`\`\`\`
      \`  </CodeBlockTab>\`
      \`  <CodeBlockTab value="npm">\`
      \`    \`\`\`bash title="Terminal"\`
      \`    npm install\`
      \`    \`\`\`\`
      \`  </CodeBlockTab>\`
      \`</CodeBlockTabs>\`

24. **Image Embed & Zoomable Image (\`image\`)**:
    - Markdown: \`![Alt Text](https://...)*Optional caption*\`
    - Zoomable high-res:
      \`<ImageZoom src="https://..." alt="Architecture diagram" width={1200} height={675} className="mx-auto rounded-xl" />\`

25. **Custom HTML / JSX (\`html\`)**:
    - Embeds for semantic elements, video players, or figures:
      \`<figure className="my-4">\`
      \`  <figcaption className="text-xs text-neutral-400">Database cluster topology</figcaption>\`
      \`</figure>\`

---

### Category 4: Reusable Templates (MDX Studio Macros)

26. **Template Definition & Instantiation (\`template\` & \`useTemplate\`)**:
    - **Define a template**:
      \`<Template name="callout-box">\`
      \`  <Callout type="info" title="{{title}}">\`
      \`    {{content}}\`
      \`  </Callout>\`
      \`</Template>\`
    - **Use via JSX**:
      \`<UseTemplate name="callout-box" title="Release Note" content="Shipped successfully!" />\`
    - **Use via Shorthand**:
      \`#callout-box(title="Release Note", content="Shipped successfully!")\`
`;

export const EDUCATION_DRAFT_STANDARDS = `### Education Best Practices & Drafting Standards

When drafting or updating an education credential for ${APP_NAME}'s portfolio, adhere strictly to the following standards:

1. **Required Fields & Validation**:
   - \`school\`: The full official institutional name (e.g. "Daffodil International University", "University of Dhaka"). Avoid colloquial or unofficial abbreviations unless officially branded.
   - \`degree\`: Formal academic degree level (e.g. "Bachelor of Science (B.Sc.)", "Master of Science (M.Sc.)", "Higher Secondary Certificate (HSC)").
   - \`field\`: Field, major, or department (e.g. "Computer Science & Engineering", "Software Engineering", "Science").
   - \`start\`: Start date in valid ISO format or \`YYYY-MM-DD\` (e.g. "2021-01-01").
   - \`end\`: Completion date in \`YYYY-MM-DD\` format, or \`"Present"\` / \`null\` if currently enrolled. Never use vague relative text like "next year" or "in 2 months".

2. **Heading Level Constraint (STRICT)**:
   - **DO NOT use headings bigger than level 4 (\`####\`) inside education descriptions.**
   - Allowed heading levels: **Level 4 (\`####\`), Level 5 (\`#####\`), and Level 6 (\`######\`) ONLY.**
   - Never use \`#\` (H1), \`##\` (H2), or \`###\` (H3) in the description body because education entries are rendered inside cards where higher-level headings break layout hierarchy and typography balance.

3. **Description Markdown / MDX Rules**:
   - **Blank Line Separation Between Segments (MANDATORY)**:
     - Always insert a blank line (\`\\n\\n\`) after every heading, paragraph, and list block.
     - For example, after any \`#### Heading\`, there MUST be an empty line before starting a paragraph or a bullet list.
     - Never attach text or list items directly adjacent to a heading without an empty newline intervening, so that the portfolio's MDX Studio AST compiler can properly tokenize and parse each block segment into separate nodes.
   - **No Frontmatter / YAML Wrapping**: The description field is pure Markdown/MDX content. Never include \`---\` frontmatter blocks inside the description string.
   - **Lead with an Impact Summary**: 1–2 crisp sentences highlighting academic focus, GPA/CGPA or distinction (if applicable), and core study areas.
   - **Key Coursework**: Use compact unordered bullet lists (\`- Course Name\`) separated from their heading by a blank line.
   - **Activities & Honors**: Bullet points for achievements, hackathons, academic scholarships, clubs, or leadership positions.
   - **Tone & Style**: Direct, professional, technically accurate, active voice, and impact-driven.

4. **Permitted MDX Studio Blocks in Education Credentials**:
   - Refer to the prompt **\`mdx_components_reference\`** (or tool \`get_content_guidelines(type: "mdx_components")\`) for complete specs of all 26 MDX Studio blocks.
   - **ALLOWED in Education Descriptions**:
     - **\`chipGroup\` / \`<Chip>\`**: For badges, honors, Dean's List distinctions, or focus tags.
     - **\`InlineTooltip\`**: For defining academic terminology (e.g. \`<InlineTooltip content="Cumulative Grade Point Average">CGPA</InlineTooltip>\`).
     - **Inline Icons**: Lucide icons like \`<LuAward />\`, \`<LuBookOpen />\`, \`<LuGraduationCap />\`.
     - Standard Markdown bold, italic, inline code (\`code\`), and unordered bullet lists.
   - **STRICTLY FORBIDDEN in Education Cards**:
     - Do NOT use \`<Cards>\`, \`<Card>\`, \`<Tabs>\`, \`<Steps>\`, \`<Files>\`, \`<TypeTable>\`, full-width \`<ImageZoom>\`, or giant code block tabs inside education cards. Education entries are card-based credentials and must remain clean, fast-loading, and visually concise.

5. **Workflow Safety & Modification Rules**:
   - Always draft first: Use \`create_education_draft\` so changes land in the Admin MDX Studio for preview before live publication.
   - Use \`patch_education_draft\` (or \`patch_draft\`) when updating specific fields to avoid wiping existing fields.
   - Use \`put_education_draft\` (or \`put_draft\`) only when intentionally replacing the entire record content.
`;

export const MCP_PROMPTS: PromptDefinition[] = [
  {
    name: "mdx_components_reference",
    description:
      "Comprehensive catalog of all 26 MDX Studio blocks and JSX components (Callout, Chip, Card, Cards, Accordion, Steps, Tabs, CodeBlockTabs, Files, TypeTable, Profile, Avatar, User, Tooltip, Templates, etc.) with exact syntax examples.",
    arguments: [],
  },
  {
    name: "education_best_standards",
    description:
      "Guidelines, schema requirements, allowed MDX Studio blocks, and AST segment rules for drafting education credentials in the portfolio.",
    arguments: [
      {
        name: "school",
        description: "Optional institution name for tailored recommendations.",
        required: false,
      },
      {
        name: "degree",
        description: "Optional degree or field of study for domain-specific recommendations.",
        required: false,
      },
    ],
  },
];

export function handleGetPrompt(
  name: string,
  args: Record<string, string> = {},
): GetPromptResult | null {
  if (name === "mdx_components_reference") {
    return {
      description: `Catalog of all 26 MDX Studio blocks and interactive components in ${APP_NAME}'s portfolio`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: MDX_COMPONENTS_REFERENCE,
          },
        },
      ],
    };
  }

  if (name === "education_best_standards") {
    let customContext = "";
    if (args.school || args.degree) {
      customContext = `\\n\\nTargeting Credential: ${args.degree || "Degree"} at ${args.school || "Institution"}. Ensure details align with this academic program.`;
    }

    return {
      description: "Best practices and standards for drafting education credentials",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `${EDUCATION_DRAFT_STANDARDS}${customContext}`,
          },
        },
      ],
    };
  }

  return null;
}
