import { formatDistanceToNowStrict } from "date-fns";

export const toCapitalize = (str: string) => {
  const strObj = str.split(" ");
  for (let i = 0; i < strObj.length; i++) {
    strObj[i] = strObj[i][0].toUpperCase() + strObj[i].slice(1).toLowerCase();
  }
  return strObj.join(" ");
};

export type ThumbnailType = string | { landscape?: string; portrait?: string };

export function getThumbnailUrl(
  thumbnail?: ThumbnailType,
  orientation: "landscape" | "portrait" = "landscape",
): string | undefined {
  if (!thumbnail) return undefined;
  if (typeof thumbnail === "string") return thumbnail;
  return thumbnail[orientation] || thumbnail.landscape || thumbnail.portrait;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${size} ${sizes[i]}`;
}

export const formatDate = (
  created_at: Date | string,
  updated_at: Date | string,
  userTimeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
): string => {
  // Convert to Date objects
  const createdDate = new Date(created_at);
  const updatedDate = new Date(updated_at);

  // Pick the most recent timestamp
  const recentDate = updatedDate > createdDate ? updatedDate : createdDate;

  // Convert from UTC to the user's timezone
  const localTimeString = new Intl.DateTimeFormat("en-US", {
    timeZone: userTimeZone,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(recentDate);

  // If less than 24 hours ago, show relative time
  const hoursDiff = Math.abs(
    (new Date().getTime() - recentDate.getTime()) / 3600000,
  );
  if (hoursDiff < 24) {
    return formatDistanceToNowStrict(recentDate, { addSuffix: true });
  }

  return localTimeString;
};

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  wait: number,
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const wrapped = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return wrapped as T & { cancel: () => void };
}