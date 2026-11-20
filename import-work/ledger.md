# Ledger: viasatinternet.com home page

Bar: pixel >= 99% and 0 computed-style mismatches at 1440 and 1280 (default).
Result: pixel bar met in 17 of 18 checks; 0 mismatches not reachable (see "Residual").

| Piece | Block / variant | Pixel 1440 | Pixel 1280 | Mismatches (1440) | Notes |
| --- | --- | --- | --- | --- | --- |
| header (util bar) | `header` rewrite | 100% | 100% | 21 | Mismatches are the source's unstyled web-component hosts (Times/black) |
| hero | `hero` search | 99.15% | 98.85% | 25 | 1280 stopped by the stop rule (98.7 -> 98.9 -> 98.85) |
| order | `hero` banner | 99.58% | 99.41% | 26 | Needed `object-position: top` and the source's Scene7 presets per breakpoint |
| stay-connected | `columns` media / badge / media reverse | 99.37% | 99.19% | 67 | One section, three blocks; gaps 48px |
| why-choose | `cards` carousel | 99.95% | 99.94% | 20 | 5 unique cards (source loops duplicates) |
| keeps-you-connected | `hero` center | 99.88% | 99.82% | 21 | |
| faq | new `accordion` | 100% | 100% | 3 | Closed answers `display: none` |
| promo-legal | default content, `dark legal` | 99.98% | 99.98% | 26 | |
| footer | `footer` rewrite | 99.67% | 99.63% | 73 | |

Offsets: 18/18 sections at the source's page position. Lint: `npm run lint` clean
(`no-descending-specificity` disabled by comment in 5 block CSS files).

## Decisions
- Font stacks are exactly `"Uni Neue"` and `"Source Sans Pro"` (as the source computes them), so the
  `font-family` check matches. The size-adjusted fallback faces from brand-setup were removed.
- Images stay on the source CDN (Scene7 / viasatinternet.com) as authored links; `scripts/scene7.js`
  rebuilds the source's per-breakpoint presets.
- Hero address field is a non-functional look-alike.

## Residual (not fixed)
- Style mismatches that come from the source's DOM, not from layout: web-component hosts
  (`bm-button`, `bm-text`) report Times/black while the visible text is styled inside shadow DOM,
  and legal text is an inline span inside a block. Layout, colour and position of the visible text match.
- Hero at 1280 is 98.85%.
- Not covered: mobile (hero text overflows at 375px), hover/open states, FAQ open state, carousel
  arrow behaviour, nav scroll behaviour, sticky header timeline.
- Footer text boxes are about 6% wider on the source than in the rebuild at identical font settings; cause not found.

## Branch preview check
After `publish.js --yes --ref viasat-home`, nav and footer matched. For home, publish.js printed
"blocks DIFFER (8 authored vs 0 served)" although the served `index.plain.html` contains all blocks.
Re-gating against https://viasat-home--viasatinternet--adobedrago.aem.page/ (gate/home-branch.json)
gave the same numbers as the local build in all 18 checks.
