# Roadmap — entregas em partes

Este é o **status oficial** do projeto. O Claude Code atualiza este arquivo ao terminar uma parte e ao mergear.

**Legenda:**
- ⬜ não iniciada
- 🔵 em andamento
- 🟡 pronta para push (aguardando o dono)
- 🟢 push feito, aguardando ok de merge
- ✅ mergeada
- ⏸️ pausada

| # | Branch | Entrega | Depende de | Status |
| --- | --- | --- | --- | --- |
| 00 | `chore/00-setup-monorepo` | Monorepo, web (Vite/React/TS), api (FastAPI/uv), lint, testes, scripts | — | ✅ |
| 01 | `feat/01-design-system` | Tokens, fontes e componentes base (Header, Button, Segmented, ListRow, StatusPanel, Gauge, KeyHint) com página `/dev/ui` | 00 | ✅ |
| 02 | `feat/02-busca-letra` | API: resolve link do YouTube (oEmbed) e busca no LRCLIB com parser de LRC. Web: Home e tela Configurar música com dados reais | 00, 01 | ✅ |
| 03 | `feat/03-player-sincronia` | Wrapper da IFrame API: verso atual pelo tempo, offset, velocidade, loop do verso, pausa no fim do verso | 02 | 🔵 |
| 04 | `feat/04-motor-correcao` | Motor de correção (tolerante/estrita, alinhamento, quase/erro) com testes (lógica pura) | 00 | ✅ |
| 05 | `feat/05-modo-ditado` | Modo Ditado completo: tela, fluxo por verso e resultado parcial | 03, 04 | ⬜ |
| 06 | `feat/06-modo-digitar-junto` | Modo Digitar Junto: digitação caractere a caractere sincronizada | 03, 04 | ⬜ |
| 07 | `feat/07-modo-preencher` | Lacunas por nível CEFR e densidade, e o modo Preencher | 03, 04 | ⬜ |
| 08 | `feat/08-modo-assistir` | Modo Assistir, tradução por linha e popover de palavra (dicionário) | 03 | ⬜ |
| 09 | `feat/09-vocabulario-srs` | Salvar palavras, tela Vocabulário, revisão Leitner (5 caixas), exportar para Anki | 08 | ⬜ |
| 10 | `feat/10-resultado-progresso` | Persistir sessões, tela Resultado, status da Home (streak, meta, recentes) | 05 | ⬜ |
| 11 | `feat/11-modo-multipla-escolha` | Distratores fonéticos (CMUdict) e o modo Múltipla escolha | 04, 07 | ⬜ |
| 12 | `feat/12-modo-karaoke` | Reconhecimento de fala no navegador, nota por palavra e o modo Karaokê | 03 | ⬜ |
| 13 | `feat/13-whisper-local` | Transcrição local com timestamps, como alternativa quando não há letra | 02 | ⬜ |
| 14 | `feat/14-japones` | Suporte a japonês (romaji/kana/furigana) — **futuro, precisa de brainstorm próprio** | 04–08 | ⏸️ |

## Ordem sugerida

00 → 01 → 04 (em paralelo com 02) → 02 → 03 → 05 → 10 → 06 → 07 → 08 → 09 → 11 → 12 → 13

A primeira versão usável chega com **00–05 + 10**: colar link, praticar Ditado e ver o resultado.

## Partes paralelizáveis

- A **04** (lógica pura) pode andar junto com a **01–03**.
- A **08** e a **12** só dependem do player (**03**).
