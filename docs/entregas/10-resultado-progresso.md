# Entrega — Parte 10: Resultado e progresso

Branch: `feat/10-resultado-progresso` · Base: `main`
Status: 🟡 pronta para push

## O que foi entregue
- **Primeira versão usável:** colar o link → Ditado → Resultado.
- **Sessões salvas** (Dexie v2: `sessions` e `activity`, com teste de migração). Só as concluídas são salvas. Sair no meio soma minutos ao dia.
- **Tela Resultado** (`/resultado/:sessionId`):
  - precisão, "Novo recorde" e sequência;
  - estatísticas;
  - barras por verso;
  - versos para rever, com nota e prática do verso;
  - ações: Praticar só os versos com erro / Repetir / Outro modo / Nova música.
- **Ditado:** salva e abre o Resultado; aceita `?versos=` (só alguns versos); mede o tempo ativo.
- **Home:** Biblioteca (Recentes/Favoritas) e STATUS (músicas praticadas, precisão média, meta de hoje, semana). Sequência no cabeçalho. Favoritar no Setup.
- Componentes `CategoryTabs` e `BoxMeter`.
- Ajuste no motor de correção: contração sem apóstrofo vale quase (`were` × `We're`), e uma contração não vira junção/separação.

## Como testar
1. `npm run check` na raiz.
2. `dev:api` + `dev:web`. Faça um Ditado completo, ou rápido com `/praticar/<id>/ditado?versos=1,2`. No fim, abre o Resultado.
3. No Resultado: "Praticar só os versos com erro" e o ↺ de cada verso.
4. Volte à Home: a Biblioteca, o STATUS e a semana. Marque uma música como favorita na tela dela e veja a aba Favoritas.

## Testes automatizados
- `npm run test` (web): 229 passando (40 novos).
- `pytest` (api): 56 passando, sem mudanças.
- No navegador (Playwright, vídeo público): Ditado com 2 versos → Resultado → Home, em 1440 e 390 px.

## Commits
- `eec1019 docs(brainstorm): parte 10 — resultado-progresso`
- `e8400e5 docs(brainstorm): decisões da parte 10`
- `da9cadd feat(progresso): schema v2 (sessions, activity) com teste de migração e repositórios`
- `6c56dba feat(progresso): regras puras (sequência, semana, precisão média, recorde, relógio, notas e Biblioteca)`
- `e45825e feat(ditado): salvar a sessão, medir o tempo ativo, abrir o Resultado e praticar só versos escolhidos`
- `b19e770 feat(progresso): tela Resultado com recorde, estatísticas, barras por verso e versos para rever`
- `9840f2d feat(design): CategoryTabs e BoxMeter`
- `c502e23 feat(progresso): Biblioteca e STATUS na Home, sequência no cabeçalho e favoritar no Setup`
- `3137c4c fix(correcao): contração expandida não conta como junção ou separação`. **Atenção:** entrou com 1 teste falhando; corrigido no commit seguinte.
- `e84c17c fix(correcao): contração digitada sem apóstrofo vale quase (were × We're)`
- `a9c28ae docs(spec): contração sem apóstrofo e junção dentro da mesma palavra`
- `7ad7373 docs(acompanhamento): 0015 e 0016 — resultado, progresso e ajuste na correção`

## Decisões tomadas por padrão (não bloqueantes)
- NB1–NB12 do brainstorm:
  - fim do Ditado → Resultado;
  - `?versos=`;
  - notas a partir das dicas do motor;
  - tempo ativo com corte de 2 min;
  - recorde só com sessão anterior;
  - schema v2;
  - STATUS sem nível/palavras;
  - Biblioteca com SelectList;
  - botão de favoritar no Setup;
  - chip de sequência;
  - fuso local;
  - `useDbQuery` sem dependência nova.
- Também decidido sem perguntar:
  - **o esperado de cada verso é guardado na sessão**;
  - **erro síncrono do IndexedDB vira estado de erro** (sem derrubar a tela);
  - **contração sem apóstrofo = quase**. Isso muda a spec de correção; é coerente com o caso `ill` × `I'll`, mas vale a sua confirmação.

## Fora do escopo / pendências
- "Palavras para salvar" → Parte 09 (dono).
- Aba "Em andamento" / retomar sessão → quando houver retomada.
- "Nível estimado" → depois da Parte 07 (CEFR).
- Tela `/progresso` (link do cabeçalho) → sem parte no roadmap ainda.
- A meta de 20 min é fixa até a tela de Ajustes.

## Desvios do design
- Resultado sem a coluna "Palavras para salvar" (Parte 09).
- Notas dos versos sem explicação gramatical (o design tinha "o sujeito ‘cars’ pede ‘come’"); usam só o que o motor de correção sabe.
- Home: Biblioteca sem a aba "Em andamento"; STATUS sem "Nível estimado" e sem o atalho "palavras para revisar".
