from fastapi.testclient import TestClient

from app.config import Settings, get_settings
from app.main import create_app
from app.services.cache import Cache


def make_client(**overrides: object) -> TestClient:
    settings = Settings(_env_file=None, **overrides)
    app = create_app(settings, cache=Cache(":memory:"))
    app.dependency_overrides[get_settings] = lambda: settings
    return TestClient(app)


def test_health_sem_whisper() -> None:
    response = make_client().get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"ok": True, "whisper": False}


def test_health_com_whisper_habilitado() -> None:
    response = make_client(enable_whisper=True).get("/api/health")

    assert response.json() == {"ok": True, "whisper": True}


def test_cors_libera_so_a_origem_do_front() -> None:
    client = make_client(cors_origin="http://localhost:5173")

    allowed = client.get("/api/health", headers={"Origin": "http://localhost:5173"})
    blocked = client.get("/api/health", headers={"Origin": "http://evil.example"})

    assert allowed.headers["access-control-allow-origin"] == "http://localhost:5173"
    assert "access-control-allow-origin" not in blocked.headers
