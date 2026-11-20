from __future__ import annotations

import csv
from collections.abc import Iterator
from datetime import date, datetime
from pathlib import Path

VALID_TYPES = {"movie": "Movie", "tv show": "TV Show"}
NULL_TOKENS = frozenset({"", "nan", "null"})
DATE_ADDED_FORMAT = "%B %d, %Y"
MINUTE_UNITS = frozenset({"min", "mins", "minute", "minutes"})
SEASON_UNITS = frozenset({"season", "seasons"})


def normalize_null(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if text.lower() in NULL_TOKENS:
        return None
    return text


def parse_date_added(value: object) -> date | None:
    text = normalize_null(value)
    if text is None:
        return None
    try:
        return datetime.strptime(text, DATE_ADDED_FORMAT).date()
    except ValueError:
        return None


def parse_release_year(value: object) -> int | None:
    text = normalize_null(value)
    if text is None:
        return None
    try:
        return int(text)
    except ValueError:
        return None


def clean_csv_list(value: object) -> str | None:
    text = normalize_null(value)
    if text is None:
        return None
    parts = [part.strip() for part in text.split(",")]
    parts = [part for part in parts if normalize_null(part) is not None]
    if not parts:
        return None
    return ", ".join(parts)


def _parse_duration_string(text: str) -> tuple[str, int | None, str | None]:
    tokens = text.split()
    if len(tokens) < 2:
        return text, None, None
    try:
        duration_value = int(tokens[0])
    except ValueError:
        return text, None, None
    unit_token = tokens[1].lower()
    if unit_token in MINUTE_UNITS:
        return text, duration_value, "min"
    if unit_token in SEASON_UNITS:
        return text, duration_value, "Season"
    return text, None, None


def parse_duration(
    duration_raw: object,
    rating: object = None,
) -> dict[str, str | int | None]:
    duration_text = normalize_null(duration_raw)
    rating_text = normalize_null(rating)

    if duration_text is None and rating_text is not None and rating_text.endswith(" min"):
        duration_text = rating_text
        rating_text = None

    if duration_text is None:
        return {
            "duration_raw": None,
            "duration_value": None,
            "duration_unit": None,
            "rating": rating_text,
        }

    cleaned_raw, duration_value, duration_unit = _parse_duration_string(duration_text)
    return {
        "duration_raw": cleaned_raw,
        "duration_value": duration_value,
        "duration_unit": duration_unit,
        "rating": rating_text,
    }


def clean_row(raw_dict: dict[str, object]) -> tuple[dict | None, str | None]:
    show_id = normalize_null(raw_dict.get("show_id"))
    if show_id is None:
        return None, "missing show_id"

    type_raw = normalize_null(raw_dict.get("type"))
    if type_raw is None:
        return None, f"{show_id}: missing type"
    content_type = VALID_TYPES.get(type_raw.lower())
    if content_type is None:
        return None, f"{show_id}: invalid type {type_raw!r}"

    title = normalize_null(raw_dict.get("title"))
    if title is None:
        return None, f"{show_id}: missing title"

    release_year = parse_release_year(raw_dict.get("release_year"))
    if release_year is None:
        return None, f"{show_id}: missing or invalid release_year"

    listed_in = clean_csv_list(raw_dict.get("listed_in"))
    if listed_in is None:
        return None, f"{show_id}: missing listed_in"

    duration_fields = parse_duration(raw_dict.get("duration"), raw_dict.get("rating"))

    cleaned = {
        "show_id": show_id,
        "type": content_type,
        "title": title,
        "director": clean_csv_list(raw_dict.get("director")),
        "cast": clean_csv_list(raw_dict.get("cast")),
        "country": clean_csv_list(raw_dict.get("country")),
        "date_added": parse_date_added(raw_dict.get("date_added")),
        "release_year": release_year,
        "rating": duration_fields["rating"],
        "duration_raw": duration_fields["duration_raw"],
        "duration_value": duration_fields["duration_value"],
        "duration_unit": duration_fields["duration_unit"],
        "listed_in": listed_in,
        "description": normalize_null(raw_dict.get("description")),
    }
    return cleaned, None


def iter_cleaned_rows(
    csv_path: str | Path,
) -> Iterator[tuple[dict | None, str | None]]:
    path = Path(csv_path)
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for raw_row in reader:
            yield clean_row(raw_row)
