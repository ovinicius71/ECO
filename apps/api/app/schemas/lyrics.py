from typing import Literal

from app.schemas.common import CamelModel


class Line(CamelModel):
    index: int
    start_ms: int
    end_ms: int
    text: str


class Candidate(CamelModel):
    lrclib_id: int
    artist: str
    track: str
    album: str | None
    duration_sec: float
    synced: bool


class LyricsResponse(CamelModel):
    source: Literal["lrclib"] = "lrclib"
    lrclib_id: int
    artist: str
    track: str
    duration_sec: float
    synced: Literal["line", "word", "estimated"]
    lang: Literal["en", "ja"]
    lines: list[Line]
    candidates: list[Candidate]
