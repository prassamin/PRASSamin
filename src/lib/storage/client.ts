/**
 * Client-safe Cloudinary storage utilities, URL builders, and direct client uploading.
 *
 * This module intentionally does NOT import the `cloudinary` v2 SDK (which is server-only).
 * It can be safely imported from any Client Component or hook. Direct client uploading to
 * Cloudinary avoids Next.js server payload / body size restrictions (1MB-4.5MB).
 */

import axios, { type AxiosRequestConfig } from "axios";
import { CLOUDINARY_NAME, CLOUDINARY_PRESET } from "@/constants/env";
import {
  isImageMime,
  isAudioMime,
  isVideoMime,
  detectTypeFromFilename,
  detectTypeFromBlob,
  getCloudinaryMimeType,
  formatItemTypeLabel,
  type MediaCategory,
  type DetectedFileType,
} from "../file-type";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type FileResourceType = "image" | "video" | "raw";

/** A single entry in an upload progress queue (shared across upload UIs). */
export interface UploadFileItem {
  id: string;
  name: string;
  size: number;
  path?: string;
  status: "pending" | "uploading" | "done" | "error";
  percent: number;
  loaded?: number;
  error?: string;
}

export interface StorageItem {
  name: string;
  path: string;
  url?: string;
  kind: "file" | "folder";
  sizeBytes?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
  publicId?: string;
  assetId?: string;
}

export interface DeliveryTransformOptions {
  resourceType?: FileResourceType | "auto";
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "thumb" | "scale" | "pad" | string;
  quality?:
    | "auto"
    | "auto:best"
    | "auto:good"
    | "auto:eco"
    | "auto:low"
    | number
    | string;
  format?: "auto" | "jpg" | "png" | "webp" | "avif" | string;
  /** Video: pick a frame at this offset (in seconds). */
  startAt?: number;
  /** Custom raw Cloudinary transformation string segment. */
  rawTransform?: string;
}

export interface ThumbnailOptions {
  size?: number;
  width?: number;
  height?: number;
  crop?: string;
}

export interface ClientUploadProgress {
  /** Upload percentage (0 - 100) */
  percent: number;
  /** Total bytes loaded so far */
  loaded: number;
  /** Total expected bytes */
  total?: number;
}

export interface ClientUploadOptions {
  /** Target Cloudinary folder (e.g. 'pras/portfolio/testimonials' or current folder path) */
  folder?: string;
  /** Custom public ID (base name without extension). If omitted, cleaned file name is used */
  publicId?: string;
  /** Cloudinary unsigned upload preset. Defaults to NEXT_PUBLIC_CLOUDINARY_PRESET */
  uploadPreset?: string;
  /** Cloudinary resource type: 'auto' | 'image' | 'video' | 'raw'. Defaults to 'auto' */
  resourceType?: FileResourceType | "auto";
  /** Cloudinary cloud name. Defaults to NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME */
  cloudName?: string;
  /** Optional tags to attach to the uploaded asset */
  tags?: string[];
  /** Progress callback tracking upload percentage (0-100) and byte transfers */
  onProgress?: (progress: ClientUploadProgress) => void;
  /** Abort signal to cancel in-flight uploads */
  signal?: AbortSignal;
  /** Validate file mime type via magic bytes before sending (default: true) */
  validateType?: boolean;
  /** Restrict upload to specific media categories (e.g. ['image'] or ['image', 'video']) */
  allowedCategories?: MediaCategory[];
  /** Maximum file size in bytes to allow before uploading (e.g. 50 * 1024 * 1024) */
  maxSizeBytes?: number;
  /** Additional custom form fields to send to Cloudinary */
  extraFormData?: Record<string, string | Blob>;
}

export interface CloudinaryRawUploadResponse {
  asset_id?: string;
  public_id: string;
  version?: number;
  version_id?: string;
  signature?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type: string;
  created_at?: string;
  tags?: string[];
  bytes: number;
  type?: string;
  etag?: string;
  placeholder?: boolean;
  url: string;
  secure_url: string;
  original_filename?: string;
  duration?: number;
  playback_url?: string;
  [key: string]: any;
}

export interface ClientUploadResult {
  publicId: string;
  secureUrl: string;
  url: string;
  assetId?: string;
  format?: string;
  resourceType: FileResourceType;
  bytes: number;
  width?: number;
  height?: number;
  createdAt?: string;
  mimeType: string;
  item: StorageItem;
  raw: CloudinaryRawUploadResponse;
}

export interface BatchUploadProgress {
  totalFiles: number;
  completedFiles: number;
  failedFiles: number;
  overallPercent: number;
  activeFile?: string;
}

export interface BatchUploadOptions extends Omit<
  ClientUploadOptions,
  "onProgress" | "publicId"
> {
  /** Maximum concurrent uploads (defaults to 2 to prevent network throttling) */
  concurrency?: number;
  /** Callback fired as individual files report upload progress */
  onFileProgress?: (
    file: File | Blob,
    progress: ClientUploadProgress,
    index: number,
  ) => void;
  /** Callback fired when an individual file completes successfully */
  onFileSuccess?: (
    file: File | Blob,
    result: ClientUploadResult,
    index: number,
  ) => void;
  /** Callback fired when an individual file fails */
  onFileError?: (file: File | Blob, error: Error, index: number) => void;
  /** Callback fired on overall batch progress */
  onBatchProgress?: (progress: BatchUploadProgress) => void;
}

/* ------------------------------------------------------------------ */
/* Helpers & URL Builders                                              */
/* ------------------------------------------------------------------ */

/**
 * Resolve the Cloudinary `resource_type` ("image" | "video" | "raw") for a storage item.
 * Cloudinary stores audio files under the "video" resource type.
 */
function getFileResourceType(item: StorageItem): FileResourceType {
  const target = item.name || item.publicId;
  if (isImageMime(item.mimeType, target)) return "image";
  if (
    isVideoMime(item.mimeType, target) ||
    isAudioMime(item.mimeType, target)
  ) {
    return "video";
  }
  return "raw";
}

/**
 * Determine if a storage item is a viewable/playable media asset (image or video).
 */
function isMediaItem(item: StorageItem): boolean {
  if (item.kind !== "file") return false;
  const target = item.name || item.publicId;
  return (
    isImageMime(item.mimeType, target) || isVideoMime(item.mimeType, target)
  );
}

/**
 * Extract publicId from a raw string that might already be a full Cloudinary URL.
 */
function normalizePublicId(publicIdOrUrl: string): string {
  if (!publicIdOrUrl) return "";
  const clean = publicIdOrUrl.trim();

  // If already a full Cloudinary URL, extract the public_id part after /upload/(v\d+/)?
  const uploadMarker = "/upload/";
  const uploadIdx = clean.indexOf(uploadMarker);
  if (uploadIdx !== -1) {
    const afterUpload = clean.slice(uploadIdx + uploadMarker.length);
    // Strip optional transformation params or version (e.g. v1700000000/...)
    return afterUpload
      .replace(/^(?:[a-z]_[^/]+,)*v\d+\//, "")
      .replace(/^\/+/, "");
  }

  return clean.replace(/^\/+/, "");
}

/**
 * Build a Cloudinary delivery URL with optional transformations.
 * Pure string construction — zero SDK dependencies, safe on client and server.
 */
function buildDeliveryUrl(
  publicIdOrUrl: string,
  options: DeliveryTransformOptions = {},
): string {
  if (!publicIdOrUrl) return "";

  const publicId = normalizePublicId(publicIdOrUrl);
  const resourceType = options.resourceType ?? "auto";
  const transforms: string[] = [];

  if (options.width || options.height) {
    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    transforms.push(`c_${options.crop || "fill"}`);
  }

  if (options.startAt !== undefined && resourceType === "video") {
    transforms.push(`so_${options.startAt}`);
  }

  if (options.quality) {
    transforms.push(`q_${options.quality}`);
  }

  if (options.format) {
    transforms.push(`f_${options.format}`);
  }

  if (options.rawTransform) {
    transforms.push(options.rawTransform);
  }

  const transformString =
    transforms.length > 0 ? transforms.join(",") + "/" : "";
  return `https://res.cloudinary.com/${CLOUDINARY_NAME}/${resourceType}/upload/${transformString}${publicId}`;
}

/**
 * Build a thumbnail URL for media items (images and video frames), or null when not applicable.
 */
function getThumbnailUrl(
  item: StorageItem,
  options: ThumbnailOptions = {},
): string | null {
  if (item.kind !== "file") return null;
  const publicId = item.publicId || item.path;
  if (!publicId) return null;

  const width = options.width || options.size || 72;
  const height = options.height || options.size || 72;
  const crop = options.crop || "fill";

  if (isImageMime(item.mimeType, item.name || publicId)) {
    return buildDeliveryUrl(publicId, {
      resourceType: "image",
      width,
      height,
      crop,
      quality: "auto",
      format: "auto",
    });
  }

  if (isVideoMime(item.mimeType, item.name || publicId)) {
    return buildDeliveryUrl(publicId, {
      resourceType: "video",
      width,
      height,
      crop,
      quality: "auto",
      format: "jpg",
      startAt: 0,
    });
  }

  return null;
}

/**
 * Backward-compatible helper for content grid thumbnail lookups.
 */
function getThumbUrl(item: StorageItem, size = 72): string | null {
  return getThumbnailUrl(item, { size });
}

/**
 * Convert a raw Cloudinary upload response to a project `StorageItem`.
 */
function mapUploadResponseToStorageItem(
  raw: CloudinaryRawUploadResponse,
): StorageItem {
  const mimeType = getCloudinaryMimeType(raw);
  const displayName = raw.original_filename
    ? raw.format
      ? `${raw.original_filename}.${raw.format}`
      : raw.original_filename
    : raw.public_id.split("/").pop() || raw.public_id;

  return {
    name: displayName,
    path: raw.public_id,
    url: raw.secure_url || raw.url,
    kind: "file",
    sizeBytes: raw.bytes,
    mimeType,
    createdAt: raw.created_at,
    updatedAt: raw.created_at,
    publicId: raw.public_id,
    assetId: raw.asset_id,
  };
}

/* ------------------------------------------------------------------ */
/* Client Cloudinary Uploading                                 */
/* ------------------------------------------------------------------ */

/**
 * Generate the Cloudinary direct REST upload endpoint URL.
 */
function getCloudinaryUploadUrl(
  cloudName?: string,
  resourceType: FileResourceType | "auto" = "auto",
): string {
  const cloud = cloudName || CLOUDINARY_NAME;
  return `https://api.cloudinary.com/v1_1/${cloud}/${resourceType}/upload`;
}

/**
 * Construct multipart FormData tailored for direct Cloudinary upload preset uploads.
 */
function createUploadFormData(
  file: File | Blob | string,
  options: ClientUploadOptions = {},
): FormData {
  const preset = options.uploadPreset || CLOUDINARY_PRESET;
  if (!preset) {
    throw new Error(
      "Cloudinary upload preset is required for client uploads. Configure NEXT_PUBLIC_CLOUDINARY_PRESET.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  if (options.folder) {
    const cleanFolder = options.folder.replace(/^\/+|\/+$/g, "");
    if (cleanFolder) formData.append("folder", cleanFolder);
  }

  // Generate safe public_id if requested or derivable
  if (options.publicId) {
    const cleanId = options.publicId
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_\-/]/g, "_");
    formData.append("public_id", cleanId);
  } else if (file instanceof File && file.name) {
    const baseName = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_\-/]/g, "_");
    if (baseName) formData.append("public_id", baseName);
  }

  if (options.tags && options.tags.length > 0) {
    formData.append("tags", options.tags.join(","));
  }

  if (options.extraFormData) {
    Object.entries(options.extraFormData).forEach(([key, val]) => {
      formData.append(key, val);
    });
  }

  return formData;
}

/**
 * Directly upload a File or Blob from the browser to Cloudinary via Axios.
 * Completely bypasses Next.js server payload / body size restrictions.
 */
async function uploadFileDirect(
  file: File | Blob,
  options: ClientUploadOptions = {},
): Promise<ClientUploadResult> {
  if (!file) {
    throw new Error("No file or blob provided for upload.");
  }

  // Max size check
  if (options.maxSizeBytes && file.size > options.maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const maxMb = (options.maxSizeBytes / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size (${sizeMb} MB) exceeds maximum allowed size (${maxMb} MB).`,
    );
  }

  // Magic byte file type inspection & category restrictions
  if (options.validateType !== false) {
    const detected: DetectedFileType = await detectTypeFromBlob(file);
    if (options.allowedCategories && options.allowedCategories.length > 0) {
      if (!options.allowedCategories.includes(detected.category)) {
        throw new Error(
          `File format "${detected.mime}" (${detected.category}) is not permitted. Allowed: ${options.allowedCategories.join(", ")}`,
        );
      }
    }
  }

  // Prepare FormData & Endpoint
  const resourceType = options.resourceType || "auto";
  const uploadUrl = getCloudinaryUploadUrl(options.cloudName, resourceType);
  const formData = createUploadFormData(file, options);

  // Perform direct Axios request with real progress tracking
  try {
    const config: AxiosRequestConfig = {
      headers: { "Content-Type": "multipart/form-data" },
      signal: options.signal,
      onUploadProgress: (progressEvent) => {
        if (options.onProgress) {
          const total = progressEvent.total || file.size || 0;
          const loaded = progressEvent.loaded;
          const percent =
            total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0;
          options.onProgress({ percent, loaded, total });
        }
      },
    };

    const res = await axios.post<CloudinaryRawUploadResponse>(
      uploadUrl,
      formData,
      config,
    );
    const raw = res.data;

    if (!raw || !raw.secure_url) {
      throw new Error(
        "Cloudinary response did not contain a valid secure_url.",
      );
    }

    const mimeType = getCloudinaryMimeType(raw);
    const item = mapUploadResponseToStorageItem(raw);

    return {
      publicId: raw.public_id,
      secureUrl: raw.secure_url,
      url: raw.url || raw.secure_url,
      assetId: raw.asset_id,
      format: raw.format,
      resourceType: (raw.resource_type as FileResourceType) || "image",
      bytes: raw.bytes,
      width: raw.width,
      height: raw.height,
      createdAt: raw.created_at,
      mimeType,
      item,
      raw,
    };
  } catch (err: any) {
    if (axios.isCancel(err) || err?.name === "CanceledError") {
      throw new Error("Upload canceled by user.");
    }

    const cloudinaryMsg = err?.response?.data?.error?.message;
    if (cloudinaryMsg) {
      throw new Error(`Cloudinary direct upload failed: ${cloudinaryMsg}`);
    }

    throw new Error(err?.message || "Failed to upload file to Cloudinary.");
  }
}

/**
 * Upload a file from a direct remote URL to Cloudinary (Cloudinary fetches the remote asset directly).
 */
async function uploadFromUrl(
  remoteUrl: string,
  options: ClientUploadOptions = {},
): Promise<ClientUploadResult> {
  if (!remoteUrl || !remoteUrl.trim()) {
    throw new Error("Remote URL is required.");
  }

  const resourceType = options.resourceType || "auto";
  const uploadUrl = getCloudinaryUploadUrl(options.cloudName, resourceType);
  const formData = createUploadFormData(remoteUrl.trim(), options);

  try {
    const res = await axios.post<CloudinaryRawUploadResponse>(
      uploadUrl,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        signal: options.signal,
      },
    );
    const raw = res.data;

    const mimeType = getCloudinaryMimeType(raw);
    const item = mapUploadResponseToStorageItem(raw);

    return {
      publicId: raw.public_id,
      secureUrl: raw.secure_url,
      url: raw.url || raw.secure_url,
      assetId: raw.asset_id,
      format: raw.format,
      resourceType: (raw.resource_type as FileResourceType) || "image",
      bytes: raw.bytes,
      width: raw.width,
      height: raw.height,
      createdAt: raw.created_at,
      mimeType,
      item,
      raw,
    };
  } catch (err: any) {
    const cloudinaryMsg = err?.response?.data?.error?.message;
    if (cloudinaryMsg) {
      throw new Error(`Cloudinary remote URL upload failed: ${cloudinaryMsg}`);
    }
    throw new Error(
      err?.message || "Failed to upload remote URL to Cloudinary.",
    );
  }
}

/**
 * Upload multiple files sequentially or with controlled concurrency.
 */
async function uploadFilesBatch(
  files: (File | Blob)[],
  options: BatchUploadOptions = {},
): Promise<ClientUploadResult[]> {
  if (!files || files.length === 0) return [];

  const results: ClientUploadResult[] = [];
  const concurrency = Math.max(1, Math.min(options.concurrency || 2, 4));
  let completedCount = 0;
  let failedCount = 0;
  const totalFiles = files.length;

  const notifyOverall = (activeFile?: string, currentPercent = 0) => {
    if (options.onBatchProgress) {
      const baseProgress = (completedCount / totalFiles) * 100;
      const filePortion = currentPercent / totalFiles;
      const overallPercent = Math.min(
        100,
        Math.round(baseProgress + filePortion),
      );
      options.onBatchProgress({
        totalFiles,
        completedFiles: completedCount,
        failedFiles: failedCount,
        overallPercent,
        activeFile,
      });
    }
  };

  // Queue runner with worker pool
  let queueIndex = 0;
  const workers = Array.from({ length: concurrency }).map(async () => {
    while (queueIndex < files.length) {
      const idx = queueIndex++;
      const file = files[idx];
      const filename = file instanceof File ? file.name : `file_${idx}`;

      try {
        notifyOverall(filename, 5);
        const result = await uploadFileDirect(file, {
          folder: options.folder,
          uploadPreset: options.uploadPreset,
          resourceType: options.resourceType,
          cloudName: options.cloudName,
          tags: options.tags,
          signal: options.signal,
          validateType: options.validateType,
          allowedCategories: options.allowedCategories,
          maxSizeBytes: options.maxSizeBytes,
          extraFormData: options.extraFormData,
          onProgress: (p) => {
            options.onFileProgress?.(file, p, idx);
            notifyOverall(filename, p.percent);
          },
        });

        completedCount++;
        results.push(result);
        options.onFileSuccess?.(file, result, idx);
        notifyOverall(filename, 100);
      } catch (err: any) {
        failedCount++;
        options.onFileError?.(file, err, idx);
        notifyOverall(filename, 0);
      }
    }
  });

  await Promise.all(workers);
  return results;
}

/* ------------------------------------------------------------------ */
/* Storage Client Factory & Instance                                  */
/* ------------------------------------------------------------------ */

export interface StorageClient {
  getDeliveryUrl: typeof buildDeliveryUrl;
  getThumbnailUrl: typeof getThumbnailUrl;
  getThumbUrl: typeof getThumbUrl;
  getFileResourceType: typeof getFileResourceType;
  isMediaItem: typeof isMediaItem;
  normalizePublicId: typeof normalizePublicId;
  mapResponseToItem: typeof mapUploadResponseToStorageItem;
  upload: {
    file: typeof uploadFileDirect;
    files: typeof uploadFilesBatch;
    fromUrl: typeof uploadFromUrl;
    createFormData: typeof createUploadFormData;
    getUrl: typeof getCloudinaryUploadUrl;
  };
}

/**
 * Returns a storage client instance containing all client-side storage & direct upload helpers.
 */
export const getStorageClient = (): StorageClient => ({
  getDeliveryUrl: buildDeliveryUrl,
  getThumbnailUrl,
  getThumbUrl,
  getFileResourceType,
  isMediaItem,
  normalizePublicId,
  mapResponseToItem: mapUploadResponseToStorageItem,
  upload: {
    file: uploadFileDirect,
    files: uploadFilesBatch,
    fromUrl: uploadFromUrl,
    createFormData: createUploadFormData,
    getUrl: getCloudinaryUploadUrl,
  },
});

/**
 * Ready-to-use singleton storage client.
 */
export const storageClient: StorageClient = getStorageClient();
