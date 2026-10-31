import re
from dataclasses import dataclass

# [mm:ss], [mm:ss.x], [mm:ss.xx], [mm:ss.xxx] (também com ":" antes da fração).
TIMESTAMP = re.compile(r"\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]")
LAST_LINE_MS = 5000


@dataclass(frozen=True)
class LyricLine:
    start_ms: int
    end_ms: int
    text: str


def _to_ms(minutes: str, seconds: str, fraction: str | None) -> int:
    ms = (int(minutes) * 60 + int(seconds)) * 1000
    if fraction:
        ms += int(fraction.ljust(3, "0")[:3])
    return ms


def parse_lrc(lrc: str, duration_ms: int | None = None) -> list[LyricLine]:
    """
    LRC sincronizado por linha → versos com início e fim.
    Tags de metadados ([ar:], [ti:]…) são ignoradas. Linhas vazias são intervalos instrumentais:
    não viram verso, mas encerram o verso anterior. O último verso vai até `duration_ms`.
    """
    entries: list[tuple[int, str]] = []
    for raw in lrc.splitlines():
        stamps = []
        rest = raw.strip()
        while match := TIMESTAMP.match(rest):
            stamps.append(_to_ms(*match.groups()))
            rest = rest[match.end() :]
        entries.extend((start, rest.strip()) for start in stamps)

    entries.sort(key=lambda entry: entry[0])
    lines = []
    for i, (start, text) in enumerate(entries):
        if not text:
            continue
        if i + 1 < len(entries):
            end = entries[i + 1][0]
        elif duration_ms and duration_ms > start:
            end = duration_ms
        else:
            end = start + LAST_LINE_MS
        lines.append(LyricLine(start, max(end, start + 1), text))
    return lines


def estimate_lines(plain: str, duration_ms: int) -> list[LyricLine]:
    """Letra sem tempo → versos distribuídos por igual na duração (sincronia "estimada")."""
    texts = [line.strip() for line in plain.splitlines() if line.strip()]
    if not texts:
        return []
    step = duration_ms / len(texts)
    return [LyricLine(round(i * step), round((i + 1) * step), text) for i, text in enumerate(texts)]
