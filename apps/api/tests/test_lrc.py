from app.services.lrc import LyricLine, estimate_lines, parse_lrc
from tests.conftest import FIXTURES


def test_fixture_paper_moon_radio() -> None:
    lines = parse_lrc((FIXTURES / "paper-moon-radio.lrc").read_text(encoding="utf-8"), 221_000)

    assert [line.text for line in lines] == [
        "I left the window open for the rain",
        "Counting cars that never come my way",
        "Your voice still echoes down the hall",
        "Like a radio that plays it all",
        "Hold on, the night is almost gone",
        "We'll be dancing when the lights come on",
        "So call my name across the static sea",
        "I'll be the echo, you'll come back to me",
        "Echo, echo, coming back to me",
        "Echo, echo, coming back to me",
    ]
    assert lines[0] == LyricLine(12_340, 15_800, "I left the window open for the rain")


def test_linha_vazia_encerra_o_verso_anterior() -> None:
    lines = parse_lrc((FIXTURES / "paper-moon-radio.lrc").read_text(encoding="utf-8"), 221_000)
    radio = next(line for line in lines if line.text.startswith("Like a radio"))
    hold_on = next(line for line in lines if line.text.startswith("Hold on"))

    assert radio.end_ms == 26_100  # início do intervalo instrumental
    assert hold_on.start_ms == 31_550


def test_varios_timestamps_duplicam_e_ordenam() -> None:
    lines = parse_lrc((FIXTURES / "paper-moon-radio.lrc").read_text(encoding="utf-8"), 221_000)
    chorus = [line for line in lines if line.text.startswith("Echo, echo")]

    assert [(c.start_ms, c.end_ms) for c in chorus] == [(46_000, 112_400), (112_400, 221_000)]


def test_formatos_de_fracao() -> None:
    lrc = "[00:01]a\n[00:02.5]b\n[00:03.25]c\n[00:04.125]d\n[01:05:50]e"
    assert [line.start_ms for line in parse_lrc(lrc)] == [1000, 2500, 3250, 4125, 65_500]


def test_ultimo_verso_sem_duracao_dura_5s() -> None:
    assert parse_lrc("[00:10.00]só um verso") == [LyricLine(10_000, 15_000, "só um verso")]


def test_ignora_metadados_e_linhas_sem_tempo() -> None:
    lrc = "[ar:Alguém]\n[offset:+100]\nsem tempo\n[00:01.00]verso"
    assert [line.text for line in parse_lrc(lrc)] == ["verso"]


def test_estimativa_distribui_por_igual() -> None:
    lines = estimate_lines("um\n\ndois\ntrês\n", 9_000)
    assert lines == [
        LyricLine(0, 3_000, "um"),
        LyricLine(3_000, 6_000, "dois"),
        LyricLine(6_000, 9_000, "três"),
    ]
    assert estimate_lines("   \n", 9_000) == []
