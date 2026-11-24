# cards-icon

Custom **cards** block. Purpose: Icon tiles (icon, title, text, arrow link) inside one white rounded panel.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per tile, one cell: icon (":headset:") first, h3 title, paragraph, link.

## Supported variations

Looks are derived from the content (no option needed):
- tiles with icons: one white rounded panel, 3 per row (4 per row for 4 or 8 tiles, with a larger title)
- tiles without icons: centered step cards with a CTA button at the bottom (e.g. "Getting online is as easy as 1, 2, 3")
- directly after a Columns (media) block in the same section, the tiles continue that panel (add-ons)

Option `centered` ("Cards Icon (centered)"): centered cards with a 48px icon and bold short text
(CAF II). Until the importer emits it, 4 or 8 icon tiles in a `centered` section use this look.

## Universal Editor fields

N/A (Document Authoring project)

## Usage

"Need help?" tiles on easycare; add-ons (8 tiles), cyberprotect (9 tiles).

## Reuse guidance

Author as "Cards Icon". Icons need SVGs in /icons (headset.svg, support-agent.svg, policy.svg, ...).
