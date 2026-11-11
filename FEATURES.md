# Features

What Alive Maps does, which Unmap API does it, and what it deliberately does not do.

## Implemented

| Feature | How | Unmap |
| --- | --- | --- |
| A map of Calgary with a sample walk loaded | the registry `map` on the `tropic` style, opening on the Bridgeland to City Hall sample, labelled "Sample" | Maps API (`/styles/tropic.json`, `/tiles`) |
| Start and destination search | two search boxes, with three Calgary samples and a swap button | Geocoding (`GET /geocode/autocomplete`) |
| The fastest walk | a pedestrian route, dashed | Routing (`GET /route?mode=pedestrian`) |
| Livelier walks | detours through points near parks, water and street life, and walks found in your browser on the walking graph and snapped to real streets | Routing (`/route` pairs), Map matching (`POST /match`) |
| Scores | parks, water and streets away from traffic from the basemap tiles; street life and landmarks from places along the walk | Maps tiles (up to 24 read for scoring, apart from the map's display tiles), Places (`POST /places/along`) |
| Five dials and an extra-time budget | re-rank the walks at once, in the browser | none: no call |
| The pick | drawn in the theme's primary colour, with time bubbles, up to three highlight cards and a "Why this route" card with the five scores | none |
| Highlight pictures | AI-generated illustrations by place category or highlight kind, tagged "Illustration" with AI-generated alt text | none: shipped with the app |
| Places unavailable | the ranking falls back to parks, water and streets away from traffic, their dials turn off, the Why card says "Unavailable", and the panel says so | Places (`503`) |
| Scoring tiles unavailable | when the tiles are refused (a walk too long) or fail, parks, water and traffic leave the ranking the same way, and the walks are API detours only | Maps tiles |
| Degraded answers are not kept | a search a source outage degraded is asked again next time; a full answer is kept per start and destination | none |
| A phone layout | the panel becomes a bottom sheet; the summary card shows a failed search's reason and hints at partial results | none |
| Shareable link | `?from=lng,lat&to=lng,lat` and `?lang=fr`; the link follows the walk on screen as you change its ends | none |
| English and French | the switch in the info popover; map labels follow | Maps `lang` |
| No-key state | explains how to get a key; never calls the API without one | none |
| Built with Unmap | the services, calls, components and data sources behind the page, in the info popover | none |
| No tracking | no analytics, no cookies, nothing stored | none |

## Not yet

- The Vue lane of the block.
- Keeping the dials in the link (the link holds the walk's ends, not your weights).

## Not goals

Turn-by-turn navigation, accessibility or safety ratings of a route, opening hours, live crowding,
and photos of the actual places.
