import type { ContextDetails } from "../api/context";

/** In-memory only — survives Home ↔ Workspace, cleared on full browser reload. */
let memoryCache: ContextDetails | null = null;

/** Return the last successful context payload, if any. */
export function getCachedContext(): ContextDetails | null {
  return memoryCache;
}

/** Persist a successful fetch so SPA revisits skip the loading spinner. */
export function setCachedContext(data: ContextDetails): void {
  memoryCache = data;
}

/** Drop the cache (tests / forced reset). */
export function clearCachedContext(): void {
  memoryCache = null;
}
