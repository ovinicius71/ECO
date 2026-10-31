# CLAUDE.md — Eco

Eco é um site para aprender idiomas com músicas do YouTube. O usuário cola um link, o Eco busca a letra sincronizada e oferece 6 modos de prática: Digitar Junto, Preencher, Ditado, Múltipla escolha, Karaokê e Assistir. Também tem vocabulário com revisão espaçada e progresso.

Leia este arquivo inteiro antes de qualquer tarefa. Ele vale mais que qualquer preferência sua de fluxo.

---

## 1. Regras inegociáveis

1. **Nunca faça `git push`.** O dono do projeto faz todos os pushes.
2. **Nunca faça merge sem autorização explícita.** "Autorização" é uma mensagem do dono dizendo, com essas palavras ou equivalentes: `pode mergear feat/NN-...`. Uma autorização vale só para a branch citada.
3. **Nunca trabalhe direto na `main`.** Todo trabalho acontece em uma branch da parte atual (seção 4).
4. **Nunca reescreva histórico compartilhado.** Sem `push --force`, sem `rebase` da `main`, sem `reset --hard` em commits que já foram enviados. Na dúvida, pergunte.
5. **Na dúvida, faça brainstorm e pergunte** (seção 3). Não chute decisões de produto, de stack ou que sejam difíceis de desfazer.
6. **Nunca commite letras reais de músicas.** Fixtures e exemplos usam só letras inventadas (ex.: "Paper Moon Radio — The Quiet Arcade", em `apps/api/tests/fixtures/`).
7. **Nunca commite segredos** (`.env`, chaves de API). Use `.env.example`.

O `.claude/settings.json` bloqueia `git push` e pede confirmação para `git merge`, `git rebase`, `git reset --hard` e `git branch -D`. Não tente contornar esses bloqueios com variações do comando (`git -C`, `sh -c` etc.).

---

## 2. Onde está cada coisa

| Caminho | O que é |
| --- | --- |
| `docs/roadmap.md` | **Fonte da verdade** das entregas: partes, branches, dependências e status |
| `docs/brainstorm/` | Um arquivo de brainstorm por parte (`NN-slug.md`) e o modelo em `README.md` |
| `docs/entregas/` | Um relatório por parte concluída (`NN-slug.md`) e o modelo em `README.md` |
| `docs/spec/` | Especificações: `produto.md`, `correcao.md`, `dados.md`, `api.md` |
| `docs/arquitetura.md` | Árvore de pastas e onde cada tipo de arquivo deve ficar |
| `docs/adr/` | Decisões de arquitetura registradas (uma por arquivo) |
| `design/` | Design aprovado: tokens, mapa de telas e artboards de referência |
| `apps/web/` | Front-end (React + Vite + TypeScript) |
| `apps/api/` | Back-end (FastAPI + Python) |

Antes de criar um arquivo, confira em `docs/arquitetura.md` onde ele deve ficar. Se não houver lugar previsto, proponha um no brainstorm da parte.

---

## 3. Brainstorm: sempre que houver dúvida

### Quando fazer

- **Sempre no início de cada parte**, antes de escrever código.
- **Durante a parte**, sempre que surgir uma dúvida que mude comportamento, interface, modelo de dados, dependência nova ou custo.

### Como fazer

1. Crie ou atualize `docs/brainstorm/NN-slug.md` a partir do modelo `docs/brainstorm/README.md`.
2. Escreva as perguntas **em forma de pergunta**, cada uma com 2–4 opções e a sua recomendação.
3. Separe as perguntas em dois grupos:
   - **Bloqueantes**: mudam o que será construído. **Pare e pergunte ao dono.** Não comece a implementação até ter as respostas.
   - **Não bloqueantes**: têm um padrão razoável. Siga a recomendação, registre como "decidido por padrão" e cite no relatório da entrega.
4. Faça commit do brainstorm: `docs(brainstorm): parte NN — <slug>`.
5. Mostre as perguntas bloqueantes ao dono de forma curta e numerada, e espere.

Registre as respostas do dono no próprio arquivo de brainstorm, na seção "Decisões". Se a resposta mudar a arquitetura, crie também um ADR em `docs/adr/`.

---

## 4. Entregas em partes e branches

### Partes

O trabalho está dividido em partes numeradas em `docs/roadmap.md`. Cada parte:

- tem **uma branch**;
- é pequena o bastante para ser revisada de uma vez (alvo: até ~600 linhas alteradas, sem contar lockfiles);
- termina com algo testável;
- se ficar grande demais, divida em `NNa`, `NNb`… e atualize o roadmap antes de seguir.

### Nome das branches

```
chore/NN-slug    configuração, ferramentas, infraestrutura
feat/NN-slug     funcionalidade nova
fix/NN-slug      correção de bug de uma parte já mergeada
docs/NN-slug     só documentação
```

Use o `NN` e o `slug` exatos do roadmap. Exemplo: `feat/05-modo-ditado`.

### De onde criar a branch

- Se a parte anterior **já foi mergeada**, crie a branch a partir da `main` atualizada.
- Se a parte depende de uma branch **ainda não mergeada**, crie a nova a partir dela (branch empilhada). Avise no brainstorm e no relatório: "empilhada sobre `feat/NN-...`". Nunca faça merge entre branches de feature sem autorização.
- Partes independentes podem ser feitas em paralelo, cada uma a partir da `main`.

### Ciclo de uma parte

1. `git switch main` e confira que está limpo (`git status`).
2. `git switch -c <tipo>/NN-slug`.
3. Brainstorm (seção 3). Espere as respostas bloqueantes.
4. Implemente em commits pequenos (seção 5).
5. Rode testes, lint e checagem de tipos (seção 6). Tudo deve passar.
6. Escreva `docs/entregas/NN-slug.md` a partir do modelo.
7. Atualize o status da parte em `docs/roadmap.md` para `🟡 pronta para push`.
8. Faça o commit final: `docs(entrega): parte NN — <slug>`.
9. **Avise o dono e pare.** Use este formato:

```
Parte NN pronta — branch `<tipo>/NN-slug`
- O que entrega: <1–3 linhas>
- Como testar: <comandos/rota>
- Decisões por padrão: <lista ou "nenhuma">
- Pendências: <lista ou "nenhuma">
Pode dar push quando quiser. Aguardo seu ok para o merge.
```

### Merge (só com autorização)

Quando o dono disser `pode mergear <branch>`:

1. `git switch main`
2. `git merge --no-ff <branch> -m "merge: parte NN — <slug>"`
3. Se houver conflito, **pare** e descreva os conflitos ao dono. Não resolva conflitos de lógica sozinho.
4. Atualize o roadmap: status `✅ mergeada`. Faça commit na `main`: `docs(roadmap): parte NN mergeada`.
5. Não apague a branch, a menos que o dono peça.
6. Avise: "Mergeado na main local. Falta o seu push."

Se o dono disser que **não** pode mergear, ou pedir mudanças, continue na mesma branch com novos commits. Nunca use amend em commits que já foram enviados.

---

## 5. Commits

- Formato **Conventional Commits**, com a descrição em **pt-BR**:
  `tipo(escopo): descrição no imperativo`
- Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`.
- Escopos sugeridos: `web`, `api`, `design`, `player`, `letra`, `correcao`, `ditado`, `digitar`, `preencher`, `escolha`, `karaoke`, `assistir`, `vocab`, `progresso`, `brainstorm`, `entrega`, `roadmap`.
- Um commit é uma mudança lógica que compila e passa nos testes.
- Exemplos:
  - `feat(ditado): pausar o vídeo no fim de cada verso`
  - `test(correcao): casos de contrações e erro de uma letra`
  - `fix(player): corrigir offset negativo no seek`
- Nunca commite arquivos gerados (`dist/`, `node_modules/`, `.venv/`, caches).

---

## 6. Qualidade antes de entregar

Os comandos exatos são definidos na Parte 00 e documentados no `README.md`. A meta é esta:

- **Web:** `npm run lint`, `npm run typecheck`, `npm run test` (Vitest).
- **API:** `ruff check`, `ruff format --check`, `pytest`.
- A lógica pura (correção, parser de LRC, SRS, lacunas, distratores) **precisa de testes unitários** antes de ser usada em tela.
- Não faça chamadas de rede reais nos testes. Use as fixtures.

---

## 7. Design

- O design aprovado está em `design/`. Leia `design/README.md` e `design/telas.md` antes de qualquer tela.
- Os **tokens** (`design/tokens.css`) são a única fonte de cor, tipografia e espaçamento. Não use hex soltos nos componentes.
- Os arquivos em `design/artboards/*.dc.html` são **referência visual**. Eles usam estilos inline e uma sintaxe de protótipo (`{{ }}`, `<sc-for>`). Não copie esse markup. Reconstrua com componentes React e CSS (CSS Modules) usando os tokens.
- Mantenha os elementos característicos do visual:
  - papel bege pontilhado;
  - seleção em barra escura invertida;
  - rótulos em caixa alta com espaçamento;
  - painéis de STATUS com linhas finas;
  - IBM Plex Mono para números;
  - vermelhão só para erro;
  - sublinhado tracejado para o "quase".
- Acessibilidade obrigatória:
  - `<button>`/`<a>` de verdade;
  - foco visível (anel de 2px em `--eco-focus`);
  - contraste de 4.5:1 no texto;
  - `aria-label` em botões só com ícone;
  - atalhos de teclado iguais aos da barra de atalhos de cada tela.
- O texto da interface fica em **pt-BR**. O código (nomes de variáveis, funções, arquivos) fica em **inglês**.
- O design é desktop primeiro, mas nenhuma tela pode quebrar em 390px de largura.
- Tela que não está no design (Ajustes, Progresso detalhado, estados de erro e carregamento): proponha no brainstorm, no mesmo estilo, antes de implementar.

---

## 8. Produto e restrições técnicas

- **Fonte da letra:** a principal é o LRCLIB. A alternativa é o Whisper local (Parte 13). Os detalhes estão em `docs/spec/api.md`.
- **YouTube:** só a IFrame Player API e o oEmbed. Não baixe áudio ou vídeo do YouTube em nenhum fluxo sem uma decisão explícita do dono registrada em ADR. Os Termos de Uso proíbem isso.
- **Sem login.** Os dados ficam no navegador (IndexedDB). O schema está em `docs/spec/dados.md`.
- **Idiomas:** inglês primeiro. Não escreva lógica presa ao inglês onde for barato generalizar: o japonês vem depois (romaji/kana/furigana).
- **Correção:** tolerante ou estrita, à escolha do usuário. O algoritmo é obrigatoriamente o de `docs/spec/correcao.md`.
- **Microfone (Karaokê):** o áudio é processado no navegador e não é salvo nem enviado.

---

## 9. Como conversar com o dono

- Responda em **pt-BR**, de forma curta e direta.
- Não narre cada passo. Avise no início de uma parte, quando houver perguntas bloqueantes e quando terminar.
- Se uma instrução do dono contradisser este arquivo, siga o dono e proponha atualizar o CLAUDE.md, em um commit `docs(claude): ...`, na branch atual.
