import { fileTypeFromBuffer, fileTypeFromBlob } from "file-type";
import mime from "mime-types";

export type MediaCategory =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "archive"
  | "code"
  | "other";

export interface DetectedFileType {
  mime: string;
  ext: string;
  category: MediaCategory;
}

/**
 * Categorize a MIME type into a general media category.
 */
export function categorizeMime(mimeType?: string | null): MediaCategory {
  if (!mimeType) return "other";
  const clean = mimeType.toLowerCase().trim();

  // Handle Cloudinary audio-as-video anomaly
  if (clean === "video/mp3") return "audio";

  if (clean.startsWith("image/")) return "image";
  if (clean.startsWith("audio/")) return "audio";
  if (clean.startsWith("video/")) return "video";

  if (
    clean.includes("pdf") ||
    clean.includes("word") ||
    clean.includes("excel") ||
    clean.includes("powerpoint") ||
    clean.includes("officedocument") ||
    clean.includes("document") ||
    clean.includes("text/plain") ||
    clean.includes("rtf")
  ) {
    return "document";
  }

  if (
    clean.includes("zip") ||
    clean.includes("tar") ||
    clean.includes("gzip") ||
    clean.includes("7z") ||
    clean.includes("rar") ||
    clean.includes("compressed") ||
    clean.includes("archive")
  ) {
    return "archive";
  }

  if (
    clean.includes("javascript") ||
    clean.includes("typescript") ||
    clean.includes("json") ||
    clean.includes("xml") ||
    clean.includes("html") ||
    clean.includes("css")
  ) {
    return "code";
  }

  return "other";
}

/**
 * Check if a MIME type or file name corresponds to an image.
 */
export function isImageMime(mimeType?: string | null, name?: string | null): boolean {
  if (mimeType && mimeType.startsWith("image/")) return true;
  const detected = detectTypeFromFilename(name);
  return detected.category === "image";
}

/**
 * Check if a MIME type or file name corresponds to an audio file.
 * Correctly accounts for Cloudinary's "video/mp3" legacy quirk.
 */
export function isAudioMime(mimeType?: string | null, name?: string | null): boolean {
  if (mimeType) {
    const clean = mimeType.toLowerCase().trim();
    if (clean === "video/mp3" || clean.startsWith("audio/")) return true;
  }
  const detected = detectTypeFromFilename(name);
  return detected.category === "audio";
}

/**
 * Check if a MIME type or file name corresponds to a video file.
 * Ensures audio files are not falsely categorized as video.
 */
export function isVideoMime(mimeType?: string | null, name?: string | null): boolean {
  if (mimeType) {
    const clean = mimeType.toLowerCase().trim();
    if (clean === "video/mp3") return false;
    if (clean.startsWith("video/")) return true;
  }
  const detected = detectTypeFromFilename(name);
  return detected.category === "video";
}

/**
 * Detect file type from a filename or extension string without downloading bytes.
 * Ideal for remote Cloudinary items and text formats (SVG, JSON, MDX).
 */
export function detectTypeFromFilename(filename?: string | null): DetectedFileType {
  if (!filename) {
    return {
      mime: "application/octet-stream",
      ext: "bin",
      category: "other",
    };
  }

  const clean = filename.trim();
  const rawExt = clean.includes(".") ? clean.split(".").pop()?.toLowerCase() || "" : clean.toLowerCase();

  const lookedUpMime = mime.lookup(clean) || mime.lookup(rawExt);
  const resolvedMime = lookedUpMime || (rawExt ? `application/${rawExt}` : "application/octet-stream");
  const canonicalExt = (mime.extension(resolvedMime) || rawExt || "bin").toLowerCase();

  return {
    mime: resolvedMime,
    ext: canonicalExt,
    category: categorizeMime(resolvedMime),
  };
}

/**
 * Detect file type by inspecting binary magic bytes in a Buffer (Server-side).
 * Falls back to filename lookup for text-based formats (SVG, JSON, TXT).
 */
export async function detectTypeFromBuffer(
  buffer: Uint8Array | ArrayBuffer | Buffer,
  fallbackFilename?: string | null
): Promise<DetectedFileType> {
  try {
    const binary = await fileTypeFromBuffer(buffer);
    if (binary) {
      return {
        mime: binary.mime,
        ext: binary.ext,
        category: categorizeMime(binary.mime),
      };
    }
  } catch (error) {
    console.warn("[FileType] Binary inspection failed, falling back to filename lookup:", error);
  }

  return detectTypeFromFilename(fallbackFilename);
}

/**
 * Detect file type by inspecting binary magic bytes in a Blob or File (Client-side).
 * Falls back to filename lookup if magic bytes are not recognized.
 */
export async function detectTypeFromBlob(
  blob: Blob | File,
  fallbackFilename?: string | null
): Promise<DetectedFileType> {
  const name = fallbackFilename || (blob instanceof File ? blob.name : null);

  try {
    const binary = await fileTypeFromBlob(blob);
    if (binary) {
      return {
        mime: binary.mime,
        ext: binary.ext,
        category: categorizeMime(binary.mime),
      };
    }
  } catch (error) {
    console.warn("[FileType] Blob inspection failed, falling back to filename lookup:", error);
  }

  // If binary inspection didn't detect (e.g. SVG, text, or unrecognized), check browser blob.type
  if (blob.type && blob.type !== "application/octet-stream") {
    const canonicalExt = (mime.extension(blob.type) || name?.split(".").pop() || "bin").toLowerCase();
    return {
      mime: blob.type,
      ext: canonicalExt,
      category: categorizeMime(blob.type),
    };
  }

  return detectTypeFromFilename(name);
}

/**
 * Format a human-friendly badge label from MIME type and optional filename
 * (e.g. "DOCX", "PDF", "MP3", "MKV", "PNG", "SVG").
 */
export function formatItemTypeLabel(
  mimeType?: string | null,
  filename?: string | null
): string {
  const rawExt = filename && filename.includes(".")
    ? filename.split(".").pop()?.toUpperCase()
    : null;

  if (mimeType) {
    const clean = mimeType.toLowerCase().trim();

    // High-frequency overrides where standard IANA extension differs from user convention
    if (clean === "audio/mpeg" || clean === "audio/mp3" || clean === "video/mp3") return "MP3";
    if (clean === "video/quicktime") return "MOV";
    if (clean === "video/mp4") return "MP4";
    if (clean === "image/jpeg") return "JPEG";
    if (clean === "image/png") return "PNG";
    if (clean === "image/svg+xml") return "SVG";
    if (clean === "application/pdf") return "PDF";
    if (clean === "application/vnd.ms-excel") return "XLS";
    if (clean.includes("spreadsheetml")) return "XLSX";
    if (clean.includes("wordprocessingml")) return "DOCX";
    if (clean.includes("presentationml")) return "PPTX";

    const lookedUp = mime.extension(clean);
    if (lookedUp) return lookedUp.toUpperCase();
  }

  if (rawExt && rawExt.length <= 6) return rawExt;
  return "FILE";
}

/**
 * Accurately resolve MIME type for a Cloudinary storage item from its resource metadata.
 */
export function getCloudinaryMimeType(file: {
  resource_type?: string;
  format?: string;
  public_id?: string;
  secure_url?: string;
  display_name?: string;
}): string {
  const extSource =
    file.format || file.display_name || file.public_id || file.secure_url || "";
  const ext = (
    (extSource.includes(".") ? extSource.split(".").pop() : extSource) || ""
  ).toLowerCase();

  // Try standard lookup first
  const lookedUp = mime.lookup(ext || extSource);
  if (lookedUp) {
    // If Cloudinary marked it as image but lookup returned another (unlikely), respect lookup
    return lookedUp;
  }

  // Handle Cloudinary resource_type semantics
  if (file.resource_type === "image") {
    return ext === "svg" ? "image/svg+xml" : `image/${ext || "jpeg"}`;
  }

  if (file.resource_type === "video") {
    // Cloudinary stores audio files under "video"
    const isAudio = isAudioMime(null, extSource);
    if (isAudio) return `audio/${ext || "mpeg"}`;
    return `video/${ext || "mp4"}`;
  }

  if (ext) {
    return `application/${ext}`;
  }

  return "application/octet-stream";
}
