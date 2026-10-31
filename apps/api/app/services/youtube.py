import re
from urllib.parse import parse_qs, urlparse

import httpx

from app.errors import ApiError
from app.services.cache import DAY, Cache

VIDEO_ID = re.compile(r"^[A-Za-z0-9_-]{11}$")
HOSTS = {"youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"}
PATH_PREFIXES = ("/shorts/", "/embed/", "/live/", "/v/")
OEMBED_URL = "https://www.youtube.com/oembed"


def parse_video_id(url: str) -> str | None:
    """Extrai o videoId de links do YouTube (watch, youtu.be, shorts, embed, live, music)."""
    url = url.strip()
    if not re.match(r"^[a-z]+://", url, re.IGNORECASE):
        url = "https://" + url
    parsed = urlparse(url)
    host = (parsed.hostname or "").lower()

    candidate: str | None = None
    if host == "youtu.be":
        candidate = parsed.path.lstrip("/").split("/")[0]
    elif host in HOSTS:
        if parsed.path == "/watch":
            candidate = parse_qs(parsed.query).get("v", [None])[0]
        else:
            for prefix in PATH_PREFIXES:
                if parsed.path.startswith(prefix):
                    candidate = parsed.path[len(prefix) :].split("/")[0]
                    break

    return candidate if candidate and VIDEO_ID.match(candidate) else None


def watch_url(video_id: str) -> str:
    return f"https://www.youtube.com/watch?v={video_id}"


async def fetch_oembed(http: httpx.AsyncClient, cache: Cache, video_id: str) -> dict:
    """Título e autor via oEmbed (sem chave). Vídeo privado/removido → VIDEO_UNAVAILABLE."""
    key = f"oembed:{video_id}"
    if (cached := cache.get(key)) is not None:
        return cached

    try:
        response = await http.get(OEMBED_URL, params={"url": watch_url(video_id), "format": "json"})
    except httpx.HTTPError as exc:
        raise ApiError(502, "UPSTREAM_ERROR", "Não foi possível falar com o YouTube.") from exc
    if response.status_code in (400, 401, 403, 404):
        raise ApiError(404, "VIDEO_UNAVAILABLE", "Vídeo indisponível, privado ou sem incorporação.")
    if response.status_code != 200:
        raise ApiError(502, "UPSTREAM_ERROR", "O YouTube respondeu com erro.")

    data = response.json()
    result = {"title": data.get("title", ""), "author": data.get("author_name", "")}
    cache.set(key, result, ttl_s=30 * DAY)
    return result
