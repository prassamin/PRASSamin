/**
 * Robust Myers-based Line Diff Engine with Segment / Hunk Clustering
 * for granular segment/hunk acceptance.
 */

export type DiffChangeType = "added" | "removed" | "unchanged";

export interface LineDiff {
  id: string;
  type: DiffChangeType;
  value: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export interface DiffHunk {
  id: string;
  type: "change" | "unchanged";
  oldLines: string[];
  newLines: string[];
  lines: LineDiff[];
  isPending: boolean; // true if it contains added or removed lines
}

export function computeLineDiff(oldText: string, newText: string): LineDiff[] {
  const oldLines = oldText ? oldText.split("\n") : [];
  const newLines = newText ? newText.split("\n") : [];

  const n = oldLines.length;
  const m = newLines.length;

  if (oldText === newText) {
    return oldLines.map((line, idx) => ({
      id: `diff-${idx}-${idx}`,
      type: "unchanged",
      value: line,
      oldLineNumber: idx + 1,
      newLineNumber: idx + 1,
    }));
  }

  // Standard dynamic programming LCS (Longest Common Subsequence) table
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0),
  );

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (oldLines[i] === newLines[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const result: LineDiff[] = [];
  let i = n;
  let j = m;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      result.push({
        id: `diff-${i}-${j}`,
        type: "unchanged",
        value: oldLines[i - 1],
        oldLineNumber: i,
        newLineNumber: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.push({
        id: `diff-add-${j}`,
        type: "added",
        value: newLines[j - 1],
        newLineNumber: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      result.push({
        id: `diff-rem-${i}`,
        type: "removed",
        value: oldLines[i - 1],
        oldLineNumber: i,
      });
      i--;
    }
  }

  return result.reverse();
}

/**
 * Groups raw line diffs into discrete editable hunks/segments.
 * Each change hunk can be accepted or rejected independently.
 */
export function groupDiffIntoHunks(diffs: LineDiff[]): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  let currentGroup: LineDiff[] = [];
  let currentType: "change" | "unchanged" = "unchanged";

  for (const item of diffs) {
    const isChange = item.type === "added" || item.type === "removed";
    const groupType: "change" | "unchanged" = isChange ? "change" : "unchanged";

    if (currentGroup.length === 0) {
      currentType = groupType;
      currentGroup.push(item);
    } else if (currentType === groupType) {
      currentGroup.push(item);
    } else {
      hunks.push(buildHunk(currentGroup, currentType, hunks.length));
      currentGroup = [item];
      currentType = groupType;
    }
  }

  if (currentGroup.length > 0) {
    hunks.push(buildHunk(currentGroup, currentType, hunks.length));
  }

  return hunks;
}

function buildHunk(
  lines: LineDiff[],
  type: "change" | "unchanged",
  index: number,
): DiffHunk {
  const oldLines: string[] = [];
  const newLines: string[] = [];

  for (const l of lines) {
    if (l.type === "unchanged") {
      oldLines.push(l.value);
      newLines.push(l.value);
    } else if (l.type === "removed") {
      oldLines.push(l.value);
    } else if (l.type === "added") {
      newLines.push(l.value);
    }
  }

  return {
    id: `hunk-${index}`,
    type,
    oldLines,
    newLines,
    lines,
    isPending: type === "change",
  };
}

/**
 * Reconstructs the resulting text from hunks according to user decisions:
 * hunkDecisions: Record<hunkId, "accept" | "reject">
 * - "accept": picks newLines
 * - "reject": picks oldLines
 * (default for unaccepted/unrejected is "accept" if user clicks accept all, or unchanged for unchanged hunks)
 */
export function reconstructTextFromHunks(
  hunks: DiffHunk[],
  decisions: Record<string, "accept" | "reject">,
  defaultChangeDecision: "accept" | "reject" = "accept",
): string {
  const lines: string[] = [];

  for (const hunk of hunks) {
    if (hunk.type === "unchanged") {
      lines.push(...hunk.oldLines);
    } else {
      const decision = decisions[hunk.id] || defaultChangeDecision;
      if (decision === "accept") {
        lines.push(...hunk.newLines);
      } else {
        lines.push(...hunk.oldLines);
      }
    }
  }

  return lines.join("\n");
}
