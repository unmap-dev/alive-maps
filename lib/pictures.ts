import { BASE_PATH } from "@/lib/kit/config";
import type { AlivePictures } from "@/lib/alive-view";
import manifest from "../public/highlights/manifest.json";

/**
 * The highlight cards' pictures: AI-generated illustrations of a kind of place (a café, a park, a
 * riverside), never photos of the named place. Keyed by place category id (`food.cafe`) or by
 * highlight kind (`park`, `water`, `quiet`, `life`, `landmark`), each a list of variants, as
 * public/highlights/manifest.json lists them. The block shows each one tagged "Illustration" with
 * alt text saying it is AI-generated. Sources and licence: DATA_SOURCES.md.
 */
export const PICTURES: AlivePictures = Object.fromEntries(
  Object.entries(manifest as Record<string, string[]>).map(([key, files]) => [key, files.map((file) => `${BASE_PATH}/highlights/${file}`)]),
);
