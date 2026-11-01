"use server";

import { revalidatePath } from "next/cache";
import { cloudinary } from "@/lib/storage/provider";
import {
  storageServer as storage
} from "@/lib/storage/server";
import type { FileResourceType } from "@/lib/storage";

type CloudinaryResource = {
  public_id: string;
  asset_id: string;
  secure_url: string;
  format: string;
  display_name: string;
  asset_folder: string;
  bytes?: number;
  created_at?: string;
  [key: string]: any;
};

function insertIntoNestedObject(
  root: any,
  path: string,
  value: any,
  isFile = false,
) {
  const parts = path.split("/");
  let current = root;

  parts.forEach((part, index) => {
    if (index === parts.length - 1) {
      if (isFile) {
        if (!current.files) current.files = [];
        current.files.push(value);
      } else {
        if (!current[part]) current[part] = { __meta: value };
      }
    } else {
      if (!current[part]) current[part] = {};
      current = current[part];
    }
  });
}

/**
 * Dedicated server action to fetch and assemble the full Cloudinary folder & file tree.
 */
export async function getStorageStructureAction(prefix = "pras/portfolio") {
  try {
    const nestedStructure: any = {};
    const rootFolderName = prefix.split("/")[0] || "pras";

    nestedStructure[rootFolderName] = {
      __meta: {
        name: rootFolderName,
        path: rootFolderName,
        external_id: "root",
      },
    };

    async function getAllFolders(path = rootFolderName) {
      try {
        const { folders } = await cloudinary.api.sub_folders(path);
        for (const folder of folders || []) {
          insertIntoNestedObject(nestedStructure, folder.path, folder, false);
          await getAllFolders(folder.path);
        }
      } catch {
        // sub_folders may throw if folder has no sub-folders
      }
    }

    const [resourcesResImages, resourcesResRaw, resourcesResVideo] =
      await Promise.all([
        cloudinary.api
          .resources({
            type: "upload",
            resource_type: "image",
            prefix,
            max_results: 500,
          })
          .catch(() => ({ resources: [] })),
        cloudinary.api
          .resources({
            type: "upload",
            resource_type: "raw",
            prefix,
            max_results: 500,
          })
          .catch(() => ({ resources: [] })),
        cloudinary.api
          .resources({
            type: "upload",
            resource_type: "video",
            prefix,
            max_results: 500,
          })
          .catch(() => ({ resources: [] })),
      ]);

    await getAllFolders(rootFolderName);

    for (const resource of (resourcesResImages?.resources || []) as CloudinaryResource[]) {
      insertIntoNestedObject(
        nestedStructure,
        resource.public_id,
        resource,
        true,
      );
    }

    for (const resource of (resourcesResRaw?.resources || []) as CloudinaryResource[]) {
      insertIntoNestedObject(
        nestedStructure,
        resource.public_id,
        resource,
        true,
      );
    }

    for (const resource of (resourcesResVideo?.resources || []) as CloudinaryResource[]) {
      insertIntoNestedObject(
        nestedStructure,
        resource.public_id,
        resource,
        true,
      );
    }

    return { success: true, structure: nestedStructure };
  } catch (error: any) {
    console.error(
      "[Storage:Action] Failed to fetch Cloudinary structure:",
      error,
    );
    throw new Error(error?.message || "Failed to fetch storage structure.");
  }
}

export async function deleteCloudinaryFileAction(
  publicId: string,
  resourceType?: FileResourceType,
) {
  try {
    const res = await storage.delete.file(publicId, resourceType);
    revalidatePath("/admin/storage");
    return { success: true, result: res };
  } catch (error: any) {
    console.error("[Storage:Action] Failed to delete file:", error);
    throw new Error(error?.message || "Failed to delete file from Cloudinary.");
  }
}

export async function deleteCloudinaryFolderAction(path: string) {
  try {
    const res = await storage.delete.folder(path);
    revalidatePath("/admin/storage");
    return { success: true, result: res };
  } catch (error: any) {
    console.error("[Storage:Action] Failed to delete folder:", error);
    throw new Error(
      error?.error?.message ||
        error?.message ||
        "Failed to delete folder from Cloudinary.",
    );
  }
}

export async function createCloudinaryFolderAction(path: string) {
  try {
    const res = await storage.create.folder(path);
    revalidatePath("/admin/storage");
    return { success: true, result: res };
  } catch (error: any) {
    console.error("[Storage:Action] Failed to create folder:", error);
    throw new Error(
      error?.error?.message ||
        error?.message ||
        "Failed to create folder in Cloudinary.",
    );
  }
}

export async function renameCloudinaryResourceAction(payload: {
  from?: string;
  to: string;
  type: "folder" | "file";
  public_id?: string;
}) {
  try {
    const res = await storage.rename(payload);
    revalidatePath("/admin/storage");
    return { success: true, result: res };
  } catch (error: any) {
    console.error("[Storage:Action] Failed to rename:", error);
    throw new Error(
      error?.error?.message ||
        error?.message ||
        "Failed to rename resource in Cloudinary.",
    );
  }
}
