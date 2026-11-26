import type { Lang } from "@/lib/kit/i18n";

/** Alive Maps' own words. The block and the kit carry theirs. */
export const TEXT = {
  en: {
    badge: "BETA",
    about: "About Alive Maps",
    loadingWalk: "Loading the walk",
  },
  fr: {
    badge: "BÊTA",
    about: "À propos d'Alive Maps",
    loadingWalk: "Chargement de la marche",
  },
} satisfies Record<Lang, Record<string, string>>;
