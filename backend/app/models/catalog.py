from datetime import date

from sqlalchemy import Date, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class CatalogTitle(Base):
    __tablename__ = "catalog_titles"

    show_id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String, index=True)
    title: Mapped[str] = mapped_column(String, index=True)
    director: Mapped[str | None] = mapped_column(String, nullable=True)
    cast: Mapped[str | None] = mapped_column(Text, nullable=True)
    country: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    date_added: Mapped[date | None] = mapped_column(Date, nullable=True, index=True)
    release_year: Mapped[int] = mapped_column(Integer, index=True)
    rating: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    duration_raw: Mapped[str | None] = mapped_column(String, nullable=True)
    duration_value: Mapped[int | None] = mapped_column(Integer, nullable=True)
    duration_unit: Mapped[str | None] = mapped_column(String, nullable=True)
    listed_in: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
