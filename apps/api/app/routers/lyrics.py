import re
from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.config import Settings, get_settings
from app.deps import CacheDep, Http
from app.errors import ApiError
from app.schemas.lyrics import Candidate, Line, LyricsResponse
from app.services.lrc import estimate_lines, parse_lrc
from app.services.lrclib import Lrclib, LrclibRecord, rank

router = APIRouter(prefix="/lyrics", tags=["lyrics"])

MAX_CANDIDATES = 10
# Kana ou kanji → japonês. Heurística simples, revista na Parte 14.
JAPANESE = re.compile(r"[぀-ヿ一-鿿]")


def get_lrclib(http: Http, cache: CacheDep, settings: Annotated[Settings, Depends(get_settings)]):
    return Lrclib(http, cache, settings.lrclib_url)


LrclibDep = Annotated[Lrclib, Depends(get_lrclib)]


def not_found() -> ApiError:
    return ApiError(404, "LYRICS_NOT_FOUND", "Não encontramos a letra dessa música no LRCLIB.")


def to_candidate(record: LrclibRecord) -> Candidate:
    return Candidate(
        lrclib_id=record.id,
        artist=record.artist,
        track=record.track,
        album=record.album,
        duration_sec=record.duration_s,
        synced=bool(record.synced),
    )


def to_response(record: LrclibRecord, candidates: list[LrclibRecord]) -> LyricsResponse:
    duration_ms = round(record.duration_s * 1000)
    if record.synced:
        parsed, synced = parse_lrc(record.synced, duration_ms or None), "line"
    else:
        parsed, synced = estimate_lines(record.plain or "", duration_ms), "estimated"
    text = record.synced or record.plain or ""
    return LyricsResponse(
        lrclib_id=record.id,
        artist=record.artist,
        track=record.track,
        duration_sec=record.duration_s,
        synced=synced,
        lang="ja" if JAPANESE.search(text) else "en",
        lines=[
            Line(index=i, start_ms=line.start_ms, end_ms=line.end_ms, text=line.text)
            for i, line in enumerate(parsed)
        ],
        candidates=[to_candidate(c) for c in candidates[:MAX_CANDIDATES]],
    )


@router.get("", response_model_by_alias=True)
async def find_lyrics(
    lrclib: LrclibDep,
    artist: str = Query(""),
    track: str = Query(min_length=1),
    duration: float | None = Query(None, gt=0, le=3600),
) -> LyricsResponse:
    """Melhor letra para o palpite (sem duração no 1º acesso: o oEmbed não informa)."""
    ranked = rank(
        await lrclib.search(track_name=track, artist_name=artist), artist, track, duration
    )
    if not ranked:
        query = f"{artist} {track}".strip()
        ranked = rank(await lrclib.search(q=query), artist, track, duration)
    if not ranked:
        raise not_found()
    return to_response(ranked[0], ranked[1:])


@router.get("/candidates", response_model_by_alias=True)
async def candidates(lrclib: LrclibDep, q: str = Query(min_length=1)) -> list[Candidate]:
    """Versões para "Trocar versão da letra"."""
    return [to_candidate(r) for r in rank(await lrclib.search(q=q))][:20]


@router.get("/{lrclib_id}", response_model_by_alias=True)
async def lyrics_by_id(lrclib: LrclibDep, lrclib_id: int) -> LyricsResponse:
    record = await lrclib.get(lrclib_id)
    if record is None or not record.has_lyrics:
        raise not_found()
    return to_response(record, [])
