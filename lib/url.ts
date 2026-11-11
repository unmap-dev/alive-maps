/**
 * The shareable link: `?from=lng,lat&to=lng,lat` opens on that walk and `?lang=fr` in French; other
 * keys are kept. Pure functions; the app owns history. Unit-tested in test/url.test.ts.
 */
import type { Lang } from "@/lib/kit/i18n";

export type LngLat = [number, number];

export interface AliveState {
  /** Where the walk starts, or null for the block's default sample. */
  from: LngLat | null;
  /** Where the walk ends, or null for the block's default sample. */
  to: LngLat | null;
  /** The language a link asks for, or null to follow the reader's browser. */
  lang: Lang | null;
}

/** A decimal number, as a link writes one: no hex, no exponent, no spaces. */
const NUMBER = /^-?\d+(?:\.\d+)?$/;

function parsePair(value: string | null): LngLat | null {
  if (!value) return null;
  const parts = value.split(",");
  if (parts.length !== 2 || !parts.every((part) => NUMBER.test(part))) return null;
  const [lng, lat] = parts.map(Number) as LngLat;
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return null;
  return [lng, lat];
}

export function parseState(search: string): AliveState {
  const q = new URLSearchParams(search);
  const lang = q.get("lang");
  return { from: parsePair(q.get("from")), to: parsePair(q.get("to")), lang: lang === "en" || lang === "fr" ? lang : null };
}

export function writeState(search: string, state: AliveState): string {
  const q = new URLSearchParams(search);
  for (const key of ["from", "to"] as const) {
    const at = state[key];
    if (at) q.set(key, at.join(","));
    else q.delete(key);
  }
  if (state.lang) q.set("lang", state.lang);
  else q.delete("lang");
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** The block's `initial` walk: only when the link names both ends, else the block's own sample. */
export function initialWalk(state: AliveState): { from: LngLat; to: LngLat } | undefined {
  return state.from && state.to ? { from: state.from, to: state.to } : undefined;
}
