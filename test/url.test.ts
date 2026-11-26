import { describe, expect, it } from "vitest";
import { initialWalk, MAX_NAME, parseState, readPinned, writeState } from "@/lib/url";

const FROM: [number, number] = [-114.0415, 51.0545];
const TO: [number, number] = [-114.0575, 51.0455];
const NONE = { from: null, to: null, fromName: null, toName: null, walk: null, back: false, lang: null };

describe("the shareable link", () => {
  it("reads the start, the destination, their names and the language", () => {
    expect(parseState("?from=-114.0415,51.0545&to=-114.0575,51.0455&lang=fr")).toEqual({ ...NONE, from: FROM, to: TO, lang: "fr" });
    expect(parseState("?from=-114.0415,51.0545")).toEqual({ ...NONE, from: FROM });
    expect(parseState("?fromName=Hotel+Arts&toName=East%20Village")).toEqual({ ...NONE, fromName: "Hotel Arts", toName: "East Village" });
    expect(parseState("")).toEqual(NONE);
  });

  it("round-trips through the query string and keeps every other key", () => {
    const state = { from: FROM, to: TO, fromName: "Hotel Arts", toName: "Café & Co", walk: null, back: false, lang: "fr" as const };
    const search = writeState("?utm=x", state);
    expect(search).toBe("?utm=x&from=-114.0415%2C51.0545&to=-114.0575%2C51.0455&fromName=Hotel+Arts&toName=Caf%C3%A9+%26+Co&lang=fr");
    expect(parseState(search)).toEqual(state);
    expect(writeState("?from=1,2&to=3,4&fromName=a&toName=b&lang=fr", NONE)).toBe("");
  });

  it("rejects a malformed or out-of-range pair, and a language that is not ours", () => {
    for (const bad of ["abc", "-114.04", "-114.04,51.05,3", "-114.04,", ",51.05", "200,51", "-114,95", "NaN,51", "Infinity,1", "-114.04 51.05", "0x10,1"]) {
      expect(parseState(`?from=${encodeURIComponent(bad)}`).from, bad).toBeNull();
    }
    expect(parseState("?lang=de").lang).toBeNull();
  });

  it("keeps a name to one line and a readable length, and drops an empty one", () => {
    expect(parseState(`?fromName=${encodeURIComponent("  Hotel\n\tArts  ")}`).fromName).toBe("Hotel Arts");
    expect(parseState("?fromName=%20%20&toName=").fromName).toBeNull();
    expect(parseState("?toName=").toName).toBeNull();
    expect(parseState(`?toName=${"a".repeat(200)}`).toName).toHaveLength(MAX_NAME);
  });

  it("opens on a link's walk, named and with directions got at once, only when both ends are valid", () => {
    expect(initialWalk(parseState("?from=-114.0415,51.0545&to=-114.0575,51.0455"))).toEqual({ from: FROM, to: TO, go: true });
    expect(initialWalk(parseState("?from=-114.0415,51.0545&to=-114.0575,51.0455&fromName=Hotel+Arts"))).toEqual({ from: FROM, to: TO, fromName: "Hotel Arts", go: true });
    expect(initialWalk(parseState("?from=-114.0415,51.0545&to=nope&fromName=Hotel+Arts"))).toBeUndefined();
    expect(initialWalk(parseState("?to=-114.0575,51.0455"))).toBeUndefined();
  });

  it("pins a walk only to a walks page's own route file on this site, and reads the way back", () => {
    const pinned = "?from=1,2&to=3,4&walk=/walks/hotel-arts/routes/river.json&back=1";
    expect(parseState(pinned)).toMatchObject({ walk: "/walks/hotel-arts/routes/river.json", back: true });
    for (const bad of ["https://evil.example/walks/a/routes/b.json", "//evil.example/walks/a/routes/b.json", "/walks/../secret.json", "/walks/a/routes/b.js", "/other/a.json"]) {
      expect(parseState(`?walk=${encodeURIComponent(bad)}`).walk, bad).toBeNull();
    }
    // `back` means nothing without a pinned walk, so it is not written alone.
    expect(writeState("", { ...NONE, back: true })).toBe("");
    expect(writeState("", { ...NONE, walk: "/walks/a/routes/b.json", back: true })).toBe("?walk=%2Fwalks%2Fa%2Froutes%2Fb.json&back=1");
  });

  it("reads a stored route file as a pinned walk, and refuses one that is malformed", () => {
    const leg = { coords: [FROM, TO], durationS: 600, distanceM: 800 };
    expect(readPinned({ walk: leg, fastest: leg, sameAsFastest: true })).toEqual({ walk: leg, fastest: leg, sameAsFastest: true });
    expect(readPinned({ walk: leg, fastest: leg })).toEqual({ walk: leg, fastest: leg });
    for (const bad of [null, "x", {}, { walk: leg }, { walk: { ...leg, coords: [FROM] }, fastest: leg }, { walk: { ...leg, durationS: -1 }, fastest: leg }, { walk: { ...leg, coords: [FROM, ["a", 1]] }, fastest: leg }]) {
      expect(readPinned(bad), JSON.stringify(bad)).toBeNull();
    }
  });
});
