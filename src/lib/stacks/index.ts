import * as stacks from "./registry";

export * from "./registry";

/**
 * All available stack definitions, keyed by their registry export name.
 */
export { stacks };

/**
 * Union of every key in the stack registry, e.g. `"Nextjs"` or `"React"`.
 */
export type StacksName = keyof typeof stacks;

/**
 * A stack entry with its display name and SVG icon component.
 */
type Stack = (typeof stacks)[StacksName];

/**
 * Normalizes a value for loose matching by lowercasing it and removing
 * everything except letters and digits, so `"Node.js"`, `"node js"`, and
 * `"nodejs"` all compare equal.
 */
const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Resolves a stack by its registry key or display name.
 *
 * Matching is attempted in this order:
 * Exact registry key, e.g. `"Nextjs"`.
 * Exact display name, case-insensitive, e.g. `"Next.js"`.
 * Normalized key or display name, ignoring case and punctuation, e.g.
 *    `"nodejs"` resolves to Node.js.
 *
 * @param name - Registry key or display name of the stack.
 * @returns The matching stack entry, or `undefined` if no stack matches.
 *
 * @example
 * getStack("Next.js"); // Nextjs
 * getStack("c++"); // Cplusplus
 * getStack("react router"); // Reactrouter
 */
export function getStack(name?: StacksName | (string & {})): Stack | undefined {
  if (!name) return undefined;

  // Exact export name, e.g. "Nextjs".
  if (Object.prototype.hasOwnProperty.call(stacks, name)) {
    return stacks[name as StacksName];
  }

  const normalized = normalize(name);
  if (!normalized) return undefined;

  const entries = Object.entries(stacks) as [StacksName, Stack][];
  const lower = name.toLowerCase();

  // Exact display name first, so "C++" doesn't fall through to "C".
  return (
    entries.find(([, stack]) => stack.name.toLowerCase() === lower)?.[1] ??
    entries.find(
      ([key, stack]) =>
        normalize(key) === normalized || normalize(stack.name) === normalized,
    )?.[1]
  );
}
