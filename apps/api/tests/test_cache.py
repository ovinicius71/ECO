from app.services.cache import Cache


class FakeClock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


def test_guarda_e_le_json() -> None:
    cache = Cache(":memory:")
    cache.set("k", {"a": [1, 2]}, ttl_s=60)
    assert cache.get("k") == {"a": [1, 2]}


def test_expira_depois_da_validade() -> None:
    clock = FakeClock()
    cache = Cache(":memory:", clock=clock)
    cache.set("k", "v", ttl_s=60)

    clock.now += 59
    assert cache.get("k") == "v"
    clock.now += 1
    assert cache.get("k") is None


def test_chave_ausente_e_sobrescrita() -> None:
    cache = Cache(":memory:")
    assert cache.get("nada") is None
    cache.set("k", 1, ttl_s=60)
    cache.set("k", 2, ttl_s=60)
    assert cache.get("k") == 2


def test_cria_a_pasta_do_arquivo(tmp_path) -> None:
    cache = Cache(tmp_path / "sub" / "cache.sqlite3")
    cache.set("k", True, ttl_s=60)
    assert cache.get("k") is True
    cache.close()
