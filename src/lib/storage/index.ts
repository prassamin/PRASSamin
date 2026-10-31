/**
 * Unified storage client entrypoint.
 *
 * Re-exports all pure client-safe storage utilities and direct upload methods.
 * Server-only operations reside in `@/lib/storage/server`.
 */

export * from "./client";
