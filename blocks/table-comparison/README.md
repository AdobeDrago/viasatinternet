# table-comparison

Custom **table** block. Purpose: Comparison chart: label column plus plan/provider columns, one highlighted column, optional CTA row.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: row 1: [title | one header cell per plan (eyebrow, name, tagline)]; body rows: [feature label (+ sublabel, optional icon) | value per plan, or :check: / :check-none: icon]; optional last row with an empty first cell: [ | CTA link per plan].

## Supported variations

| Variation | Option class |
| --- | --- |
| Highlight column 1 | `highlight-1` |
| Highlight column 2 | `highlight-2` |
| Highlight column 3 | `highlight-3` |

## Layout and styling rules

- Wide layout: equal columns with a 16px gap; each column is a rounded panel. The highlight column is cream. In a chart with a CTA row (the plan chart), the other plan columns are light grey; in charts without one they have no background.
- Narrow layout: when a column would be narrower than 200px (the source rule), the chart shows one plan at a time. A segmented switcher (one button per plan, using the plan name from the header cell) sits under the title, and each feature label is stacked above its value. The first plan is selected by default.
- Value styles come from the markup: bold paragraph = value, plain paragraph after it = subline, `$NN.NN/mo` bold = price, bold text followed by plain text in one paragraph = orange offer, a lone dash = "not included" text.
- Icons: in a chart that uses `:check-none:` anywhere, `:check:` and `:check-none:` are drawn as filled circles (orange in the highlight column). Otherwise `:check:` is a plain check mark.
- Literal `:name:` tokens (local `.plain.html`) are converted to icon spans by the block.

## Universal Editor fields

N/A (Document Authoring project)

## Usage

Plan chart (fragment /viasatinternet/fragments/plans-comparison, highlight-2), competitor chart (highlight-1) on plans, protection plans chart on easycare (highlight-1). Icon-only :check: / :check-none: cells get screen reader text "Included" / "Not included".

## Reuse guidance

Author as "Table Comparison (highlight 2)" etc. Columns are 1-based, the label column is not counted.
