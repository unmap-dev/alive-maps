/**
 * The shareable link: `?from=lng,lat&to=lng,lat` opens on that walk and gets directions at once,
 * `&fromName=…&toName=…` names its ends, `&walk=/walks/<page>/routes/<walk>.json` pins the walk to
 * a stored route (`&back=1` reads it from the other end), and `?lang=fr` opens it in French; other
 * keys are kept. Pure functions; the app owns history and the fetch. Unit-tested in test/url.test.ts.
 */
import type { Lang } from "@/lib/kit/i18n";
import type { PinnedLeg, PinnedWalk } from "@/lib/alive-walks";

export type LngLat = [number, number];

export interface AliveState {
  /** Where the walk starts, or null for the block's default sample. */
  from: LngLat | null;
  /** Where the walk ends, or null for the block's default sample. */
  to: LngLat | null;
  /** What the start is called, such as "Hotel Arts", or null to say "Start". */
  fromName: string | null;
  /** What the destination is called, or null to say "Destination". */
  toName: string | null;
  /** A stored route this walk is pinned to, as a same-site path, or null to search. */
  walk: string | null;
  /** True when the pinned route is read from its far end: the way back. */
  back: boolean;
  /** The language a link asks for, or null to follow the reader's browser. */
  lang: Lang | null;
}

/** Only a walks page's own route files: a path on this site, never another site's address. */
const WALK_PATH = /^\/walks\/[a-z0-9-]+\/routes\/[a-z0-9-]+\.json$/;

/** A decimal number, as a link writes one: no hex, no exponent, no spaces. */
const NUMBER = /^-?\d+(?:\.\d+)?$/;
/** Long enough for a hotel or a street address; a longer name is cut, not refused. */
export const MAX_NAME = 80;

function parsePair(value: string | null): LngLat | null {
  if (!value) return null;
  const parts = value.split(",");
  if (parts.length !== 2 || !parts.every((part) => NUMBER.test(part))) return null;
  const [lng, lat] = parts.map(Number) as LngLat;
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return null;
  return [lng, lat];
}

/** A name as the page shows it: one line, its spaces folded, at most MAX_NAME characters. */
function parseName(value: string | null): string | null {
  const name = (value ?? "").replace(/\s+/g, " ").trim();
  return name ? [...name].slice(0, MAX_NAME).join("").trim() : null;
}

export function parseState(search: string): AliveState {
  const q = new URLSearchParams(search);
  const lang = q.get("lang");
  return {
    from: parsePair(q.get("from")),
    to: parsePair(q.get("to")),
    fromName: parseName(q.get("fromName")),
    toName: parseName(q.get("toName")),
    walk: WALK_PATH.test(q.get("walk") ?? "") ? q.get("walk") : null,
    back: q.get("back") === "1",
    lang: lang === "en" || lang === "fr" ? lang : null,
  };
}

export function writeState(search: string, state: AliveState): string {
  const q = new URLSearchParams(search);
  for (const key of ["from", "to"] as const) {
    const at = state[key];
    if (at) q.set(key, at.join(","));
    else q.delete(key);
  }
  for (const key of ["fromName", "toName"] as const) {
    const name = parseName(state[key]);
    if (name) q.set(key, name);
    else q.delete(key);
  }
  if (state.walk) q.set("walk", state.walk);
  else q.delete("walk");
  if (state.walk && state.back) q.set("back", "1");
  else q.delete("back");
  if (state.lang) q.set("lang", state.lang);
  else q.delete("lang");
  const s = q.toString();
  return s ? `?${s}` : "";
}

/**
 * The block's `initial` walk: only when the link names both ends, else the block's own sample.
 * A link's walk is got at once (`go`), so whoever opens it sees the routes, not an empty map.
 */
export function initialWalk(state: AliveState): { from: LngLat; to: LngLat; fromName?: string; toName?: string; go: true } | undefined {
  if (!state.from || !state.to) return undefined;
  return {
    from: state.from,
    to: state.to,
    ...(state.fromName ? { fromName: state.fromName } : {}),
    ...(state.toName ? { toName: state.toName } : {}),
    go: true,
  };
}

const isPair = (v: unknown): v is [number, number] => Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === "number" && Number.isFinite(n));
function readLeg(v: unknown): PinnedLeg | null {
  if (typeof v !== "object" || v === null) return null;
  const { coords, durationS, distanceM } = v as Record<string, unknown>;
  if (!Array.isArray(coords) || coords.length < 2 || !coords.every(isPair)) return null;
  if (typeof durationS !== "number" || !(durationS > 0) || typeof distanceM !== "number" || !(distanceM > 0)) return null;
  return { coords, durationS, distanceM };
}

/**
 * A stored route file read as a pinned walk, or null when it is not one. The file is data from this
 * site, but a malformed one must not reach the map: anything off and the link searches instead.
 */
export function readPinned(json: unknown): PinnedWalk | null {
  if (typeof json !== "object" || json === null) return null;
  const { walk, fastest, sameAsFastest } = json as Record<string, unknown>;
  const w = readLeg(walk);
  const f = readLeg(fastest);
  if (!w || !f) return null;
  return { walk: w, fastest: f, ...(sameAsFastest === true ? { sameAsFastest: true } : {}) };
}
