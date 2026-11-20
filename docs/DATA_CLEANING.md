# Data cleaning

This document describes how `backend/app/services/data_cleaner.py` turns `backend/data/netflix_titles.csv` into dictionaries that match the `CatalogTitle` SQLAlchemy model (`catalog_titles`). Cleaning uses the Python standard library (`csv`, `datetime`) only.

## Target columns

Cleaned rows contain only model fields:

`show_id`, `type`, `title`, `director`, `cast`, `country`, `date_added`, `release_year`, `rating`, `duration_raw`, `duration_value`, `duration_unit`, `listed_in`, `description`.

The source `duration` column is split into `duration_raw` / `duration_value` / `duration_unit`. No extra database columns are created.

## Null handling

Every string field is stripped of leading and trailing whitespace. Empty strings and case-insensitive `nan` / `null` become `None`. Nullable model columns (`director`, `cast`, `country`, `date_added`, `rating`, `duration_*`, `description`) keep `None` rather than empty strings.

## Type

`type` is normalized to `Movie` or `TV Show` via a case-insensitive match after strip. Any other value (including missing) is malformed: `clean_row` returns `(None, reason)` and the seeder skips the row with a warning.

## Dates and years

`date_added` is parsed with `datetime.strptime` using `%B %d, %Y` (example: `September 25, 2021`). Leading spaces in the CSV are stripped first. Missing or unparseable dates become `None`; the row is still inserted.

`release_year` is cast to `int`. Missing or non-integer values skip the row.

## Duration and the rating swap

`duration_raw` stores the cleaned original duration string.

Numeric parsing:

- `90 min` → `duration_value=90`, `duration_unit="min"`
- `1 Season` / `2 Seasons` → `duration_value` as int, `duration_unit="Season"` (`Seasons` is normalized to `Season`)

If duration is missing but `rating` ends with ` min` (Kaggle rows `s5542`, `s5795`, `s5814`), that value is moved into duration fields and `rating` is set to `None`.

If duration is missing and no rating repair applies, duration fields are `None`. If a duration string is present but cannot be parsed, `duration_raw` is kept and value/unit are `None`.

## Comma-separated lists

`country`, `listed_in`, `director`, and `cast` stay as comma-separated strings. Tokens are split on `,`, stripped, empty/null tokens dropped, then joined with `, ` so values like `United States,  India` become `United States, India`.

`listed_in` is required on `CatalogTitle`. After cleaning, a missing list skips the row.

## Required fields

Rows are skipped when any of these fail: `show_id`, `type` (valid Movie/TV Show), `title`, `release_year`, `listed_in`.

## Seeder interaction

`backend/scripts/seed_db.py` streams `iter_cleaned_rows`, logs skip reasons, and bulk-inserts valid mappings. Default `--truncate` deletes `catalog_titles` before insert so re-runs are idempotent.
