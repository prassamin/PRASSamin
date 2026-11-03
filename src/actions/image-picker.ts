"use server";

import { cloudinary } from "@/lib/storage/provider";
import { CloudinaryFile } from "@/types";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface MediaCacheStore {
  files: CloudinaryFile[] | null;
  timestamp: number;
  inFlight: Promise<CloudinaryFile[]> | null;
}

const globalForMediaCache = globalThis as unknown as {
  __cloudinaryMediaCache?: MediaCacheStore;
};

function getCacheStore(): MediaCacheStore {
  if (!globalForMediaCache.__cloudinaryMediaCache) {
    globalForMediaCache.__cloudinaryMediaCache = {
      files: null,
      timestamp: 0,
      inFlight: null,
    };
  }
  return globalForMediaCache.__cloudinaryMediaCache;
}

async function fetchCloudinaryImagesFromApi(): Promise<CloudinaryFile[]> {
  const result = await cloudinary.api.resources({
    type: "upload",
    prefix: "pras/portfolio",
    resource_type: "image",
    max_results: 500,
  });

  const resources = result.resources || [];
  return resources
    .map((res: any) => ({
      asset_id: res.asset_id || res.public_id,
      public_id: res.public_id,
      format: res.format,
      version: res.version,
      resource_type: res.resource_type || "image",
      type: res.type,
      created_at: res.created_at,
      bytes: res.bytes,
      width: res.width,
      height: res.height,
      asset_folder: res.asset_folder || res.folder || "",
      url: res.url,
      secure_url: res.secure_url,
      display_name:
        res.display_name ||
        res.public_id.split("/").pop()?.split(".").shift() ||
        "image",
    }))
    .sort((a: CloudinaryFile, b: CloudinaryFile) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
}

/**
 * Fetch all media library images with server-side caching & deduplication.
 * Avoids revalidateTag/revalidatePath side effects that cause Next.js to reload
 * the active studio route and reset unsaved editor state.
 */
export async function getMediaLibraryImages(forceRefresh = false): Promise<{
  success: boolean;
  files: CloudinaryFile[];
  error?: string;
}> {
  try {
    const store = getCacheStore();
    const now = Date.now();

    if (
      !forceRefresh &&
      store.files !== null &&
      now - store.timestamp < CACHE_TTL_MS
    ) {
      return { success: true, files: store.files };
    }

    if (!forceRefresh && store.inFlight) {
      const files = await store.inFlight;
      return { success: true, files };
    }

    store.inFlight = fetchCloudinaryImagesFromApi();
    try {
      const files = await store.inFlight;
      store.files = files;
      store.timestamp = Date.now();
      return { success: true, files };
    } finally {
      store.inFlight = null;
    }
  } catch (error: any) {
    console.error("Failed to fetch media library images:", error);
    return {
      success: false,
      files: [],
      error: error?.message || "Failed to fetch images from storage",
    };
  }
}

/**
 * Manually invalidate media cache on demand without resetting client route state
 */
export async function invalidateMediaCache() {
  const store = getCacheStore();
  store.files = null;
  store.timestamp = 0;
  store.inFlight = null;
  return { success: true };
}
