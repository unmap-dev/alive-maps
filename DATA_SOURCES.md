# Data sources

What is on screen and where it comes from. Everything is a live Unmap response except the sample
walks and the highlight pictures, and both are labelled where they are seen.

| What | Where it comes from | Licence | Credit shown |
| --- | --- | --- | --- |
| Walks and their times | Unmap routing and map matching over OpenStreetMap paths and streets (`/route`, `/match`, pedestrian) | Open Database Licence (ODbL) 1.0 | MapLibre's attribution control on the map |
| Parks, water and streets the walks are scored on | Unmap's basemap vector tiles (`/tiles`), built from OpenStreetMap | ODbL | as above |
| Cafés, shops and landmarks along the walks | Unmap places (`POST /places/along`), built from OpenStreetMap | ODbL | as above |
| Basemap | Unmap's `tropic` style and vector tiles | © unmap © OpenStreetMap contributors | as above |
| Three sample walks in Calgary | Chosen for this app: a start and a destination each (Bridgeland to City Hall, Kensington to the Bow, Mission to Stephen Avenue). The walks themselves are live. | none | "Sample" beside the walk's name, and "Sample data" in the info popover |
| Highlight pictures (`public/highlights/`, 49 JPEGs) | AI-generated with FLUX.1 [schnell] (`fal-ai/flux/schnell` on fal.ai, 4 steps), 2026-11-10, 560x420 JPEG | Released under this repository's MIT licence. Model licence: Apache-2.0, which places no restriction on outputs | "Illustration" on every picture, alt text saying it is AI-generated, and an entry in the info popover |

## The highlight pictures

They show a **generic scene of a kind of place**, not the named place: a café card shows a café,
not that café. Each prompt asked for a photorealistic scene in a western Canadian city with a
temperate climate, natural light, no text, letters, signage or logos, and no recognizable faces.
Eleven first-pass images were regenerated: eight for garbled lettering or a palm tree, two
attraction images that looked like a real Calgary landmark (a card for a different attraction must
not show a real, recognisable one), and one café.

`public/highlights/manifest.json` maps each key to its variants: a place category id
(`food.cafe`, `culture.museum`, `tourism.artwork`, ...) or a highlight kind (`park`, `water`,
`quiet`, `life`, `landmark`). Two or three variants each; the block picks one from the place, so a
walk keeps its picture. If you replace them, keep them labelled: never present a generic picture as
a photo of the place.

## What the ODbL asks of you

The map data is OpenStreetMap. If you show it, keep the credit visible (the map does). If you
publish a database derived from it, it has to be under the ODbL too.

## What is not here

- **No opening hours, crowding or live status.** A café on a walk is as mapped in OpenStreetMap,
  not necessarily open now.
- **No safety or accessibility rating.** A street is away from traffic by its road class, not
  because anyone measured the traffic.
- **Coverage follows OpenStreetMap.** Where places are sparsely mapped, street life and landmarks
  score low.

Gaps are shown as gaps: when places are unavailable the panel says the ranking uses parks, water
and streets away from traffic only; when the scoring tiles cannot be read it says parks, water and
traffic are left out; and the app never fills one in.
