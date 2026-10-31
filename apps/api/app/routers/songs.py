from fastapi import APIRouter, Query

from app.deps import CacheDep, Http
from app.errors import ApiError
from app.schemas.songs import Guess, ResolveResponse
from app.services.title_guess import guess_artist_track
from app.services.youtube import fetch_oembed, parse_video_id

router = APIRouter(prefix="/songs", tags=["songs"])


@router.get("/resolve", response_model_by_alias=True)
async def resolve(http: Http, cache: CacheDep, url: str = Query(min_length=1)) -> ResolveResponse:
    video_id = parse_video_id(url)
    if video_id is None:
        raise ApiError(400, "INVALID_URL", "Esse link não parece ser de um vídeo do YouTube.")

    oembed = await fetch_oembed(http, cache, video_id)
    return ResolveResponse(
        video_id=video_id,
        title=oembed["title"],
        author=oembed["author"],
        guess=Guess(**guess_artist_track(oembed["title"], oembed["author"])),
    )
