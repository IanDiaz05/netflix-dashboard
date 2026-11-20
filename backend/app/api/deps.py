from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.catalog import CatalogFilters, CatalogPagination

DbSession = Annotated[Session, Depends(get_db)]
CatalogFilterQuery = Annotated[CatalogFilters, Query()]
CatalogPageQuery = Annotated[CatalogPagination, Query()]
