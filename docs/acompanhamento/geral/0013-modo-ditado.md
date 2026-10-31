# 0013 — Modo Ditado (geral)

Data: 2026-10-31 · Parte 05 · Branch `feat/05-modo-ditado` · Técnico: [0013](../tecnico/0013-modo-ditado.md)

## Em uma frase
O primeiro modo de prática está pronto: você ouve um verso, o vídeo pausa no fim dele, você digita o que ouviu e o Eco corrige palavra por palavra.

## O que mudou
- O **Começar** da tela da música abre o Ditado com os ajustes escolhidos (pausa automática, velocidade, correção).
- **Por verso:**
  - "Ouvir de novo" (contado);
  - "Mais devagar" (0,75×);
  - "Dica" (1ª letra de cada palavra);
  - "Pular";
  - Enter confirma e Enter de novo segue.
- **Correção na hora:**
  - palavra certa normal;
  - "quase" com sublinhado tracejado;
  - errada com sublinhado vermelho e o que você digitou riscado embaixo;
  - faltando com "—".
  - Também aparece a nota do verso.
- Tolerante/estrita dá para trocar no meio, e as notas são recalculadas.
- **Versos anteriores** com a nota de cada um, e o painel SESSÃO com palavras certas, repetições e dicas.
- **Resumo no fim da música:** precisão, contagens e as ações Repetir / Outro modo / Nova música. Ainda não salva (Parte 10, como você decidiu).
- A "forma de onda" é decorativa e mostra quanto do verso já tocou, porque o YouTube não dá acesso ao áudio (sua escolha).

## Uma mudança importante: o vídeo fica sempre visível
- O design escondia o vídeo com uma capa "VÍDEO OCULTO". Conferi as regras atuais do YouTube: elas **proíbem colocar qualquer coisa na frente do player** e tocar com ele escondido.
- Você escolheu deixar o vídeo sempre visível. Ficou registrado no **ADR 0002**, que vale para todos os modos.
- No lugar da capa entra um aviso: clipes com legenda embutida podem mostrar a letra.

## O que dá para ver ou testar agora
- `npm run dev:api` + `npm run dev:web`. Abra uma música, deixe "Ditado" selecionado e clique em **Começar**.
- Testei com um vídeo real: o verso toca e pausa no fim, a correção aparece, o Enter segue para o verso 2, o Tab repete o verso e nada quebra em 390px.

## Próximo passo
- Parte 10: salvar as sessões e criar a tela Resultado e o STATUS da Home. Isso fecha a primeira versão usável.
