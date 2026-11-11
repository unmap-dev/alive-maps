// @vitest-environment jsdom
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";

type Props = Record<string, unknown>;

const mocks = vi.hoisted(() => ({
  key: "um_test_alive",
  sdkOptions: [] as unknown[],
  props: {} as Record<string, Props | undefined>,
}));

vi.mock("@/lib/kit/config", async (orig) => ({
  ...(await orig<typeof import("@/lib/kit/config")>()),
  get API_KEY() {
    return mocks.key;
  },
}));
// The SDK: the block's one client. Nothing reaches the network.
vi.mock("@unmap/sdk", () => ({
  Unmap: class {
    router = { route: vi.fn(), match: vi.fn() };
    places = { along: vi.fn() };
    constructor(options: unknown) {
      mocks.sdkOptions.push(options);
    }
  },
}));
vi.mock("@unmap/maps/tiles", () => ({ tileFeatures: vi.fn(), tilesCovering: () => [] }));
// The map item and its context are tested in apps/registry; here they only record what they get.
vi.mock("@/components/ui/map", () => ({
  Map: (props: Props) => {
    mocks.props.map = props;
    return <div data-testid="map">{props.children as ReactNode}</div>;
  },
}));
vi.mock("@/lib/map-context", () => ({ useMap: () => null, useMapReady: () => false, useMapGeneration: () => 0 }));
// The real block, with what the app hands it recorded.
vi.mock("@/components/ui/alive-route-explorer", async (orig) => {
  const real = await orig<typeof import("@/components/ui/alive-route-explorer")>();
  return {
    ...real,
    AliveRouteExplorer: (props: Parameters<typeof real.AliveRouteExplorer>[0]) => {
      mocks.props.block = props as unknown as Props;
      return <real.AliveRouteExplorer {...props} />;
    },
  };
});

import { AliveApp } from "../components/alive/alive-app";

const fetchSpy = vi.fn(() => Promise.reject(new Error("no network in tests")));

async function open(search = "") {
  window.history.replaceState(null, "", `/${search}`);
  await act(async () => {
    render(<AliveApp />);
  });
  await act(async () => {});
}

beforeEach(() => {
  mocks.key = "um_test_alive";
  mocks.sdkOptions.length = 0;
  mocks.props = {};
  fetchSpy.mockClear();
  vi.stubGlobal("fetch", fetchSpy);
  // jsdom has neither; the block asks matchMedia whether it is on a phone (here: no).
  vi.stubGlobal("matchMedia", (query: string) => ({ matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

describe("Alive Maps", () => {
  it("renders the block full-bleed with the key, its title and badge, the pictures, and the Bridgeland sample", async () => {
    await open();
    expect(screen.getByRole("heading", { name: "Alive Maps" })).toBeTruthy();
    expect(screen.getByText("BETA")).toBeTruthy();
    expect(mocks.props.block).toMatchObject({ apiKey: "um_test_alive", lang: "en", title: "Alive Maps", badge: "BETA" });
    expect(mocks.props.block!.initial).toBeUndefined();
    const pictures = mocks.props.block!.pictures as Record<string, string[]>;
    expect(pictures.park!.length).toBeGreaterThan(0);
    expect(pictures["food.cafe"]![0]).toBe("/highlights/food.cafe-1.jpg");
    expect(mocks.sdkOptions.at(-1)).toMatchObject({ key: "um_test_alive" });
    expect(mocks.props.map).toMatchObject({ apiKey: "um_test_alive", lang: "en" });
    // The Bridgeland sample is loaded, and labelled as a sample where it is seen.
    expect(screen.getByTitle("Bridgeland to City Hall").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Sample")).toBeTruthy();
    expect(document.title).toBe("Alive Maps · Unmap app");
    // Nothing is fetched until "Get directions".
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("opens on the walk a shared link names", async () => {
    await open("?from=-114.087,51.0525&to=-114.0614,51.0478");
    expect(mocks.props.block!.initial).toEqual({ from: [-114.087, 51.0525], to: [-114.0614, 51.0478] });
    // Those are the Kensington sample's ends, so the block shows that sample.
    expect(screen.getByTitle("Kensington to the Bow").getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps the link on the walk as the reader changes it, and leaves other keys alone", async () => {
    await open("?lang=fr");
    // Opening on the default sample writes nothing.
    expect(window.location.search).toBe("?lang=fr");
    await act(async () => fireEvent.click(screen.getByTitle("Kensington à la rivière Bow")));
    const q = new URLSearchParams(window.location.search);
    expect(q.get("from")).toBe("-114.087,51.0525");
    expect(q.get("to")).toBe("-114.0614,51.0478");
    expect(q.get("lang")).toBe("fr");
    // Swapping the ends swaps them in the link, and replaces the history entry instead of adding one.
    const length = window.history.length;
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Inverser le départ et l'arrivée" })));
    const swapped = new URLSearchParams(window.location.search);
    expect(swapped.get("from")).toBe("-114.0614,51.0478");
    expect(swapped.get("to")).toBe("-114.087,51.0525");
    expect(window.history.length).toBe(length);
  });

  it("ignores a link with only one valid end", async () => {
    await open("?from=-114.087,51.0525&to=oops");
    expect(mocks.props.block!.initial).toBeUndefined();
  });

  it("speaks French with ?lang=fr, the block and the map labels included", async () => {
    await open("?lang=fr");
    expect(screen.getByRole("heading", { name: "Alive Maps" })).toBeTruthy();
    expect(screen.getByText("BÊTA")).toBeTruthy();
    expect(mocks.props.block).toMatchObject({ lang: "fr", badge: "BÊTA" });
    expect(mocks.props.map).toMatchObject({ lang: "fr" });
    expect(screen.getByTitle("Bridgeland à l'hôtel de ville").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Exemple")).toBeTruthy();
    expect(document.title).toBe("Alive Maps · application Unmap");
  });

  it("labels the sample walks and the AI pictures in the info popover, with Built with Unmap and the language switch", async () => {
    await open();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "About Alive Maps" })));
    const info = within(screen.getByRole("dialog", { name: "About Alive Maps" }));
    expect(info.getAllByText("Sample data").length).toBeGreaterThan(0);
    expect(info.getByText(/AI-generated illustrations/)).toBeTruthy();
    expect(info.getByRole("button", { name: "Built with Unmap" })).toBeTruthy();
    expect(info.getByRole("link", { name: /Source code/ }).getAttribute("href")).toBe("https://github.com/unmap-dev/alive-maps");
    await act(async () => fireEvent.click(info.getByRole("button", { name: "Français" })));
    expect(window.location.search).toBe("?lang=fr");
    expect(mocks.props.block).toMatchObject({ lang: "fr" });
  });

  it("asks for a key and calls nothing without one", async () => {
    mocks.key = "";
    await open();
    expect(screen.getByText("This app needs an Unmap API key")).toBeTruthy();
    expect(mocks.props.block).toBeUndefined();
    expect(mocks.sdkOptions).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
