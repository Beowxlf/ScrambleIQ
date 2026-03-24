# Reporting Guide — Prototype 1

> Status: Current source of truth for reporting behavior in Prototype 1.

## 1) Reporting sections that exist today

The `/reports` page currently contains four sections:

1. **Collection Summary** (`GET /reports/collection/summary`)
   - Totals: matches, events, positions, tracked position time, video attached count
   - Event type distribution
   - Position time distribution
   - Deterministic summary insights
2. **Competitor Trends** (`GET /reports/competitors/:competitorId/trends`)
   - Current vs previous window summaries
   - Event and position deltas
   - Data sufficiency indicator/message
   - Deterministic trend insights
3. **Collection Validation** (`GET /reports/collection/validation`)
   - Collection validity and issue totals
   - Severity and issue-type breakdowns
   - Per-match validation status
   - Deterministic validation insights
4. **Collection Export** (`GET /reports/collection/export`)
   - Metadata (`schemaVersion`, `artifactType`, `matchOrder`, filters)
   - Combined summary + validation + per-match exports
   - Structured preview + optional raw JSON in UI

## 2) What “insights” mean in this prototype

Insights are short, deterministic statements generated from fixed thresholds over current report data.

- They are **not** model predictions.
- They are **not** causal conclusions.
- They are **priority cues** for where a coach should inspect data next.

## 3) Insight ordering/prioritization

When multiple insight statements are returned, they are intentionally ordered by backend rule evaluation priority for that report context.

Practical reading rule:

- Read top-to-bottom; earlier statements are intended to represent higher-priority checks for the selected slice.

## 4) Empty states and what they mean

Typical empty states:

- No matches in selected date range/filter scope
- No deltas for selected windows
- No validation issues detected
- Export completed with zero matches
- No insights generated because thresholds were not met

Important interpretation:

- Empty insight list does **not** imply system failure.
- It usually indicates no threshold-triggering conditions in the selected data slice.

## 5) What a coach can and cannot safely conclude

### Reasonable conclusions from current outputs

- Relative distribution patterns in manually tagged data
- Directional change between adjacent date windows for a selected competitor
- Whether dataset quality risks are present in current annotations
- Whether data is sufficient/insufficient under current threshold rules

### Conclusions that are not safe in Prototype 1

- Predicting future performance outcomes
- Assuming causality from correlation in trend shifts
- Treating missing insights as proof that “nothing changed”
- Generalizing beyond the sampled/annotated matches
- Assuming annotation completeness where validation warnings/errors exist

## 6) Operational constraints of reporting

- Reporting depends entirely on existing stored manual annotations.
- Competitor trend query requires a competitor identifier input in the UI.
- Result quality is bounded by annotation quality and sample size.
- Reporting is synchronous request/response (no background batch pipeline).
