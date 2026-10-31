import httpx
import pytest
import respx

from app.services.title_guess import guess_artist_track
from app.services.youtube import OEMBED_URL, parse_video_id

VID = "dQw4w9WgXcA"


@pytest.mark.parametrize(
    "url",
    [
        f"https://www.youtube.com/watch?v={VID}",
        f"https://youtube.com/watch?v={VID}&t=42s&list=PL123",
        f"youtube.com/watch?feature=share&v={VID}",
        f"https://m.youtube.com/watch?v={VID}",
        f"https://music.youtube.com/watch?v={VID}&si=abc",
        f"https://youtu.be/{VID}?t=10",
        f"https://www.youtube.com/shorts/{VID}",
        f"https://www.youtube.com/embed/{VID}",
        f"https://www.youtube.com/live/{VID}?feature=share",
        f"  https://www.youtube.com/watch?v={VID}  ",
    ],
)
def test_extrai_video_id(url: str) -> None:
    assert parse_video_id(url) == VID


@pytest.mark.parametrize(
    "url",
    [
        "",
        "não é um link",
        "https://vimeo.com/123456",
        "https://www.youtube.com/watch?v=curto",
        "https://www.youtube.com/channel/UC123",
        f"https://evil.example/watch?v={VID}",
    ],
)
def test_rejeita_links_invalidos(url: str) -> None:
    assert parse_video_id(url) is None


@pytest.mark.parametrize(
    ("title", "author", "artist", "track"),
    [
        (
            "Halcyon Wire - Northbound Lights",
            "HalcyonWireVEVO",
            "Halcyon Wire",
            "Northbound Lights",
        ),
        (
            "The Quiet Arcade - Paper Moon Radio (Official Video)",
            "The Quiet Arcade",
            "The Quiet Arcade",
            "Paper Moon Radio",
        ),
        ("Mira Vale – Glass Garden [Lyrics]", "Lyric Hub", "Mira Vale", "Glass Garden"),
        ("June Atlas — Slow Satellite (Live)", "June Atlas", "June Atlas", "Slow Satellite"),
        (
            "June Atlas - Slow Satellite ft. Mira Vale (Official Audio)",
            "June Atlas",
            "June Atlas",
            "Slow Satellite",
        ),
        (
            "The Lantern Club - Kitchen Floor Waltz (feat. Halcyon Wire) [4K]",
            "x",
            "The Lantern Club",
            "Kitchen Floor Waltz",
        ),
        (
            "Kitchen Floor Waltz",
            "The Lantern Club - Topic",
            "The Lantern Club",
            "Kitchen Floor Waltz",
        ),
        ("Glass Garden (Official Music Video)", "MiraValeVEVO", "MiraVale", "Glass Garden"),
        ('"Paper Moon Radio" - The Quiet Arcade', "x", "Paper Moon Radio", "The Quiet Arcade"),
        ("Halcyon Wire | Northbound Lights (Visualizer)", "x", "Halcyon Wire", "Northbound Lights"),
    ],
)
def test_palpite_de_artista_e_musica(title: str, author: str, artist: str, track: str) -> None:
    assert guess_artist_track(title, author) == {"artist": artist, "track": track}


@respx.mock
def test_resolve_devolve_video_e_palpite(client) -> None:
    route = respx.get(OEMBED_URL).mock(
        return_value=httpx.Response(
            200,
            json={
                "title": "The Quiet Arcade - Paper Moon Radio (Official Video)",
                "author_name": "TheQuietArcadeVEVO",
            },
        )
    )

    response = client.get("/api/songs/resolve", params={"url": f"https://youtu.be/{VID}"})

    assert response.status_code == 200
    assert response.json() == {
        "videoId": VID,
        "title": "The Quiet Arcade - Paper Moon Radio (Official Video)",
        "author": "TheQuietArcadeVEVO",
        "guess": {"artist": "The Quiet Arcade", "track": "Paper Moon Radio"},
    }
    assert route.calls.last.request.headers["user-agent"].startswith("Eco/")

    # A segunda chamada vem do cache.
    client.get("/api/songs/resolve", params={"url": f"https://youtu.be/{VID}"})
    assert route.call_count == 1


def test_resolve_link_invalido(client) -> None:
    response = client.get("/api/songs/resolve", params={"url": "https://vimeo.com/1"})
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_URL"


def test_resolve_sem_parametro_usa_o_formato_de_erro(client) -> None:
    response = client.get("/api/songs/resolve")
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "INVALID_REQUEST"


@respx.mock
def test_resolve_video_indisponivel(client) -> None:
    respx.get(OEMBED_URL).mock(return_value=httpx.Response(401))
    response = client.get("/api/songs/resolve", params={"url": f"https://youtu.be/{VID}"})
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "VIDEO_UNAVAILABLE"


@respx.mock
def test_resolve_youtube_fora_do_ar(client) -> None:
    respx.get(OEMBED_URL).mock(side_effect=httpx.ConnectError("offline"))
    response = client.get("/api/songs/resolve", params={"url": f"https://youtu.be/{VID}"})
    assert response.status_code == 502
    assert response.json()["error"]["code"] == "UPSTREAM_ERROR"
