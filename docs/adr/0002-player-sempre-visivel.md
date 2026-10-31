# ADR 0002 — Player do YouTube sempre visível

Status: **aceita** pelo dono no brainstorm da Parte 05 (pergunta 1), em 2026-10-31.

## Contexto
- O design (`artboards/Ditado.dc.html`) e a spec (`produto.md`, Ditado) pediam o vídeo **oculto por padrão** no Ditado, com uma capa "VÍDEO OCULTO" sobre o player, para as legendas embutidas em alguns clipes não entregarem a resposta.
- As regras do YouTube, conferidas em 2026-10-31, dizem o contrário:
  - *Required Minimum Functionality → Overlays and frames:* "You must not display overlays, frames, or other visual elements in front of any part of a YouTube embedded player, including player controls. Similarly, you must not use overlays, frames or other visual elements to obscure any part of an embedded player, including player controls."
  - *Developer Policies III.I.9:* proíbe "a background player, meaning a player that is not displayed in the page, tab, or screen that the user is viewing".
  - *Tamanho mínimo:* "Embedded players must have a viewport that is at least 200px by 200px."
- O CLAUDE.md (§8) já restringe o uso do YouTube à IFrame API e ao oEmbed, respeitando os Termos de Uso.

## Decisão
Em **todas as telas** do Eco, o player do YouTube fica **visível e descoberto**, com viewport de no mínimo 200×200 px:
- nada de capa, overlay, `opacity`, `display:none`, filtro de desfoque ou player fora da tela enquanto toca;
- elementos do Eco podem ficar **ao lado** do player, nunca **na frente**;
- só usamos parâmetros documentados da IFrame API (ex.: `controls`, `disablekb`, `rel`, `playsinline`);
- o placeholder hachurado do `VideoFrame` só aparece **antes** de o player carregar ou em caso de erro, nunca sobre um vídeo tocando.

No Ditado, no lugar da capa, um aviso discreto diz que clipes com legenda embutida podem mostrar a letra e sugere escolher outro vídeo da mesma música (áudio oficial, "lyric-less").

## Consequências
- Desvio aprovado do design do Ditado, registrado em `design/README.md` e na spec.
- Os modos futuros (Karaokê, Múltipla escolha…) seguem a mesma regra.
- O usuário pode ver a letra em clipes com legenda embutida. A mitigação é o aviso e a escolha do vídeo.
