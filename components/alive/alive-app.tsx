"use client";

import { useEffect, useState } from "react";
import { BlocksIcon, ExternalLinkIcon } from "lucide-react";
import { AliveRouteExplorer } from "@/components/ui/alive-route-explorer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { BuiltWith } from "@/lib/kit/built-with";
import { API_KEY } from "@/lib/kit/config";
import { format, LANGS, type Lang } from "@/lib/kit/i18n";
import { MissingKey } from "@/lib/kit/missing-key";
import { ModeToggle } from "@/lib/kit/mode-toggle";
import { ProvenanceBadge } from "@/lib/kit/provenance-badge";
import { KIT_TEXT } from "@/lib/kit/strings";
import { useDocumentTitle, useLang } from "@/lib/kit/use-lang";
import { MANIFEST } from "@/lib/manifest";
import { PICTURES } from "@/lib/pictures";
import { TEXT } from "@/lib/text";
import { reversePinned, type PinnedWalk } from "@/lib/alive-walks";
import { initialWalk, parseState, readPinned, writeState, type LngLat } from "@/lib/url";

/**
 * The kit's header, folded into a popover on the map: what is on screen and where it comes from
 * (the sample walks and the AI illustrations labelled), the language switch, "Built with Unmap" and
 * the source. Bottom-right, in the strip under the block's Why card and beside the map's attribution;
 * a blocks icon rather than an "i", which the attribution button already is.
 */
function AboutPopover({ lang, onLang }: { lang: Lang; onLang: (lang: Lang) => void }) {
  const t = TEXT[lang];
  const kit = KIT_TEXT[lang];
  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" size="icon-sm" className="absolute right-11 bottom-2 z-30 rounded-full shadow-sm" aria-label={t.about} title={t.about} />}
      >
        <BlocksIcon />
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-80 max-w-[calc(100vw-2rem)] gap-3 p-4">
        <PopoverHeader>
          <PopoverTitle>{t.about}</PopoverTitle>
          <PopoverDescription>{MANIFEST.tagline[lang]}</PopoverDescription>
        </PopoverHeader>
        <Separator />
        <section aria-label={kit.dataOnScreen} className="flex flex-col gap-2">
          <h3 className="text-xs font-medium text-muted-foreground">{kit.dataOnScreen}</h3>
          <ul className="flex flex-col gap-2">
            {MANIFEST.provenance.map((p) => (
              <li key={p.label.en} className="flex flex-col gap-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <ProvenanceBadge kind={p.kind} lang={lang} showLive />
                  <span>{p.label[lang]}</span>
                </span>
                {p.source || p.licence || p.attribution ? (
                  <span className="text-xs text-muted-foreground">{[p.source, p.licence, p.attribution].filter(Boolean).join(" · ")}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
        <Separator />
        <div className="flex flex-wrap items-center gap-2">
          <ModeToggle lang={lang} />
          <ToggleGroup variant="outline" size="sm" spacing={0} value={[lang]} onValueChange={(v) => v[0] && onLang(v[0] as Lang)} aria-label={kit.language}>
            {LANGS.map((l) => (
              <ToggleGroupItem key={l} value={l} aria-label={l === "en" ? "English" : "Français"}>
                {l.toUpperCase()}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <BuiltWith manifest={MANIFEST} lang={lang} />
          <a href={MANIFEST.source} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "link", size: "sm" })}>
            <ExternalLinkIcon />
            {kit.source}
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Keeps the link on the walk on screen: `?from=lng,lat&to=lng,lat` follows the start and the
 * destination, and `fromName`/`toName` their names (dropped for an end without one, such as a
 * sample's), with every other key (`lang` included) left as it was. replaceState, so moving the
 * ends does not fill the back button.
 */
export function followEnds({ from, to, fromName, toName }: { from: LngLat; to: LngLat; fromName: string | null; toName: string | null }): void {
  const { pathname, search, hash } = window.location;
  // New ends leave any pinned route behind: the link now searches.
  const next = writeState(search, { ...parseState(search), from, to, fromName, toName, walk: null, back: false });
  window.history.replaceState(window.history.state, "", `${pathname}${next}${hash}`);
}

/**
 * Alive Maps: the alive-route-explorer block, full-bleed, titled "Alive Maps" with a beta badge,
 * with the app's AI illustrations for its highlight cards, the page's language, and the walk a
 * shared link names, kept in the link as the reader changes it. The block's technical details (API
 * calls, how each walk was found, the scores, the sources note) are off: readers want the walk, and
 * the info popover says where the data comes from. Everything else (the search, the
 * dials, the walks, the Why card, the places-unavailable notice) is the block's own.
 */
export function AliveApp() {
  const [lang, setLang] = useLang();
  // Read once: the block takes its starting walk at mount. Rendered on the client only (app/page.tsx).
  const [state] = useState(() => parseState(typeof window === "undefined" ? "" : window.location.search));
  const [initial] = useState(() => initialWalk(state));
  // A pinned walk is fetched before the block mounts, since the block reads its opening walk once.
  const [pinned, setPinned] = useState<PinnedWalk | null | "loading">(() => (initial && state.walk ? "loading" : null));
  useEffect(() => {
    if (!initial || !state.walk) return;
    let live = true;
    fetch(state.walk)
      .then((r) => (r.ok ? r.json() : null))
      .then((json: unknown) => readPinned(json))
      .catch(() => null)
      .then((walk) => {
        if (live) setPinned(walk && state.back ? reversePinned(walk) : walk);
      });
    return () => {
      live = false;
    };
  }, [initial, state.walk, state.back]);
  useDocumentTitle(format(KIT_TEXT[lang].pageTitle, { name: MANIFEST.name[lang] }));
  const t = TEXT[lang];

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      {API_KEY && pinned === "loading" ? (
        <div className="h-full w-full bg-muted" aria-busy="true" aria-label={t.loadingWalk} />
      ) : API_KEY ? (
        <AliveRouteExplorer
          apiKey={API_KEY}
          lang={lang}
          initial={initial && pinned && pinned !== "loading" ? { ...initial, pinned } : initial}
          title={MANIFEST.name[lang]}
          badge={t.badge}
          pictures={PICTURES}
          onEndsChange={followEnds}
          technical={false}
          className="h-full"
        />
      ) : (
        <MissingKey lang={lang} />
      )}
      <AboutPopover lang={lang} onLang={setLang} />
    </main>
  );
}
