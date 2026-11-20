from typing import Literal

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

ContentType = Literal["Movie", "TV Show"]
DurationUnit = Literal["minutes", "seasons"]


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        serialize_by_alias=True,
    )


class DashboardKPIs(CamelModel):
    total_titles: int
    movie_count: int
    tv_show_count: int
    unique_countries: int
    unique_genres: int
    average_movie_duration_minutes: float | None
    leading_country: str | None
    leading_genre: str | None


class ChartDataPoint(BaseModel):
    label: str
    value: float
    category: str | None = None


class CatalogItem(CamelModel):
    show_id: str
    type: ContentType
    title: str
    director: str | None
    directors: list[str]
    cast: str | None
    cast_members: list[str]
    country: str | None
    countries: list[str]
    date_added: str | None
    release_year: int
    rating: str | None
    duration: str
    duration_value: int | None
    duration_unit: DurationUnit | None
    listed_in: str
    genres: list[str]
    description: str


class PaginatedCatalogResponse(CamelModel):
    items: list[CatalogItem]
    total: int
    page: int
    page_size: int


class CatalogFilters(CamelModel):
    query: str | None = None
    type: ContentType | Literal["all"] | None = None
    release_year_from: int | None = None
    release_year_to: int | None = None
    country: str | None = None
    genre: str | None = None
    rating: str | None = None


CatalogListResponse = PaginatedCatalogResponse
