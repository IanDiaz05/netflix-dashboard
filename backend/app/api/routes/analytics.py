from fastapi import APIRouter

from app.api.deps import CatalogFilterQuery, DbSession
from app.schemas.catalog import (
    ChartDataPoint,
    DashboardKPIs,
    DurationDistribution,
    GenreAndRatingStats,
)
from app.services import analytics_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpis", response_model=DashboardKPIs)
def get_kpis(
    db: DbSession,
    filters: CatalogFilterQuery,
) -> DashboardKPIs:
    return DashboardKPIs.model_validate(analytics_service.get_kpis(db, filters))


@router.get("/formats", response_model=list[ChartDataPoint])
def get_format_distribution(
    db: DbSession,
    filters: CatalogFilterQuery,
) -> list[ChartDataPoint]:
    return analytics_service.get_format_distribution(db, filters)


@router.get("/trends", response_model=list[ChartDataPoint])
def get_temporal_trends(
    db: DbSession,
    filters: CatalogFilterQuery,
) -> list[ChartDataPoint]:
    return analytics_service.get_temporal_trends(db, filters)


@router.get("/geography", response_model=list[ChartDataPoint])
def get_geographic_distribution(
    db: DbSession,
    filters: CatalogFilterQuery,
) -> list[ChartDataPoint]:
    return analytics_service.get_geographic_distribution(db, filters)


@router.get("/genres-ratings", response_model=GenreAndRatingStats)
def get_genre_and_rating_stats(
    db: DbSession,
    filters: CatalogFilterQuery,
) -> GenreAndRatingStats:
    return analytics_service.get_genre_and_rating_stats(db, filters)


@router.get("/durations", response_model=DurationDistribution)
def get_duration_distribution(
    db: DbSession,
    filters: CatalogFilterQuery,
) -> DurationDistribution:
    return analytics_service.get_duration_distribution(db, filters)
