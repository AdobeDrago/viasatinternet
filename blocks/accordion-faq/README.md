# accordion-faq

Custom **accordion** block. Purpose: Single-expand FAQ accordion with question slug ids, reference rows into topic fragments and merged FAQPage JSON-LD.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per Q&A: [question (plain text) | answer (rich text)]; or a reference row with ONE cell holding only a link to /viasatinternet/fragments/faq/<topic>#<question-slug>.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Usage

FAQ sections on home, plans, easycare and the 8 topic fragments /viasatinternet/fragments/faq/<topic> used by the FAQ page. Each item id is the question slug (lowercase, accents stripped, non-alphanumerics collapsed to "-", e.g. "how-does-satellite-internet-work"); #<slug> in the URL opens and scrolls to it. Reference rows are replaced by that Q&A fetched from <path>.plain.html (cached per path); unresolved references are dropped with a console warning. Every decorated Q&A (incl. fragments and references) feeds one <script type="application/ld+json" id="faq-jsonld"> FAQPage via scripts/structured-data.js upsertFaqJsonLd().

## Reuse guidance

Author as "Accordion Faq". Use reference rows for Q&As whose answer matches a master answer; keep page-specific Q&As inline. Slugs must be computed exactly like questionSlug() in accordion-faq.js. Dark vs white color schemes come from section styles.
