# Entrega — Parte 03: Player e sincronia

Branch: `feat/03-player-sincronia` · Base: `main`
Status: ✅ mergeada na `main` (`2273af9`, 2026-10-31)

## O que foi entregue
- **Núcleo do player** (`features/player`):
  - sincronia pura: verso atual, offset, loop e pausa no fim do verso;
  - adaptador da IFrame API (`youtube-nocookie`, erros em pt-BR);
  - engine com Zustand: velocidade, ↺ Verso, seek;
  - atalhos da prática (`Ctrl+Espaço`, `Ctrl+↓/↑`, `Tab`);
  - offset salvo por música no Dexie.
- **Componentes:** `PlayerBar` (o design do DigitarJunto, com a linha do tempo e o losango ◆), `VideoFrame` e `Stepper`.
- **Tela Configurar música:**
  - vídeo real, prévia "AGORA" do verso e "AJUSTE DE SINCRONIA" salvo por música;
  - aviso quando a duração da letra difere do vídeo, com a sugestão da versão compatível.
- **Bancada de dev** `/dev/player/:videoId` com tudo ligado.

## Como testar
1. `npm run setup` (há uma dependência nova, o `zustand`) e depois `npm run check`.
2. `npm run dev:api` e `npm run dev:web`. Abra uma música pela Home.
3. No Setup: dê play, veja o "AGORA" mudar, ajuste a sincronia e recarregue (o ajuste continua).
4. Em `/dev/player/<id>`: PlayerBar, "Repetir verso", "Pausar no fim", velocidade, ↺ Verso, `Ctrl+Espaço`, `Ctrl+↓/↑`.

## Testes automatizados
- `npm run test` (web): 155 passando (54 novos).
- `pytest` (api): 56 passando, sem mudanças.
- Verificação manual no navegador (Playwright, vídeo público): verso, loop, pausa, persistência do offset e layout em 1440/390 px.

## Commits
- `298444f docs(brainstorm): parte 03 — player-sincronia`
- `5bd6ddd docs(brainstorm): decisões da parte 03`
- `512427e feat(player): funções puras de sincronia (verso atual, offset, loop e pausa no fim)`
- `bb3d36f feat(player): PlayerController, adaptador da IFrame API, engine com Zustand e atalhos da prática`
- `e64ee4e feat(player): PlayerBar, VideoFrame, Stepper, offset salvo por música e bancada /dev/player`
- `3ac696b feat(web): player, ajuste de sincronia e aviso de duração na tela Configurar música`
- `4b3dc47 docs(brainstorm): decisões de implementação da parte 03`
- `7e68602 docs(acompanhamento): 0011 e 0012 — player e sincronia`

## Decisões tomadas por padrão (não bloqueantes)
- NB1–NB11 do brainstorm:
  - `youtube-nocookie`;
  - `letra = vídeo + offset` ("+" adianta), passo de 0,1 s e ±10 s, debounce de 500 ms;
  - laço rAF com o relógio em passos de 250 ms;
  - busca binária com -1 nos intervalos (♪);
  - guarda por passagem;
  - `PlayerController` com fake nos testes;
  - store Zustand por player;
  - range acessível com setas de ±5 s;
  - sem autoplay;
  - sem atalhos novos no Setup;
  - ↺ Verso no último verso durante intervalos.
- Também decidido sem perguntar:
  - **Tab = repetir verso só no corpo da página ou num campo de digitação**, por acessibilidade;
  - controles nativos do YouTube no Setup (a PlayerBar é da prática);
  - borda tracejada neutra no aviso de duração (não é erro).

## Fora do escopo / pendências
- **Para a Parte 05:** a pausa no fim do verso chega algumas dezenas de ms depois da borda. O Ditado deve usar o verso-alvo, não o `lineIndex`.
- Tradução na PlayerBar → Parte 08.
- Favicon (404).

## Desvios do design
- A PlayerBar ainda não tem o botão "Tradução" (entra com a tradução, na Parte 08).
