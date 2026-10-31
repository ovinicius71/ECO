# Acompanhamento do desenvolvimento

Cada mudança lógica gera **dois registros** com o mesmo número:

- `tecnico/NNNN-slug.md`: os detalhes de engenharia (arquivos, dependências, comandos, decisões e riscos);
- `geral/NNNN-slug.md`: o resumo em linguagem simples (o que mudou, por que mudou e o que dá para ver agora).

O `docs/adr/` continua sendo só para as decisões de arquitetura. O status oficial das partes está em `docs/roadmap.md`.

## Linha do tempo

| # | Data | Parte | Mudança | Geral | Técnico |
| --- | --- | --- | --- | --- | --- |
| 0001 | 2026-10-31 | 00 | Início do repositório e regras de trabalho | [geral](geral/0001-inicio-do-repositorio.md) | [técnico](tecnico/0001-inicio-do-repositorio.md) |
| 0002 | 2026-10-31 | 00 | Esqueleto do site (apps/web) | [geral](geral/0002-scaffold-web.md) | [técnico](tecnico/0002-scaffold-web.md) |
| 0003 | 2026-10-31 | 00 | Esqueleto do servidor (apps/api) | [geral](geral/0003-scaffold-api.md) | [técnico](tecnico/0003-scaffold-api.md) |
| 0004 | 2026-10-31 | 00 | Atalhos na raiz e README | [geral](geral/0004-scripts-raiz.md) | [técnico](tecnico/0004-scripts-raiz.md) |
| 0005 | 2026-10-31 | 00 | Parte 00 na main e GitHub configurado | [geral](geral/0005-parte-00-na-main.md) | [técnico](tecnico/0005-parte-00-na-main.md) |
| 0006 | 2026-10-31 | 01 | Fontes próprias e vitrine /dev/ui | [geral](geral/0006-fontes-e-vitrine.md) | [técnico](tecnico/0006-fontes-e-vitrine.md) |
| 0007 | 2026-10-31 | 01 | Componentes base do visual | [geral](geral/0007-componentes-base.md) | [técnico](tecnico/0007-componentes-base.md) |
| 0008 | 2026-10-31 | 04 | Motor de correção | [geral](geral/0008-motor-correcao.md) | [técnico](tecnico/0008-motor-correcao.md) |
| 0009 | 2026-10-31 | 02 | Servidor busca o vídeo e a letra | [geral](geral/0009-api-busca-letra.md) | [técnico](tecnico/0009-api-busca-letra.md) |
| 0010 | 2026-10-31 | 02 | Home e tela Configurar música | [geral](geral/0010-telas-busca-letra.md) | [técnico](tecnico/0010-telas-busca-letra.md) |
| 0011 | 2026-10-31 | 03 | O player do Eco (sincronia, loop, pausa, velocidade) | [geral](geral/0011-nucleo-do-player.md) | [técnico](tecnico/0011-nucleo-do-player.md) |
| 0012 | 2026-10-31 | 03 | Vídeo e ajuste de sincronia na tela da música | [geral](geral/0012-player-no-setup.md) | [técnico](tecnico/0012-player-no-setup.md) |
| 0013 | 2026-10-31 | 05 | Modo Ditado (e player sempre visível, ADR 0002) | [geral](geral/0013-modo-ditado.md) | [técnico](tecnico/0013-modo-ditado.md) |
| 0014 | 2026-10-31 | 05 | Duas correções no player (buffering e tempo na pausa) | [geral](geral/0014-correcoes-do-player.md) | [técnico](tecnico/0014-correcoes-do-player.md) |

## Modelo — geral

```markdown
# NNNN — <título> (geral)

Data: AAAA-MM-DD · Parte NN · Branch `<branch>` · Técnico: [NNNN](../tecnico/NNNN-slug.md)

## Em uma frase
…

## O que mudou
- …

## Por que
- …

## O que dá para ver ou testar agora
- … (ou "nada visível ainda")

## Próximo passo
- …
```

## Modelo — técnico

```markdown
# NNNN — <título> (técnico)

Data: AAAA-MM-DD · Parte NN · Branch `<branch>` · Geral: [NNNN](../geral/NNNN-slug.md)
Commits: `abc1234`, …

## Mudanças
- arquivos e pastas criados ou alterados

## Dependências e versões
- pacote@versão — motivo (ou "nenhuma")

## Decisões técnicas
- decisão — alternativas descartadas e o motivo (cite brainstorm/ADR)

## Como verificar
- comandos

## Riscos e pendências
- …
```
