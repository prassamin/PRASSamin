export type ContentItemKind = "file" | "folder";

export interface ContentItem {
  name: string;
  path: string;
  url: string;
  kind: ContentItemKind;
  sizeBytes?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
  parentPath?: string;
  publicId?: string;
  assetId?: string;
}

export type SortKey = "name" | "date" | "size" | "type";
export type SortDirection = "asc" | "desc";

export type { UploadFileItem } from "@/lib/storage";
