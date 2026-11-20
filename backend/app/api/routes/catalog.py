from fastapi import APIRouter

from app.api.deps import CatalogFilterQuery, CatalogPageQuery, DbSession
from app.schemas.catalog import CatalogItem, CatalogListResponse
from app.services import analytics_service

router = APIRouter(prefix="/catalog", tags=["catalog"])


@router.get("", response_model=CatalogListResponse)
def get_catalog_items(
    db: DbSession,
    filters: CatalogFilterQuery,
    pagination: CatalogPageQuery,
) -> CatalogListResponse:
    return analytics_service.get_catalog_items(
        db,
        filters,
        page=pagination.page,
        page_size=pagination.page_size,
    )


@router.get("/{show_id}", response_model=CatalogItem, responses={404: {"description": "Catalog item not found"}})
def get_catalog_item(
    show_id: str,
    db: DbSession,
) -> CatalogItem:
    return analytics_service.get_catalog_item_by_id(db, show_id)
