from app.schemas.common import CamelModel


class Guess(CamelModel):
    artist: str
    track: str


class ResolveResponse(CamelModel):
    video_id: str
    title: str
    author: str
    guess: Guess
