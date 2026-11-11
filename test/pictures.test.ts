import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "../public/highlights/manifest.json";
import { PICTURES } from "@/lib/pictures";

const dir = join(__dirname, "..", "public", "highlights");
const entries = Object.entries(manifest as Record<string, string[]>);

describe("the highlight pictures", () => {
  it("has a file in public/highlights for every picture the manifest names", () => {
    for (const [, files] of entries) for (const file of files) expect(existsSync(join(dir, file)), file).toBe(true);
  });

  it("gives every key at least one picture", () => {
    expect(entries.length).toBeGreaterThan(0);
    for (const [key, files] of entries) expect(files.length, key).toBeGreaterThan(0);
  });

  it("ships no picture the manifest does not name", () => {
    const named = new Set(entries.flatMap(([, files]) => files));
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".jpg"))) expect(named.has(file), file).toBe(true);
  });

  it("covers the five highlight kinds, and hands the block URLs under the base path", () => {
    for (const kind of ["park", "water", "quiet", "life", "landmark"]) expect(PICTURES[kind]?.length, kind).toBeGreaterThan(0);
    expect(PICTURES["food.cafe"]).toEqual(["/highlights/food.cafe-1.jpg", "/highlights/food.cafe-2.jpg", "/highlights/food.cafe-3.jpg"]);
    expect(Object.keys(PICTURES).sort()).toEqual(entries.map(([key]) => key).sort());
  });
});
