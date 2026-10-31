import re

# Trechos entre ( ) ou [ ] que não fazem parte do nome da música.
NOISE = re.compile(
    r"\s*[\(\[][^\)\]]*\b("
    r"official|video|vídeo|clipe|lyrics?|letra|legendado|audio|áudio|visuali[sz]er|"
    r"live|ao vivo|hd|hq|4k|remaster(ed)?|mv|m/v|ft\.?|feat\.?"
    r")\b[^\)\]]*[\)\]]",
    re.IGNORECASE,
)
FEATURING = re.compile(r"\s+(ft\.?|feat\.?|featuring)\s+.*$", re.IGNORECASE)
SEPARATOR = re.compile(r"\s+[-–—|]\s+")
AUTHOR_SUFFIX = re.compile(r"(\s*-\s*topic|vevo|\s*official)$", re.IGNORECASE)


def _clean(text: str) -> str:
    text = NOISE.sub("", text)
    text = FEATURING.sub("", text)
    return re.sub(r"\s{2,}", " ", text).strip(" -–—|\"'")


def guess_artist_track(title: str, author: str) -> dict[str, str]:
    """Palpite de artista/música a partir do título do vídeo e do canal."""
    parts = SEPARATOR.split(title, maxsplit=1)
    if len(parts) == 2:
        artist, track = parts
    else:
        artist, track = AUTHOR_SUFFIX.sub("", author), title
    return {"artist": _clean(artist), "track": _clean(track)}
