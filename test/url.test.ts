import { describe, expect, it } from "vitest";
import { initialWalk, parseState, writeState } from "@/lib/url";

const FROM: [number, number] = [-114.0415, 51.0545];
const TO: [number, number] = [-114.0575, 51.0455];

describe("the shareable link", () => {
  it("reads the start, the destination and the language", () => {
    expect(parseState("?from=-114.0415,51.0545&to=-114.0575,51.0455&lang=fr")).toEqual({ from: FROM, to: TO, lang: "fr" });
    expect(parseState("?from=-114.0415,51.0545")).toEqual({ from: FROM, to: null, lang: null });
    expect(parseState("")).toEqual({ from: null, to: null, lang: null });
  });

  it("round-trips through the query string and keeps every other key", () => {
    const search = writeState("?utm=x", { from: FROM, to: TO, lang: "fr" });
    expect(search).toBe("?utm=x&from=-114.0415%2C51.0545&to=-114.0575%2C51.0455&lang=fr");
    expect(parseState(search)).toEqual({ from: FROM, to: TO, lang: "fr" });
    expect(writeState("?from=1,2&to=3,4&lang=fr", { from: null, to: null, lang: null })).toBe("");
  });

  it("rejects a malformed or out-of-range pair, and a language that is not ours", () => {
    for (const bad of ["abc", "-114.04", "-114.04,51.05,3", "-114.04,", ",51.05", "200,51", "-114,95", "NaN,51", "Infinity,1", "-114.04 51.05", "0x10,1"]) {
      expect(parseState(`?from=${encodeURIComponent(bad)}`).from, bad).toBeNull();
    }
    expect(parseState("?lang=de").lang).toBeNull();
  });

  it("opens on a link's walk only when both ends are valid", () => {
    expect(initialWalk(parseState("?from=-114.0415,51.0545&to=-114.0575,51.0455"))).toEqual({ from: FROM, to: TO });
    expect(initialWalk(parseState("?from=-114.0415,51.0545&to=nope"))).toBeUndefined();
    expect(initialWalk(parseState("?to=-114.0575,51.0455"))).toBeUndefined();
  });
});
