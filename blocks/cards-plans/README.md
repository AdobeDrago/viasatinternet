# cards-plans

Custom **cards** block. Purpose: Pricing cards (no image) with eyebrow, plan name, price, feature list, tagline, price-lock note and CTA; emits Product/Offer JSON-LD.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per plan, one cell: eyebrow paragraph, h3 plan name, "Starting at", price paragraph with strong ($39.99/mo.), term, ul of features, tagline paragraph, ":lock: ..." note, CTA link.

## Supported variations

| Variation | Option class |
| --- | --- |
| Highlight plan 1 | `featured-1` |
| Highlight plan 2 | `featured-2` |
| Highlight plan 3 | `featured-3` |

## Universal Editor fields

N/A (Document Authoring project)

## Usage

Plan cards in fragment /viasatinternet/fragments/plans (with ** / *** footnotes). Each card with a heading and a strong $ price adds a Product (name, description = tagline, Offer price/priceCurrency USD/url = CTA) to <script id="product-jsonld"> via scripts/structured-data.js upsertProductJsonLd().

## Reuse guidance

Author as "Cards Plans (featured 2)" to highlight the BEST VALUE (2nd) card. The price must be a paragraph with strong, not a heading.
