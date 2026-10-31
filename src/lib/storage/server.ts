/**
 * Cloudinary storage server API — wraps the `cloudinary` v2 SDK.
 *
 * This module is server-only: importing it from a Client Component throws.
 * Use it exclusively inside server actions, route handlers, and server components.
 */

import "server-only";

import { cloudinary } from "./provider";
import type { FileResourceType } from "./client";
import { detectTypeFromBuffer } from "../file-type";
import type { UploadApiResponse, UploadApiOptions } from "cloudinary";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface DeleteFileResult {
  result: string;
  publicId: string;
}

export interface DeleteFolderResult {
  success: boolean;
  result: any;
}

export interface CreateFolderResult {
  success: boolean;
  result: any;
}

export interface RenamePayload {
  from?: string;
  to: string;
  type: "folder" | "file";
  public_id?: string;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: FileResourceType | "auto";
  tags?: string[];
  overwrite?: boolean;
  filename?: string;
}

/* ------------------------------------------------------------------ */
/* Server Implementation Functions                                    */
/* ------------------------------------------------------------------ */

/**
 * Delete a single asset with an optional explicit resource type.
 */
async function deleteFile(
  publicId: string,
  resourceType?: FileResourceType,
): Promise<DeleteFileResult> {
  if (!publicId?.trim()) {
    throw new Error("Public ID is required to delete file.");
  }

  const cleanId = publicId.trim();
  const res = await cloudinary.uploader.destroy(cleanId, {
    ...(resourceType ? { resource_type: resourceType } : {}),
  });

  if (res && res.result && res.result !== "ok") {
    throw new Error(`Cloudinary could not delete resource (${res.result}).`);
  }

  return { result: res?.result ?? "", publicId: cleanId };
}

/**
 * Delete multiple assets in a single batch request.
 */
async function deleteFiles(
  publicIds: string[],
  resourceType: FileResourceType = "image",
): Promise<{ deleted: Record<string, string>; notFound: string[] }> {
  if (!publicIds.length) return { deleted: {}, notFound: [] };

  const res = await cloudinary.api.delete_resources(publicIds, {
    resource_type: resourceType,
  });

  const deleted: Record<string, string> = res.deleted || {};
  const notFound = publicIds.filter((id) => deleted[id] === "not_found");

  return { deleted, notFound };
}

/**
 * Delete an empty or non-empty folder.
 */
async function deleteFolder(path: string): Promise<DeleteFolderResult> {
  if (!path?.trim()) {
    throw new Error("Path is required to delete folder.");
  }
  const cleanPath = path.trim().replace(/^\/+|\/+$/g, "");
  const res = await cloudinary.api.delete_folder(cleanPath);
  return { success: true, result: res };
}

/**
 * Create a new folder path in Cloudinary.
 */
async function createFolder(path: string): Promise<CreateFolderResult> {
  if (!path?.trim()) {
    throw new Error("Path is required to create folder.");
  }
  const cleanPath = path.trim().replace(/^\/+|\/+$/g, "");
  const res = await cloudinary.api.create_folder(cleanPath);
  return { success: true, result: res };
}

/**
 * Rename a folder or update a file's display name.
 */
async function renameResource(payload: RenamePayload) {
  const { from, to, type, public_id } = payload;
  const newName = to?.trim();
  if (!newName) throw new Error("New name is required.");

  if (type === "folder") {
    if (!from?.trim()) throw new Error("Source folder path is required.");
    const cleanFrom = from.trim().replace(/^\/+|\/+$/g, "");
    const cleanTo = newName.replace(/^\/+|\/+$/g, "");
    const res = await cloudinary.api.rename_folder(cleanFrom, cleanTo);
    return { success: true, result: res };
  }

  if (!public_id?.trim()) throw new Error("Public ID is required to rename file.");
  const res = await cloudinary.api.update(public_id.trim(), {
    display_name: newName,
  });
  return { success: true, result: res };
}

/**
 * Upload a base64 data URI payload directly to Cloudinary.
 */
async function uploadDataUri(
  dataUri: string,
  options: UploadOptions = {},
): Promise<UploadApiResponse> {
  if (!dataUri) throw new Error("Data URI is required to upload.");

  const uploadOptions: UploadApiOptions = {
    ...(options.folder ? { folder: options.folder.replace(/^\/+|\/+$/g, "") } : {}),
    ...(options.public_id ? { public_id: options.public_id } : {}),
    resource_type: options.resource_type || "auto",
    ...(options.tags?.length ? { tags: options.tags } : {}),
    ...(options.overwrite !== undefined ? { overwrite: options.overwrite } : {}),
  };

  return await cloudinary.uploader.upload(dataUri, uploadOptions);
}

/**
 * Upload an in-memory binary Buffer or Uint8Array.
 * Automatically validates binary magic bytes via `detectTypeFromBuffer`.
 */
async function uploadBuffer(
  buffer: Buffer | Uint8Array,
  options: UploadOptions = {},
): Promise<UploadApiResponse> {
  if (!buffer || buffer.length === 0) {
    throw new Error("Buffer payload is required for upload.");
  }

  // Detect MIME type via file-type magic bytes
  const detected = await detectTypeFromBuffer(buffer, options.filename || options.public_id);
  const mimeType = detected.mime;
  const base64 = Buffer.from(buffer).toString("base64");
  const dataUri = `data:${mimeType};base64,${base64}`;

  return uploadDataUri(dataUri, {
    ...options,
    resource_type: options.resource_type || (detected.category === "image" ? "image" : detected.category === "video" ? "video" : "auto"),
  });
}

/**
 * Upload a standard Web API File object (e.g. from FormData).
 */
async function uploadFile(
  file: File,
  options: UploadOptions = {},
): Promise<UploadApiResponse> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return uploadBuffer(buffer, {
    filename: file.name,
    public_id: options.public_id || file.name.replace(/\.[^/.]+$/, ""),
    ...options,
  });
}

/**
 * Fetch metadata for a single Cloudinary resource.
 */
async function getResource(
  publicId: string,
  resourceType: FileResourceType = "image",
) {
  if (!publicId) throw new Error("Public ID is required to fetch resource.");
  return await cloudinary.api.resource(publicId, {
    resource_type: resourceType,
  });
}

/* ------------------------------------------------------------------ */
/* Storage Server Factory & Instance                                  */
/* ------------------------------------------------------------------ */

export interface StorageServer {
  delete: {
    file: typeof deleteFile;
    files: typeof deleteFiles;
    folder: typeof deleteFolder;
  };
  create: {
    folder: typeof createFolder;
  };
  rename: typeof renameResource;
  upload: {
    dataUri: typeof uploadDataUri;
    buffer: typeof uploadBuffer;
    file: typeof uploadFile;
  };
  get: {
    resource: typeof getResource;
  };
}

/**
 * Returns a storage server instance containing all server-side Cloudinary operations.
 */
export const getStorageServer = (): StorageServer => ({
  delete: {
    file: deleteFile,
    files: deleteFiles,
    folder: deleteFolder,
  },
  create: {
    folder: createFolder,
  },
  rename: renameResource,
  upload: {
    dataUri: uploadDataUri,
    buffer: uploadBuffer,
    file: uploadFile,
  },
  get: {
    resource: getResource,
  },
});

/**
 * Ready-to-use singleton storage server instance.
 */
export const storageServer: StorageServer = getStorageServer();
