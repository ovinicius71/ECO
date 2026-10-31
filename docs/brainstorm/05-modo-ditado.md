# Brainstorm — Parte 05: Modo Ditado

Branch: `feat/05-modo-ditado` · Base: `main`
Data: 2026-10-31

## Contexto
O primeiro modo de prática completo. O vídeo pausa no fim de cada verso, o usuário digita o que ouviu, o motor de correção (Parte 04) corrige palavra por palavra e `Enter` vai para o próximo verso. Também tem:
- ouvir de novo (contado);
- mais devagar;
- dica (1ª letra de cada palavra);
- pular;
- versos anteriores com a precisão de cada um;
- painel SESSÃO.

Spec: `produto.md` (§ Ditado e "Comum a todos os modos"). Design: `artboards/Ditado.dc.html`. Rota: `/praticar/:videoId/ditado`.

## Já decidido
- Correção pelo `scoreLine` (Parte 04); tolerante ou estrita, à escolha do usuário.
- Player, pausa no fim do verso, velocidade e atalhos (Parte 03). Observação da 03: a pausa chega algumas dezenas de ms depois da borda, então o Ditado guarda o seu próprio "verso-alvo".
- Atalhos do design: `Enter` confirma/avança, `Tab` ouve de novo (no campo de digitação), `Ctrl+↓` mais devagar, `Ctrl+H` dica, `Esc` sai (pede confirmação se houver progresso).
- A tradução por linha fica para a Parte 08: o espaço da tradução no resultado do verso fica vazio por enquanto.

## Conferido nas políticas do YouTube (2026-10-31)
- *Required Minimum Functionality → Overlays and frames:* "You must not display overlays, frames, or other visual elements in front of any part of a YouTube embedded player… you must not use overlays… to obscure any part of an embedded player."
- *Developer Policies III.I.9:* proíbe "a background player, meaning a player that is not displayed in the page, tab, or screen that the user is viewing".
- *Tamanho mínimo:* "Embedded players must have a viewport that is at least 200px by 200px."
- **Conflito:** o design e a spec pedem o vídeo **oculto por padrão** no Ditado (uma capa "VÍDEO OCULTO" sobre o player), para que as legendas embutidas no clipe não entreguem a resposta. Cobrir o player com uma capa, ou escondê-lo enquanto toca, contraria as duas regras acima.

## Perguntas bloqueantes (preciso da resposta antes de codar)
1. **Vídeo no Ditado, diante das regras do YouTube?**
   - A) **Vídeo sempre visível** (≥ 200×200 px), sem capa, na coluna lateral. Um aviso discreto diz que clipes com legenda embutida podem mostrar a letra, sugerindo escolher um vídeo "lyric-less"/áudio oficial. A spec e as notas do design são atualizadas, e um ADR registra a mudança.
   - B) Seguir o design (capa "VÍDEO OCULTO" sobre o player), assumindo o risco de violar as regras. Também com ADR.
   - Recomendação: A. O CLAUDE.md já pede respeito aos Termos do YouTube, e a regra é explícita.
2. **"Forma de onda" do verso (o design mostra barras):** a IFrame API não dá acesso ao áudio, então não existe forma de onda real.
   - A) Barras **decorativas** (alturas fixas geradas a partir do texto do verso), com a parte já tocada em tinta. Funciona como **progresso do verso** (`aria-label` "Progresso do verso"), sem fingir que é o áudio.
   - B) Trocar por uma barra de progresso simples (linha fina com o losango).
   - C) Omitir.
   - Recomendação: A. Mantém o visual do design, e o rótulo deixa claro que é progresso.
3. **E no fim da música (o roadmap fala em "resultado parcial")?**
   - A) **Resumo na própria tela, sem salvar:** precisão, palavras certas/quase/erradas, repetições, dicas e as ações Repetir / Outro modo / Nova música. A Parte 10 cria a tela Resultado e salva as sessões.
   - B) Já salvar a sessão no Dexie (tabela `sessions`, schema v2) além do resumo, e a 10 só cria a tela.
   - Recomendação: A. A 10 é a parte que define o formato das sessões e da tela Resultado; salvar antes amarra decisões dela.

## Perguntas não bloqueantes (sigo a recomendação se não houver resposta)
1. **Ajustes do Setup → Ditado?** Recomendação: o **Começar** do Setup passa a funcionar para o Ditado e abre `/praticar/:id/ditado?pausa=fim&velocidade=1&correcao=tolerante`. A query string sobrevive ao reload; a tabela `Settings` fica para a parte de Ajustes.
2. **Onde fica a lógica?** Recomendação: `features/dictation/` com um **reducer puro** (verso-alvo, tentativas, ouvir de novo, dicas, pulos, totais) e testes. A tela em `pages/practice/Dictation/` só compõe. O `arquitetura.md` é atualizado.
3. **Início:** o player não toca sozinho (autoplay). A tela mostra "APERTE ▶ OU ENTER PARA OUVIR O VERSO 1". O primeiro play começa 1 s antes do verso 1, pulando a introdução longa.
4. **Confirmar com o vídeo tocando?** Recomendação: pode. Confirmar pausa o vídeo e corrige.
5. **Avançar (`Enter` depois de corrigir):** toca a partir do ponto em que parou e pausa no fim do próximo verso. Os intervalos instrumentais tocam normalmente.
6. **Ouvir de novo:** volta 0,3 s antes do início do verso-alvo, toca e pausa no fim. O contador sobe.
7. **Mais devagar:** o botão alterna entre 1× e 0,75×. `Ctrl+↓/↑` continuam como na Parte 03.
8. **Dica (`Ctrl+H`):** o placeholder vira `L… a r… t…` (1ª letra de cada palavra) e conta 1 dica por verso. Repetir a dica no mesmo verso não conta de novo.
9. **Pular:** o verso conta como **0%** ("PULADO") e entra na lista de versos anteriores.
10. **Trocar tolerante/estrita no meio da sessão:** recalcula todos os versos já respondidos (é barato e mantém a precisão coerente).
11. **Precisão no cabeçalho:** a média das notas dos versos respondidos (pulados contam 0).
12. **Pausa automática "Desligada" (ajuste do Setup):** o vídeo segue sozinho. O verso-alvo é o que o usuário está respondendo, e "Ouvir de novo" continua voltando ao início dele.
13. **Esc / ← SAIR com progresso:** `window.confirm("Sair do ditado? O progresso deste treino será perdido.")`, que é nativo e acessível. Na Parte 10, com a sessão salva, isso muda.
14. **Componentes novos:**
    - `PracticeHeader` (layout): ← SAIR, título/artista, rótulo do modo invertido, VERSO NN/TT + Gauge, PRECISÃO;
    - `Waveform` (components);
    - `WordToken` (components): `ok` normal, `near` com tracejado `--eco-near`, `wrong` com sublinhado vermelhão e o digitado riscado embaixo, `missing` com "—".
15. **Lista "Versos anteriores":** mostra o verso esperado com as palavras quase/erradas marcadas e a % à direita, do mais recente para o mais antigo.

## Riscos e o que pode dar errado
- Versos muito curtos (< 1 s): a pausa pode vir "colada". Mitigação: a pausa já tolera 50 ms; avaliar com o uso.
- LRCs com versos repetidos (refrão): cada ocorrência é um verso, o que é o esperado.
- Clipes com legenda embutida (se a P1 for A): o usuário pode ver a resposta. Mitigação: o aviso e a escolha de outro vídeo.

## Plano de commits
1. `docs(brainstorm): parte 05 — modo-ditado`
2. `feat(ditado): reducer da sessão de ditado com testes`
3. `feat(design): WordToken, Waveform e PracticeHeader`
4. `feat(ditado): tela do ditado`
5. `feat(web): Começar do Setup abre o Ditado com os ajustes`
6. `docs(…)`: ADR/spec (conforme a P1), acompanhamento e entrega

## Decisões (preenchido depois das respostas)
- P1 → A: vídeo sempre visível, sem capa, com aviso sobre clipes com legenda embutida. ADR 0002, spec e `design/README.md` atualizados (dono, 2026-10-31)
- P2 → A: barras decorativas como progresso do verso (dono, 2026-10-31)
- P3 → A: resumo na própria tela, sem salvar; a sessão é salva na Parte 10 (dono, 2026-10-31)
- NB1–NB15 → decididos por padrão
