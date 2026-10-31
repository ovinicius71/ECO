# Mapa de telas

| Artboard | Rota | Página (`apps/web/src/pages/`) | Parte |
| --- | --- | --- | --- |
| `Main.dc.html` | `/` | `Home/` | 02 (busca), 10 (status/recentes) |
| `Setup.dc.html` | `/musica/:videoId` | `SongSetup/` | 02, 03 (offset) |
| `DigitarJunto.dc.html` | `/praticar/:videoId/digitar` | `practice/TypeAlong/` | 06 |
| `Preencher.dc.html` | `/praticar/:videoId/preencher` | `practice/FillBlanks/` | 07 |
| `Ditado.dc.html` | `/praticar/:videoId/ditado` | `practice/Dictation/` | 05 |
| `MultiplaEscolha.dc.html` | `/praticar/:videoId/escolha` | `practice/MultipleChoice/` | 11 |
| `Karaoke.dc.html` | `/praticar/:videoId/karaoke` | `practice/Karaoke/` | 12 |
| `Assistir.dc.html` | `/praticar/:videoId/assistir` | `practice/Watch/` | 08 |
| `Resultado.dc.html` | `/resultado/:sessionId` | `Result/` | 10 |
| `Vocabulario.dc.html` | `/vocabulario` | `Vocabulary/` | 09 |
| — (sem design) | `/progresso`, `/ajustes` | `Progress/`, `Settings/` | propor no brainstorm |

## Componentes base (Parte 01)

| Componente | Onde aparece | Notas |
| --- | --- | --- |
| `AppHeader` | Home, Setup, Resultado, Vocabulário | Logo ECO + エコ, nav em caixa alta com o item ativo invertido, chip de streak |
| `PracticeHeader` | todos os modos | ← SAIR, título/artista, rótulo do modo invertido, progresso + gauge, métrica |
| `PlayerBar` | Digitar, Preencher, Assistir | Play redondo, linha do tempo com losango, tempo, ↺ Verso, velocidade, tradução |
| `KeyHintBar` | todas | Lista de `{keys, label}` |
| `Button` | todas | `primary` (barra), `outline` (borda forte), `ghost`; mínimo de 44px |
| `Segmented` | Setup, Ditado, Preencher | Opções com a selecionada invertida |
| `ListRow` / `SelectList` | Home, Setup, Vocabulário, Múltipla escolha | Linha com a selecionada invertida; navegação com ↑↓ |
| `CategoryTabs` | Home, Vocabulário | Abas grandes; as inativas em `ink-3` |
| `StatusPanel` + `StatusRow` | Home, Setup, Vocabulário, modos | Título com borda forte, linhas chave/valor (valor em mono) |
| `Gauge` | Home, cabeçalhos | Pílula com borda e preenchimento |
| `BoxMeter` | Vocabulário, Home (semana) | Quadrados cheios ou vazios |
| `VideoFrame` | Setup, modos | Wrapper da IFrame; placeholder hachurado enquanto carrega |
| `LyricLine` | modos | Variantes: `past`, `current`, `future`; tokens com status |
| `WordToken` | Ditado, Preencher, Resultado | Estados `ok`, `near` (tracejado), `wrong` (riscado + correção), `blank`, `active` |
| `WordPanel` | Assistir, Vocabulário | Palavra, nível, IPA, ouvir, significado, nota, salvar |
| `Waveform` | Ditado | Barras com a parte tocada em tinta |
| `Chip` | Home | Pílula com borda (sólida ou tracejada) |
