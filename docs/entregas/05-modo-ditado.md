# Entrega — Parte 05: Modo Ditado

Branch: `feat/05-modo-ditado` · Base: `main`
Status: 🟡 pronta para push

## O que foi entregue
- **Modo Ditado completo** em `/praticar/:videoId/ditado`:
  - o vídeo pausa no fim do verso, você digita, confirma com Enter e vê a correção palavra por palavra (`scoreLine`);
  - ouvir de novo (contado e pelo Tab), mais devagar (0,75×), dica com a 1ª letra (Ctrl+H) e pular;
  - tolerante/estrita trocável no meio, com recálculo;
  - versos anteriores com %, painel SESSÃO e PRECISÃO no cabeçalho;
  - resumo no fim (sem salvar) com Repetir / Outro modo / Nova música.
- O **Começar** do Setup abre o Ditado com os ajustes escolhidos, levados pela query string.
- Componentes: `PracticeHeader`, `WordToken`, `Waveform` (progresso do verso).
- **ADR 0002 — player sempre visível**: sem capa sobre o vídeo, por causa das regras do YouTube. Spec e notas do design atualizadas.
- Duas correções no player da Parte 03, achadas com vídeo real: buffering e tempo exato na pausa.

## Como testar
1. `npm run check` na raiz.
2. `npm run dev:api` + `npm run dev:web`. Abra uma música, deixe **Ditado** e clique em **Começar**.
3. Aperte Enter ("Ouvir o verso 1"). Espere pausar ("PAUSADO NO FIM DO VERSO"), digite e aperte Enter. A correção aparece; Enter segue.
4. Teste o Tab (ouvir de novo), o Ctrl+H (dica), "Pular", "Estrita" e o Esc (pede confirmação).

## Testes automatizados
- `npm run test` (web): 189 passando (34 novos). A suíte completa passou 3 vezes seguidas.
- `pytest` (api): 56 passando, sem mudanças.
- Verificação manual no navegador (Playwright, vídeo público): pausa no fim do verso 1 (99%) e do 2, correção, foco, Tab, 390 px.

## Commits
- `eb7dbe3 docs(brainstorm): parte 05 — modo-ditado`
- `70026fa docs(adr): player do YouTube sempre visível (0002) e decisões da parte 05`
- `ff5ab42 feat(ditado): reducer da sessão, correção das tentativas, estatísticas e dica`
- `ca97492 feat(design): WordToken, Waveform (progresso do verso) e PracticeHeader`
- `0af2609 feat(ditado): tela do Ditado com fluxo por verso, correção, dica, pular e resumo`
- `698134f feat(web): Começar do Setup abre o Ditado com os ajustes escolhidos`
- `4fcabcf fix(player): buffering não conta como pausa e o tempo exato é gravado ao pausar`. **Atenção:** entrou com 1 teste instável falhando, corrigido no commit seguinte.
- `f515d68 test(ditado): folga no timeout dos testes de integração (instáveis na suíte completa)`
- `9996cb1 docs(acompanhamento): 0013 e 0014 — modo Ditado e correções do player`

## Decisões tomadas por padrão (não bloqueantes)
- NB1–NB15 do brainstorm:
  - ajustes via query string;
  - lógica em `features/dictation`;
  - início 1 s antes do verso 1;
  - confirmar com o vídeo tocando;
  - seguir de onde parou;
  - ouvir de novo com 0,3 s de recuo;
  - Mais devagar 1×↔0,75×;
  - dica conta 1 por verso;
  - pular = 0%;
  - recálculo ao trocar a correção;
  - precisão = média;
  - pausa desligada;
  - `confirm` ao sair;
  - componentes novos;
  - lista do mais recente para o mais antigo.
- Também decidido sem perguntar:
  - **o recuo nunca passa do fim do verso anterior** (`seekPointFor`);
  - sem PlayerBar no Ditado (como no artboard);
  - buffering não conta como pausa;
  - tempo exato gravado na pausa.

## Fora do escopo / pendências
- Salvar a sessão e a tela Resultado → Parte 10.
- Tradução do verso → Parte 08.
- Clipes com legenda embutida podem entregar a letra (aviso na tela; consequência do ADR 0002).

## Desvios do design
- Sem a capa "VÍDEO OCULTO": o vídeo fica visível (ADR 0002).
- A "forma de onda" é decorativa e indica o progresso do verso (a IFrame API não dá o áudio).
- Sem a tradução abaixo do verso corrigido (Parte 08).
