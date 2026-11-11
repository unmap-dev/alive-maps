# Alive Maps, built with Unmap

Walking directions that trade a minute for a nicer walk. Pick a start and a destination (or one of
three Calgary samples) and **Get directions**: the app finds the fastest walk, then livelier
detours past parks, the river, streets away from traffic, cafés and public art, and scores them all. Five dials
say what makes a walk alive to you and how many extra minutes you will take; moving them re-ranks
the walks at once and calls nothing. The pick is drawn in the theme's primary colour with a time
bubble, up to three cards for what it passes, and a "Why this route" card with the five scores.
One of the [Unmap apps](https://unmap.dev/apps); live at
[apps.unmap.dev/alive-maps](https://apps.unmap.dev/alive-maps/).

The walks, parks, water, streets and places are **live Unmap responses built from OpenStreetMap**
(ODbL). Two things on screen are not, and both are labelled where they are seen: the three
**sample walks** (a start and a destination each, chosen for this app) and the **highlight
pictures**, which are AI-generated illustrations of a kind of place, never photos of the place
named. Each picture carries an "Illustration" tag and alt text saying it is AI-generated. See
[`DATA_SOURCES.md`](DATA_SOURCES.md).

The info button at the bottom right of the map holds the language switch, what is on screen and
where it comes from, and **Built with Unmap**: the services and SDK calls behind the page.

## The key it needs

Any Unmap browser key. No add-on is needed.

## Run it

You need Node 24 (22.18+ works), pnpm and an Unmap browser key from
[unmap.dev/dashboard](https://unmap.dev/dashboard).

```bash
cp .env.example .env.local      # then set NEXT_PUBLIC_UNMAP_KEY
pnpm install
pnpm dev                        # http://localhost:3210
```

Without a key the app says how to get one and calls nothing.

| Command | |
| --- | --- |
| `pnpm dev` | development server on port 3210 |
| `pnpm build` | static export in `out/` |
| `pnpm test` | unit and component tests (Vitest) |
| `pnpm lint` / `pnpm typecheck` | |
| `pnpm run deploy` | build, then `wrangler deploy` to your Cloudflare account (edit `wrangler.jsonc` first) |

The key ships in the browser bundle. Restrict it to your origins (`http://localhost:3210` and your
domain) in the dashboard. Any static host works: `out/` is plain files.

## Shareable links

| Query | |
| --- | --- |
| `?from=-114.087,51.0525&to=-114.0614,51.0478` | opens on that walk, each end as `longitude,latitude`; both ends must be valid, or the app opens on the Bridgeland sample. The link follows the walk: picking a sample, searching an end or swapping them rewrites `from` and `to` in place, so the address bar is always a link to the walk on screen |
| `?lang=fr` | French |

## What it costs

Every authenticated request is one call. **Get directions spends at most 40 calls**: one `/route`
for the fastest walk, up to 24 basemap tiles read for scoring the parks, water and streets (not
the map's own display tiles, which it requests separately), two
`POST /places/along` for the cafés, shops and landmarks, then `/route` pairs for the detours and
`/match` for walks found on the walking graph, within that budget. The answer is kept per start and
destination, so asking again costs nothing, unless places or the scoring tiles were unavailable,
when asking again tries them again. **The dials are free**: moving them re-ranks the walks
in your browser and calls nothing. The search boxes call `/geocode/autocomplete` as you type, and
the map makes its own style and tile requests.

## How it is built

- `components/alive/alive-app.tsx`: the `alive-route-explorer` block filling the page, titled
  "Alive Maps" with a beta badge, the walk from the link (kept in the link as it changes), and the info popover with the kit's
  provenance badges, the language switch and Built with Unmap.
- `lib/pictures.ts`: the highlight pictures in `public/highlights/`, keyed as
  `public/highlights/manifest.json` lists them (a place category such as `food.cafe`, or a
  highlight kind: `park`, `water`, `quiet`, `life`, `landmark`). Swap in your own pictures by
  editing the manifest; label them as the block does.
- `lib/url.ts`: the shareable link, as pure functions.
- `app/globals.css`: a stock shadcn stylesheet with this app's own token values (a warm ground, a
  teal primary, a 1rem radius) and Figtree. The block follows whatever tokens you give it.
- `components/ui/` and `lib/` (the `alive-*`, `map-*` files): the registry items
  (`alive-route-explorer`, `geocoder`, `map`, `map-layers`, `map-context`) and stock shadcn
  primitives, copied in **unmodified**. `lib/kit/`: the shared app chrome. Change them upstream,
  never here; in the monorepo, `pnpm sync` recopies them and `test/sync.test.ts` fails on drift.
  In your own clone they are ordinary source: edit freely.

To use the block in an app you already have:

```bash
npx shadcn@latest registry add @unmap=https://registry.unmap.dev/r/{name}.json
npx shadcn@latest add @unmap/alive-route-explorer
```

Guide: [unmap.dev/docs/frontend/blocks](https://unmap.dev/docs/frontend/blocks#find-a-livelier-walk).

## Licence

The code is MIT. The map data is © OpenStreetMap contributors under the ODbL: keep the credit the
map shows. The highlight pictures are released under this repository's MIT licence too; they were
generated with FLUX.1 [schnell], whose Apache-2.0 model licence places no restriction on outputs.
See [`DATA_SOURCES.md`](DATA_SOURCES.md).
