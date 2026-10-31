# 0006 — Fontes próprias e vitrine de componentes (geral)

Data: 2026-10-31 · Parte 01 · Branch `feat/01-design-system` · Técnico: [0006](../tecnico/0006-fontes-e-vitrine.md)

## Em uma frase
As fontes do design agora vêm junto com o site, sem chamar o Google, e existe uma página `/dev/ui` para ver todos os componentes.

## O que mudou
- Jost, IBM Plex Mono e Noto Sans JP passaram a ser servidas pelo próprio site. Isso funciona offline e o navegador não avisa o Google a cada abertura.
- Um teste automático garante que a cópia dos tokens no site continua idêntica a `design/tokens.css`.
- O site ganhou rotas: `/` é a Home (ainda "em construção") e `/dev/ui` é a vitrine de componentes. A vitrine só existe no modo de desenvolvimento e não vai para a versão publicada.

## Por que
- Foi a sua escolha no brainstorm: o site é local e sem login.
- A vitrine permite revisar o visual de cada peça antes de montar as telas.

## O que dá para ver ou testar agora
- `npm run dev:web` e depois abrir http://localhost:5173/dev/ui.

## Próximo passo
- Os componentes base (registro 0007).
