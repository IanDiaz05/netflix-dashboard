from __future__ import annotations

from collections import Counter
from collections.abc import Iterable, Sequence

from fastapi import HTTPException
from sqlalchemy import extract, func, or_
from sqlalchemy.orm import Query, Session

from app.models.catalog import CatalogTitle
from app.schemas.catalog import (
    CatalogFilters,
    CatalogItem,
    ChartDataPoint,
    ContentType,
    DurationDistribution,
    DurationUnit,
    GenreAndRatingStats,
    GenreAndTalentStats,
    PaginatedCatalogResponse,
)

UNRATED_LABEL = "Sin clasificar"
LIKE_ESCAPE = "\\"
DB_DURATION_UNIT_TO_API: dict[str, DurationUnit] = {
    "min": "minutes",
    "minutes": "minutes",
    "Season": "seasons",
    "seasons": "seasons",
}
MOVIE_DURATION_BUCKETS: tuple[tuple[int, int | None, str], ...] = (
    (0, 60, "0-60"),
    (61, 90, "61-90"),
    (91, 120, "91-120"),
    (121, 150, "121-150"),
    (151, None, "151+"),
)
SEASON_BUCKET_LABELS: tuple[str, ...] = ("1", "2", "3", "4+")
TOP_TALENT_LIMIT = 10


def _filters_or_empty(filters: CatalogFilters | None) -> CatalogFilters:
    return filters if filters is not None else CatalogFilters()


def _split_tokens(value: str | None) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(",") if part.strip()]


def _ilike_pattern(value: str) -> str:
    escaped = (
        value.replace("\\", "\\\\")
        .replace("%", "\\%")
        .replace("_", "\\_")
    )
    return f"%{escaped}%"


def _apply_catalog_filters(query: Query, filters: CatalogFilters | None) -> Query:
    resolved = _filters_or_empty(filters)

    if resolved.type and resolved.type != "all":
        query = query.filter(CatalogTitle.type == resolved.type)
    if resolved.rating:
        query = query.filter(CatalogTitle.rating == resolved.rating)
    if resolved.release_year_from is not None:
        query = query.filter(CatalogTitle.release_year >= resolved.release_year_from)
    if resolved.release_year_to is not None:
        query = query.filter(CatalogTitle.release_year <= resolved.release_year_to)
    if resolved.country:
        query = query.filter(
            CatalogTitle.country.ilike(
                _ilike_pattern(resolved.country),
                escape=LIKE_ESCAPE,
            )
        )
    if resolved.genre:
        query = query.filter(
            CatalogTitle.listed_in.ilike(
                _ilike_pattern(resolved.genre),
                escape=LIKE_ESCAPE,
            )
        )
    if resolved.query:
        term = _ilike_pattern(resolved.query)
        query = query.filter(
            or_(
                CatalogTitle.title.ilike(term, escape=LIKE_ESCAPE),
                CatalogTitle.director.ilike(term, escape=LIKE_ESCAPE),
                CatalogTitle.cast.ilike(term, escape=LIKE_ESCAPE),
            )
        )
    return query


def _count_tokens(values: Iterable[str | None]) -> Counter[str]:
    counter: Counter[str] = Counter()
    for raw in values:
        counter.update(_split_tokens(raw))
    return counter


def _counter_to_points(
    counter: Counter[str],
    *,
    limit: int | None = None,
    category: str | None = None,
) -> list[ChartDataPoint]:
    items = counter.most_common(limit)
    return [
        ChartDataPoint(label=label, value=float(value), category=category)
        for label, value in items
    ]


def _map_duration_unit(db_unit: str | None) -> DurationUnit | None:
    if db_unit is None:
        return None
    return DB_DURATION_UNIT_TO_API.get(db_unit)


def serialize_catalog_item(row: CatalogTitle) -> CatalogItem:
    return CatalogItem(
        show_id=row.show_id,
        type=row.type,  # type: ignore[arg-type]
        title=row.title,
        director=row.director,
        directors=_split_tokens(row.director),
        cast=row.cast,
        cast_members=_split_tokens(row.cast),
        country=row.country,
        countries=_split_tokens(row.country),
        date_added=row.date_added.isoformat() if row.date_added else None,
        release_year=row.release_year,
        rating=row.rating,
        duration=row.duration_raw or "",
        duration_value=row.duration_value,
        duration_unit=_map_duration_unit(row.duration_unit),
        listed_in=row.listed_in,
        genres=_split_tokens(row.listed_in),
        description=row.description or "",
    )


def _movie_duration_bucket(minutes: int) -> str | None:
    for low, high, label in MOVIE_DURATION_BUCKETS:
        if high is None:
            if minutes >= low:
                return label
        elif low <= minutes <= high:
            return label
    return None


def _season_bucket(seasons: int) -> str | None:
    if seasons <= 0:
        return None
    if seasons >= 4:
        return "4+"
    return str(seasons)


def get_kpis(db: Session, filters: CatalogFilters | None = None) -> dict:
    resolved = _filters_or_empty(filters)
    base = _apply_catalog_filters(db.query(CatalogTitle), resolved)

    total_titles = base.with_entities(func.count(CatalogTitle.show_id)).scalar() or 0

    type_rows = (
        _apply_catalog_filters(
            db.query(CatalogTitle.type, func.count(CatalogTitle.show_id)),
            resolved,
        )
        .group_by(CatalogTitle.type)
        .all()
    )
    counts_by_type = {row[0]: int(row[1]) for row in type_rows}
    movie_count = counts_by_type.get("Movie", 0)
    tv_show_count = counts_by_type.get("TV Show", 0)

    country_counter = _count_tokens(
        value
        for (value,) in _apply_catalog_filters(
            db.query(CatalogTitle.country),
            resolved,
        ).all()
    )
    genre_counter = _count_tokens(
        value
        for (value,) in _apply_catalog_filters(
            db.query(CatalogTitle.listed_in),
            resolved,
        ).all()
    )

    avg_duration = (
        _apply_catalog_filters(db.query(func.avg(CatalogTitle.duration_value)), resolved)
        .filter(
            CatalogTitle.type == "Movie",
            CatalogTitle.duration_unit == "min",
            CatalogTitle.duration_value.isnot(None),
        )
        .scalar()
    )

    leading_country = country_counter.most_common(1)[0][0] if country_counter else None
    leading_genre = genre_counter.most_common(1)[0][0] if genre_counter else None

    return {
        "total_titles": int(total_titles),
        "movie_count": movie_count,
        "tv_show_count": tv_show_count,
        "unique_countries": len(country_counter),
        "unique_genres": len(genre_counter),
        "average_movie_duration_minutes": (
            round(float(avg_duration), 2) if avg_duration is not None else None
        ),
        "leading_country": leading_country,
        "leading_genre": leading_genre,
    }


def get_format_distribution(
    db: Session,
    filters: CatalogFilters | None = None,
) -> list[ChartDataPoint]:
    rows = (
        _apply_catalog_filters(
            db.query(CatalogTitle.type, func.count(CatalogTitle.show_id)),
            filters,
        )
        .group_by(CatalogTitle.type)
        .all()
    )
    counts = {row[0]: int(row[1]) for row in rows}
    ordered_types: Sequence[ContentType] = ("Movie", "TV Show")
    return [
        ChartDataPoint(label=content_type, value=float(counts.get(content_type, 0)))
        for content_type in ordered_types
        if content_type in counts
    ]


def get_rating_distribution(
    db: Session,
    filters: CatalogFilters | None = None,
) -> list[ChartDataPoint]:
    counter: Counter[str] = Counter()
    for (rating,) in _apply_catalog_filters(db.query(CatalogTitle.rating), filters).all():
        counter[rating if rating is not None else UNRATED_LABEL] += 1
    return _counter_to_points(counter)


def get_temporal_trends(
    db: Session,
    filters: CatalogFilters | None = None,
) -> list[ChartDataPoint]:
    release_rows = (
        _apply_catalog_filters(
            db.query(CatalogTitle.release_year, func.count(CatalogTitle.show_id)),
            filters,
        )
        .group_by(CatalogTitle.release_year)
        .order_by(CatalogTitle.release_year.asc())
        .all()
    )

    added_year = extract("year", CatalogTitle.date_added)
    added_rows = (
        _apply_catalog_filters(
            db.query(added_year, func.count(CatalogTitle.show_id)),
            filters,
        )
        .filter(CatalogTitle.date_added.isnot(None))
        .group_by(added_year)
        .order_by(added_year.asc())
        .all()
    )

    points: list[ChartDataPoint] = [
        ChartDataPoint(
            label=str(year),
            value=float(count),
            category="releaseYear",
        )
        for year, count in release_rows
    ]
    points.extend(
        ChartDataPoint(
            label=str(int(year)),
            value=float(count),
            category="dateAdded",
        )
        for year, count in added_rows
        if year is not None
    )
    return points


def get_duration_distribution(
    db: Session,
    filters: CatalogFilters | None = None,
) -> DurationDistribution:
    minute_counter: Counter[str] = Counter()
    for (value,) in (
        _apply_catalog_filters(db.query(CatalogTitle.duration_value), filters)
        .filter(
            CatalogTitle.type == "Movie",
            CatalogTitle.duration_unit == "min",
            CatalogTitle.duration_value.isnot(None),
        )
        .all()
    ):
        if value is None:
            continue
        bucket = _movie_duration_bucket(int(value))
        if bucket is not None:
            minute_counter[bucket] += 1

    season_counter: Counter[str] = Counter()
    for (value,) in (
        _apply_catalog_filters(db.query(CatalogTitle.duration_value), filters)
        .filter(
            CatalogTitle.type == "TV Show",
            CatalogTitle.duration_unit == "Season",
            CatalogTitle.duration_value.isnot(None),
        )
        .all()
    ):
        if value is None:
            continue
        bucket = _season_bucket(int(value))
        if bucket is not None:
            season_counter[bucket] += 1

    minutes = [
        ChartDataPoint(
            label=label,
            value=float(minute_counter.get(label, 0)),
            category="minutes",
        )
        for _, _, label in MOVIE_DURATION_BUCKETS
    ]
    seasons = [
        ChartDataPoint(
            label=label,
            value=float(season_counter.get(label, 0)),
            category="seasons",
        )
        for label in SEASON_BUCKET_LABELS
    ]
    return DurationDistribution(minutes=minutes, seasons=seasons)


def get_geographic_distribution(
    db: Session,
    filters: CatalogFilters | None = None,
) -> list[ChartDataPoint]:
    counter = _count_tokens(
        value
        for (value,) in _apply_catalog_filters(
            db.query(CatalogTitle.country),
            filters,
        ).all()
    )
    return _counter_to_points(counter, category="country")


def get_genre_and_talent_stats(
    db: Session,
    filters: CatalogFilters | None = None,
) -> GenreAndTalentStats:
    genre_counter = _count_tokens(
        value
        for (value,) in _apply_catalog_filters(
            db.query(CatalogTitle.listed_in),
            filters,
        ).all()
    )
    director_counter = _count_tokens(
        value
        for (value,) in _apply_catalog_filters(
            db.query(CatalogTitle.director),
            filters,
        )
        .filter(CatalogTitle.director.isnot(None))
        .all()
    )
    cast_counter = _count_tokens(
        value
        for (value,) in _apply_catalog_filters(
            db.query(CatalogTitle.cast),
            filters,
        )
        .filter(CatalogTitle.cast.isnot(None))
        .all()
    )
    return GenreAndTalentStats(
        genres=_counter_to_points(genre_counter, category="genre"),
        directors=_counter_to_points(
            director_counter,
            limit=TOP_TALENT_LIMIT,
            category="director",
        ),
        cast_members=_counter_to_points(
            cast_counter,
            limit=TOP_TALENT_LIMIT,
            category="cast",
        ),
    )


def get_genre_and_rating_stats(
    db: Session,
    filters: CatalogFilters | None = None,
) -> GenreAndRatingStats:
    talent = get_genre_and_talent_stats(db, filters)
    return GenreAndRatingStats(
        genres=talent.genres,
        ratings=get_rating_distribution(db, filters),
    )


def get_catalog_items(
    db: Session,
    filters: CatalogFilters | None = None,
    page: int = 1,
    page_size: int = 20,
) -> PaginatedCatalogResponse:
    resolved = _filters_or_empty(filters)
    query = _apply_catalog_filters(db.query(CatalogTitle), resolved)
    total = query.with_entities(func.count(CatalogTitle.show_id)).scalar() or 0
    rows = (
        query.order_by(CatalogTitle.title.asc(), CatalogTitle.show_id.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return PaginatedCatalogResponse(
        items=[serialize_catalog_item(row) for row in rows],
        total=int(total),
        page=page,
        page_size=page_size,
    )


def get_catalog_item_by_id(db: Session, show_id: str) -> CatalogItem:
    row = db.query(CatalogTitle).filter(CatalogTitle.show_id == show_id).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Catalog item not found")
    return serialize_catalog_item(row)
