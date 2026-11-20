import os

os.environ["DATABASE_URL"] = (
    "postgresql+psycopg2://netflix:netflix@localhost:5432/netflix_catalog"
)
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client() -> Generator[TestClient, None, None]:
    with TestClient(app) as test_client:
        yield test_client
