from __future__ import annotations

import argparse
import logging
import sys
import time
from pathlib import Path

from sqlalchemy import create_engine, delete, insert
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.core.database import Base
from app.models.catalog import CatalogTitle
from app.services.data_cleaner import iter_cleaned_rows

BACKEND_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CSV_PATH = BACKEND_ROOT / "data" / "netflix_titles.csv"
BATCH_SIZE = 500

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("seed_db")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Idempotent seeder for catalog_titles")
    parser.add_argument(
        "--csv-path",
        default=str(DEFAULT_CSV_PATH),
        help="Path to netflix_titles.csv (relative paths resolve from the backend directory)",
    )
    parser.add_argument(
        "--database-url",
        default=None,
        help="Optional SQLAlchemy database URL override",
    )
    parser.add_argument(
        "--truncate",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Clear catalog_titles before insert (default: truncate)",
    )
    return parser.parse_args(argv)


def resolve_csv_path(csv_path_value: str) -> Path:
    csv_path = Path(csv_path_value)
    if not csv_path.is_absolute():
        csv_path = BACKEND_ROOT / csv_path
    return csv_path.resolve()


def seed(
    csv_path: Path,
    database_url: str,
    truncate: bool,
) -> dict[str, int | float]:
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    Base.metadata.create_all(bind=engine)

    processed = 0
    inserted = 0
    skipped = 0
    batch: list[dict] = []
    started = time.perf_counter()

    with SessionLocal() as session:
        if truncate:
            session.execute(delete(CatalogTitle))
            session.flush()

        for cleaned, skip_reason in iter_cleaned_rows(csv_path):
            processed += 1
            if cleaned is None:
                skipped += 1
                logger.warning("Skipping malformed row: %s", skip_reason)
                continue
            batch.append(cleaned)
            if len(batch) >= BATCH_SIZE:
                session.execute(insert(CatalogTitle), batch)
                inserted += len(batch)
                batch.clear()

        if batch:
            session.execute(insert(CatalogTitle), batch)
            inserted += len(batch)
            batch.clear()

        session.commit()

    elapsed = time.perf_counter() - started
    return {
        "processed": processed,
        "inserted": inserted,
        "skipped": skipped,
        "elapsed": elapsed,
    }


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    csv_path = resolve_csv_path(args.csv_path)
    if not csv_path.is_file():
        logger.error("CSV file not found: %s", csv_path)
        return 1

    database_url = args.database_url or settings.DATABASE_URL
    summary = seed(csv_path, database_url, args.truncate)

    print(f"Processed: {summary['processed']}")
    print(f"Inserted: {summary['inserted']}")
    print(f"Skipped: {summary['skipped']}")
    print(f"Elapsed: {summary['elapsed']:.2f}s")
    return 0


if __name__ == "__main__":
    sys.exit(main())
