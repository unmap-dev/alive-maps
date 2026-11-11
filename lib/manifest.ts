import type { AppManifest } from "@/lib/kit/provenance";

/**
 * What the "Built with Unmap" panel and the info popover say about Alive Maps. Lists only what the
 * app really calls; a service is added here in the same change that starts calling it.
 */
export const MANIFEST: AppManifest = {
  slug: "alive-maps",
  name: { en: "Alive Maps", fr: "Alive Maps" },
  tagline: {
    en: "Walking directions that trade a minute for a nicer walk: past parks, the river, streets away from traffic, cafés and public art.",
    fr: "Des itinéraires à pied qui échangent une minute contre une plus belle marche : parcs, rivière, rues loin de la circulation, cafés et art public.",
  },
  services: [
    {
      name: "Routing",
      role: {
        en: "The fastest walk, then walks through detour points past parks, water and street life, each as a pair of pedestrian routes.",
        fr: "La marche la plus rapide, puis des marches par des points de détour près des parcs, de l'eau et de la vie de quartier, chacune en deux itinéraires piétons.",
      },
      calls: ['unmap.router.route(from, to, { mode: "pedestrian" })  // GET /route'],
      docs: "https://unmap.dev/docs/apis/routing#route",
    },
    {
      name: "Map matching",
      role: {
        en: "Snaps a walk found in your browser on the walking graph to real streets and paths, with its time.",
        fr: "Ajuste aux vraies rues et aux vrais sentiers une marche trouvée dans votre navigateur sur le graphe piéton, avec sa durée.",
      },
      calls: ['unmap.router.match(coordinates, { mode: "pedestrian" })  // POST /match'],
      docs: "https://unmap.dev/docs/apis/routing#match",
    },
    {
      name: "Places",
      role: {
        en: "Cafés, shops and landmarks along the walks, for the street life and landmark scores and the highlight cards. Without it the ranking uses parks, water and streets away from traffic, and the panel says so.",
        fr: "Les cafés, commerces et points d'intérêt le long des marches, pour les notes de vie de quartier et de points d'intérêt et pour les cartes des points forts. Sans eux, le classement utilise les parcs, l'eau et les rues loin de la circulation, et le panneau le dit.",
      },
      calls: ['unmap.places.along({ type: "LineString", coordinates: line }, categories, { radius, limit: 200 })  // POST /places/along'],
      docs: "https://unmap.dev/docs/apis/places",
    },
    {
      name: "Basemap tiles",
      role: {
        en: "The tropic style, and the parks, water and streets the walks are scored on, read from the same vector tiles (up to 24 per search for scoring, apart from the tiles the map displays).",
        fr: "Le style tropic, et les parcs, l'eau et les rues sur lesquels les marches sont notées, lus dans les mêmes tuiles vectorielles (24 au plus par recherche pour la notation, en plus des tuiles affichées par la carte).",
      },
      calls: ['<Map apiKey={key} style="tropic" lang={lang} />', "tileFeatures({ key, bbox, layers })  // GET /tiles/{z}/{x}/{y}"],
      docs: "https://unmap.dev/docs/apis/maps",
    },
    {
      name: "Geocoding",
      role: {
        en: "The start and destination search boxes, as you type.",
        fr: "Les champs de recherche du départ et de la destination, pendant la saisie.",
      },
      calls: ["new Geocoder({ key }).autocomplete(q)  // GET /geocode/autocomplete"],
      docs: "https://unmap.dev/docs/apis/geocoding#autocomplete",
    },
  ],
  items: ["alive-route-explorer", "geocoder", "map"],
  // `source`, `licence` and `attribution` are shown as written in both languages, so they hold
  // names, not sentences.
  provenance: [
    {
      kind: "live",
      label: {
        en: "Walks, times, parks, water, streets and places, from OpenStreetMap",
        fr: "Marches, durées, parcs, eau, rues et lieux, tirés d'OpenStreetMap",
      },
      source: "Unmap · OpenStreetMap",
      licence: "Open Database Licence (ODbL)",
      attribution: "© OpenStreetMap contributors",
      url: "https://www.openstreetmap.org/copyright",
    },
    {
      kind: "live",
      label: { en: "Basemap", fr: "Carte de base" },
      source: "Unmap",
      attribution: "© unmap © OpenStreetMap contributors",
    },
    {
      kind: "sample",
      label: {
        en: "Three sample walks in Calgary: a start and a destination each, chosen for this app",
        fr: "Trois marches d'exemple à Calgary : un départ et une destination chacune, choisies pour cette application",
      },
      source: "Alive Maps",
    },
    {
      kind: "sample",
      label: {
        en: "Highlight pictures: AI-generated illustrations of a kind of place, not photos of the places named. Model licence: Apache-2.0",
        fr: "Images des points forts : illustrations générées par IA d'un type de lieu, pas des photos des lieux nommés. Licence du modèle : Apache-2.0",
      },
      source: "FLUX.1 [schnell] · fal.ai · 2026-11-10",
      // The pictures themselves: this repository's licence. The model's own sits in the label.
      licence: "MIT",
    },
  ],
  source: "https://github.com/unmap-dev/alive-maps",
};
