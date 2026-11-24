# columns-callout

Custom **columns** block. Purpose: Slim dark rounded callout bar: message left, single action right.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row: [message (strong highlight + text, inline links allowed) | link/button (e.g. ":phone: Call 1-855-393-3302" -> tel:)].

## Supported variations

- (default): teal bar (source `expressive-stronger` surface).
- `neutral`: navy bar (source surface-00), e.g. the plans page "Not sure which plan..." bar. Author as "Columns Callout (neutral)".

A `tel:` link renders as the bare phone CTA (white text, icon before, no fill/arrow); any other link is the white filled button.

## Universal Editor fields

N/A (Document Authoring project)

## Usage

Plan-help bar (plans), EasyCare shop bar (easycare).

## Reuse guidance

Author as "Columns Callout". The cell holding only links gets .columns-callout-action-col. Panel color differences (navy vs teal) belong to the design pass.
