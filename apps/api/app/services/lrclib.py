from dataclasses import dataclass
from difflib import SequenceMatcher
from typing import Any
from urllib.parse import urlencode

import httpx

from app.errors import ApiError
from app.services.cache import DAY, Cache

FOUND_TTL_S = 30 * DAY
# O LRCLIB busca letras ausentes em segundo plano; "não achei" expira rápido.
NOT_FOUND_TTL_S = 60 * 60
DURATION_TOLERANCE_S = 2


@dataclass(frozen=True)
class LrclibRecord:
    id: int
    track: str
    artist: str
    album: str | None
    duration_s: float
    instrumental: bool
    plain: str | None
    synced: str | None

    @property
    def has_lyrics(self) -> bool:
        return not self.instrumental and bool(self.synced or self.plain)


def _record(data: dict[str, Any]) -> LrclibRecord:
    return LrclibRecord(
        id=int(data["id"]),
        track=data.get("trackName") or data.get("name") or "",
        artist=data.get("artistName") or "",
        album=data.get("albumName"),
        duration_s=float(data.get("duration") or 0),
        instrumental=bool(data.get("instrumental")),
        plain=data.get("plainLyrics"),
        synced=data.get("syncedLyrics"),
    )


class Lrclib:
    """Cliente do LRCLIB (https://lrclib.net/docs) com cache e erros no formato da API."""

    def __init__(self, http: httpx.AsyncClient, cache: Cache, base_url: str) -> None:
        self._http = http
        self._cache = cache
        self._base = base_url.rstrip("/")

    async def _get(self, path: str, params: dict[str, str] | None = None) -> Any:
        params = {k: v for k, v in (params or {}).items() if v}
        key = f"lrclib:{path}?{urlencode(sorted(params.items()))}"
        if (cached := self._cache.get(key)) is not None:
            return cached.get("data")

        try:
            response = await self._http.get(f"{self._base}{path}", params=params)
        except httpx.HTTPError as exc:
            raise ApiError(502, "UPSTREAM_ERROR", "Não foi possível falar com o LRCLIB.") from exc

        if response.status_code in (429, 503):
            retry_after = response.headers.get("retry-after", "5")
            raise ApiError(
                503,
                "UPSTREAM_BUSY",
                f"O LRCLIB está ocupado. Tente de novo em {retry_after} s.",
                headers={"Retry-After": retry_after},
            )
        if response.status_code == 404:
            self._cache.set(key, {"data": None}, NOT_FOUND_TTL_S)
            return None
        # Parâmetros malformados voltam como texto puro: conferir antes de ler JSON.
        is_json = "json" in response.headers.get("content-type", "")
        if response.status_code != 200 or not is_json:
            raise ApiError(502, "UPSTREAM_ERROR", "O LRCLIB respondeu com erro.")

        data = response.json()
        self._cache.set(key, {"data": data}, FOUND_TTL_S if data else NOT_FOUND_TTL_S)
        return data

    async def search(self, **params: str) -> list[LrclibRecord]:
        return [_record(item) for item in await self._get("/api/search", params) or []]

    async def get(self, lrclib_id: int) -> LrclibRecord | None:
        data = await self._get(f"/api/get/{lrclib_id}")
        return _record(data) if data else None


def _similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, a.casefold(), b.casefold()).ratio()


def rank(
    records: list[LrclibRecord],
    artist: str = "",
    track: str = "",
    duration_s: float | None = None,
) -> list[LrclibRecord]:
    """Só os que têm letra; sincronizados primeiro, depois semelhança com o palpite e duração."""

    def score(record: LrclibRecord) -> float:
        value = 2.0 if record.synced else 0.0
        if artist:
            value += _similarity(record.artist, artist)
        if track:
            value += _similarity(record.track, track)
        if duration_s and abs(record.duration_s - duration_s) <= DURATION_TOLERANCE_S:
            value += 3.0
        return value

    return sorted((r for r in records if r.has_lyrics), key=score, reverse=True)
