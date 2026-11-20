from fastapi.testclient import TestClient

KPI_KEYS = {
    "totalTitles",
    "movieCount",
    "tvShowCount",
    "uniqueCountries",
    "uniqueGenres",
    "averageMovieDurationMinutes",
    "leadingCountry",
    "leadingGenre",
}
CHART_POINT_KEYS = {"label", "value"}
DURATION_KEYS = {"minutes", "seasons"}
GENRE_RATING_KEYS = {"genres", "ratings"}
CATALOG_ITEM_KEYS = {
    "showId",
    "type",
    "title",
    "director",
    "directors",
    "cast",
    "castMembers",
    "country",
    "countries",
    "dateAdded",
    "releaseYear",
    "rating",
    "duration",
    "durationValue",
    "durationUnit",
    "listedIn",
    "genres",
    "description",
}
CATALOG_LIST_KEYS = {"items", "total", "page", "pageSize"}
FILTERS = {
    "type": "Movie",
    "rating": "TV-MA",
    "releaseYearFrom": 2015,
    "releaseYearTo": 2021,
    "genre": "Dramas",
    "country": "United States",
}
SEARCH_FILTERS = {"query": "Dick Johnson"}


def _assert_chart_points(payload: list, *, allow_empty: bool = False) -> None:
    assert isinstance(payload, list)
    if not allow_empty:
        assert payload
    for point in payload:
        assert CHART_POINT_KEYS <= set(point)
        assert isinstance(point["label"], str)
        assert isinstance(point["value"], int | float)


def _assert_catalog_item(item: dict) -> None:
    assert set(item) == CATALOG_ITEM_KEYS
    if item["durationUnit"] is not None:
        assert item["durationUnit"] in {"minutes", "seasons"}
        assert item["durationUnit"] not in {"min", "Season"}
    assert isinstance(item["directors"], list)
    assert isinstance(item["castMembers"], list)
    assert isinstance(item["countries"], list)
    assert isinstance(item["genres"], list)


def test_kpis_unfiltered(client: TestClient) -> None:
    response = client.get("/api/dashboard/kpis")
    assert response.status_code == 200
    body = response.json()
    assert set(body) == KPI_KEYS
    assert body["totalTitles"] == 8807
    assert body["movieCount"] + body["tvShowCount"] == body["totalTitles"]
    assert body["movieCount"] > 0
    assert body["tvShowCount"] > 0
    assert body["uniqueCountries"] > 1
    assert body["uniqueGenres"] > 1
    assert body["leadingCountry"]
    assert body["leadingGenre"]
    assert body["averageMovieDurationMinutes"] is not None


def test_kpis_filtered(client: TestClient) -> None:
    response = client.get("/api/dashboard/kpis", params=FILTERS)
    assert response.status_code == 200
    body = response.json()
    assert set(body) == KPI_KEYS
    assert 0 < body["totalTitles"] < 8807
    assert body["tvShowCount"] == 0
    assert body["movieCount"] == body["totalTitles"]


def test_formats_unfiltered_and_filtered(client: TestClient) -> None:
    unfiltered = client.get("/api/dashboard/formats")
    assert unfiltered.status_code == 200
    points = unfiltered.json()
    _assert_chart_points(points)
    labels = {point["label"] for point in points}
    assert labels == {"Movie", "TV Show"}
    assert sum(point["value"] for point in points) == 8807

    filtered = client.get("/api/dashboard/formats", params={"type": "TV Show"})
    assert filtered.status_code == 200
    filtered_points = filtered.json()
    _assert_chart_points(filtered_points)
    assert {point["label"] for point in filtered_points} == {"TV Show"}
    assert filtered_points[0]["value"] < 8807


def test_trends_unfiltered_and_filtered(client: TestClient) -> None:
    unfiltered = client.get("/api/dashboard/trends")
    assert unfiltered.status_code == 200
    points = unfiltered.json()
    _assert_chart_points(points)
    categories = {point.get("category") for point in points}
    assert {"releaseYear", "dateAdded"} <= categories
    releases = [point for point in points if point.get("category") == "releaseYear"]
    additions = [point for point in points if point.get("category") == "dateAdded"]
    assert releases
    assert additions
    assert [point["label"] for point in releases] == sorted(
        point["label"] for point in releases
    )

    filtered = client.get("/api/dashboard/trends", params=FILTERS)
    assert filtered.status_code == 200
    filtered_points = filtered.json()
    _assert_chart_points(filtered_points)
    assert sum(point["value"] for point in filtered_points) > 0


def test_geography_unfiltered_and_filtered(client: TestClient) -> None:
    unfiltered = client.get("/api/dashboard/geography")
    assert unfiltered.status_code == 200
    points = unfiltered.json()
    _assert_chart_points(points)
    assert len(points) >= 10
    values = [point["value"] for point in points]
    assert values == sorted(values, reverse=True)
    assert points[0]["label"] == "United States"

    filtered = client.get("/api/dashboard/geography", params={"country": "India"})
    assert filtered.status_code == 200
    filtered_points = filtered.json()
    _assert_chart_points(filtered_points)
    assert any(point["label"] == "India" for point in filtered_points)
    assert sum(point["value"] for point in filtered_points) < 8807


def test_genres_ratings_unfiltered_and_filtered(client: TestClient) -> None:
    unfiltered = client.get("/api/dashboard/genres-ratings")
    assert unfiltered.status_code == 200
    body = unfiltered.json()
    assert set(body) == GENRE_RATING_KEYS
    _assert_chart_points(body["genres"])
    _assert_chart_points(body["ratings"])
    rating_values = [point["value"] for point in body["ratings"]]
    assert rating_values == sorted(rating_values, reverse=True)

    filtered = client.get("/api/dashboard/genres-ratings", params={"genre": "Comedies"})
    assert filtered.status_code == 200
    filtered_body = filtered.json()
    assert set(filtered_body) == GENRE_RATING_KEYS
    _assert_chart_points(filtered_body["genres"])
    assert any(point["label"] == "Comedies" for point in filtered_body["genres"])


def test_durations_unfiltered_and_filtered(client: TestClient) -> None:
    unfiltered = client.get("/api/dashboard/durations")
    assert unfiltered.status_code == 200
    body = unfiltered.json()
    assert set(body) == DURATION_KEYS
    _assert_chart_points(body["minutes"])
    _assert_chart_points(body["seasons"])
    assert [point["label"] for point in body["minutes"]] == [
        "0-60",
        "61-90",
        "91-120",
        "121-150",
        "151+",
    ]
    assert [point["label"] for point in body["seasons"]] == ["1", "2", "3", "4+"]
    assert sum(point["value"] for point in body["minutes"]) > 0
    assert sum(point["value"] for point in body["seasons"]) > 0

    movies_only = client.get("/api/dashboard/durations", params={"type": "Movie"})
    assert movies_only.status_code == 200
    movies_body = movies_only.json()
    assert sum(point["value"] for point in movies_body["minutes"]) > 0
    assert sum(point["value"] for point in movies_body["seasons"]) == 0


def test_catalog_list_unfiltered_and_filtered(client: TestClient) -> None:
    unfiltered = client.get("/api/catalog", params={"page": 1, "pageSize": 20})
    assert unfiltered.status_code == 200
    body = unfiltered.json()
    assert set(body) == CATALOG_LIST_KEYS
    assert body["total"] == 8807
    assert body["page"] == 1
    assert body["pageSize"] == 20
    assert len(body["items"]) == 20
    for item in body["items"]:
        _assert_catalog_item(item)

    filtered = client.get(
        "/api/catalog",
        params={**FILTERS, "page": 1, "pageSize": 10},
    )
    assert filtered.status_code == 200
    filtered_body = filtered.json()
    assert set(filtered_body) == CATALOG_LIST_KEYS
    assert 0 < filtered_body["total"] < 8807
    assert filtered_body["pageSize"] == 10
    for item in filtered_body["items"]:
        _assert_catalog_item(item)
        assert item["type"] == "Movie"
        assert item["rating"] == "TV-MA"

    searched = client.get("/api/catalog", params={**SEARCH_FILTERS, "pageSize": 5})
    assert searched.status_code == 200
    searched_body = searched.json()
    assert searched_body["total"] >= 1
    assert any(
        "dick johnson" in item["title"].lower()
        or (item["director"] or "").lower().find("dick johnson") >= 0
        or (item["cast"] or "").lower().find("dick johnson") >= 0
        for item in searched_body["items"]
    )


def test_catalog_item_by_id_and_404(client: TestClient) -> None:
    listing = client.get("/api/catalog", params={"page": 1, "pageSize": 1})
    show_id = listing.json()["items"][0]["showId"]

    response = client.get(f"/api/catalog/{show_id}")
    assert response.status_code == 200
    item = response.json()
    _assert_catalog_item(item)
    assert item["showId"] == show_id

    missing = client.get("/api/catalog/does-not-exist")
    assert missing.status_code == 404


def test_invalid_query_params_return_422(client: TestClient) -> None:
    assert client.get("/api/dashboard/kpis", params={"type": "Film"}).status_code == 422
    assert client.get("/api/catalog", params={"page": 0}).status_code == 422
    assert client.get("/api/catalog", params={"pageSize": 0}).status_code == 422
    assert client.get("/api/catalog", params={"pageSize": 101}).status_code == 422
    assert (
        client.get("/api/dashboard/kpis", params={"releaseYearFrom": "nineteen"})
        .status_code
        == 422
    )
