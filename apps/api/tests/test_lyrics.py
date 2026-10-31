import httpx
import respx

from tests.conftest import FIXTURES

SEARCH = "https://lrclib.net/api/search"
LRC = (FIXTURES / "paper-moon-radio.lrc").read_text(encoding="utf-8")
PLAIN = "I left the window open for the rain\nCounting cars that never come my way"


def record(id_: int, **overrides) -> dict:
    """Registro no formato do LRCLIB, com a letra inventada da fixture."""
    return {
        "id": id_,
        "trackName": "Paper Moon Radio",
        "artistName": "The Quiet Arcade",
        "albumName": "Fixtures",
        "duration": 221.0,
        "instrumental": False,
        "plainLyrics": PLAIN,
        "syncedLyrics": LRC,
        **overrides,
    }


def search_by(responses: dict[str, list[dict]]):
    """Responde ao /api/search conforme o parâmetro usado (track_name ou q)."""

    def handler(request: httpx.Request) -> httpx.Response:
        params = request.url.params
        key = "q" if "q" in params else "track_name"
        return httpx.Response(200, json=responses.get(key, []))

    return handler


@respx.mock
def test_devolve_a_melhor_versao_sincronizada(client) -> None:
    route = respx.get(SEARCH).mock(
        side_effect=search_by(
            {
                "track_name": [
                    record(1, syncedLyrics=None),
                    record(2),
                    record(3, artistName="Outra Banda"),
                    record(4, instrumental=True, plainLyrics=None, syncedLyrics=None),
                ]
            }
        )
    )

    response = client.get(
        "/api/lyrics", params={"artist": "The Quiet Arcade", "track": "Paper Moon Radio"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["lrclibId"] == 2
    assert body["synced"] == "line"
    assert body["lang"] == "en"
    assert body["lines"][0] == {
        "index": 0,
        "startMs": 12340,
        "endMs": 15800,
        "text": "I left the window open for the rain",
    }
    assert [c["lrclibId"] for c in body["candidates"]] == [3, 1]  # instrumental fica de fora
    assert route.calls.last.request.url.params["artist_name"] == "The Quiet Arcade"


@respx.mock
def test_a_duracao_desempata(client) -> None:
    respx.get(SEARCH).mock(
        side_effect=search_by(
            {"track_name": [record(1, duration=180.0), record(2, duration=221.0)]}
        )
    )
    body = client.get(
        "/api/lyrics", params={"artist": "x", "track": "Paper Moon Radio", "duration": 222}
    ).json()
    assert body["lrclibId"] == 2


@respx.mock
def test_sem_resultado_tenta_busca_livre(client) -> None:
    respx.get(SEARCH).mock(side_effect=search_by({"q": [record(9)]}))
    body = client.get(
        "/api/lyrics", params={"artist": "Quiet Arcade", "track": "Paper Moon"}
    ).json()
    assert body["lrclibId"] == 9


@respx.mock
def test_so_letra_simples_vira_sincronia_estimada(client) -> None:
    respx.get(SEARCH).mock(
        side_effect=search_by({"track_name": [record(5, syncedLyrics=None, duration=10.0)]})
    )
    body = client.get("/api/lyrics", params={"track": "Paper Moon Radio"}).json()
    assert body["synced"] == "estimated"
    assert [(line["startMs"], line["endMs"]) for line in body["lines"]] == [
        (0, 5000),
        (5000, 10000),
    ]


@respx.mock
def test_nada_encontrado(client) -> None:
    respx.get(SEARCH).mock(return_value=httpx.Response(200, json=[]))
    response = client.get("/api/lyrics", params={"track": "Inexistente"})
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "LYRICS_NOT_FOUND"


@respx.mock
def test_lrclib_ocupado_repassa_retry_after(client) -> None:
    respx.get(SEARCH).mock(return_value=httpx.Response(429, headers={"Retry-After": "7"}))
    response = client.get("/api/lyrics", params={"track": "x"})
    assert response.status_code == 503
    assert response.headers["retry-after"] == "7"
    assert response.json()["error"]["code"] == "UPSTREAM_BUSY"


@respx.mock
def test_resposta_em_texto_puro_vira_erro_de_upstream(client) -> None:
    respx.get(SEARCH).mock(return_value=httpx.Response(400, text="Failed to deserialize"))
    response = client.get("/api/lyrics", params={"track": "x"})
    assert response.status_code == 502
    assert response.json()["error"]["code"] == "UPSTREAM_ERROR"


@respx.mock
def test_busca_repetida_usa_o_cache(client) -> None:
    route = respx.get(SEARCH).mock(side_effect=search_by({"track_name": [record(2)]}))
    for _ in range(3):
        client.get("/api/lyrics", params={"track": "Paper Moon Radio"})
    assert route.call_count == 1


@respx.mock
def test_candidatos_por_busca_livre(client) -> None:
    respx.get(SEARCH).mock(
        side_effect=search_by({"q": [record(1, syncedLyrics=None), record(2), record(3)]})
    )
    body = client.get("/api/lyrics/candidates", params={"q": "paper moon"}).json()
    assert [c["lrclibId"] for c in body][0] in (2, 3)  # sincronizadas primeiro
    assert body[-1] == {
        "lrclibId": 1,
        "artist": "The Quiet Arcade",
        "track": "Paper Moon Radio",
        "album": "Fixtures",
        "durationSec": 221.0,
        "synced": False,
    }


@respx.mock
def test_letra_por_id(client) -> None:
    respx.get("https://lrclib.net/api/get/2").mock(return_value=httpx.Response(200, json=record(2)))
    respx.get("https://lrclib.net/api/get/404").mock(
        return_value=httpx.Response(404, json={"name": "TrackNotFound"})
    )

    ok = client.get("/api/lyrics/2")
    assert ok.status_code == 200
    assert ok.json()["lrclibId"] == 2
    assert ok.json()["candidates"] == []

    missing = client.get("/api/lyrics/404")
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == "LYRICS_NOT_FOUND"


@respx.mock
def test_detecta_japones(client) -> None:
    respx.get(SEARCH).mock(
        side_effect=search_by({"track_name": [record(7, syncedLyrics="[00:01.00]こだま")]})
    )
    assert client.get("/api/lyrics", params={"track": "x"}).json()["lang"] == "ja"
