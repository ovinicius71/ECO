# Especificação de produto

## Fluxo principal

1. **Home** (`/`): o usuário cola um link do YouTube e clica em **Buscar letra**.
2. **Configurar música** (`/musica/:videoId`): a tela mostra o vídeo, o título, o artista, o idioma, a fonte e a sincronia da letra, e o ajuste de offset. O usuário escolhe um dos 6 modos, ajusta as opções e clica em **Começar**.
3. **Prática** (`/praticar/:videoId/:modo`) com o player do YouTube.
4. **Resultado** (`/resultado/:sessionId`): precisão, estatísticas, versos com erro e palavras para salvar.
5. **Vocabulário** (`/vocabulario`): palavras salvas e revisão espaçada.

Se a letra não for encontrada:
- mostrar candidatos do LRCLIB ("Trocar versão da letra");
- permitir colar a letra manualmente, com sincronia estimada pela duração;
- oferecer o Whisper local, quando habilitado.

## Comum a todos os modos

- Cabeçalho de prática com: Sair, título/artista, nome do modo (barra invertida), progresso (verso N/total + gauge) e métrica principal.
- Barra do player com: play/pause, linha do tempo, tempo, **↺ Verso**, velocidade (0,5× / 0,75× / 1×) e tradução.
- Barra de atalhos no rodapé.
- A tradução de cada verso aparece quando estiver ativada.
- O offset de sincronia é salvo **por música**.
- Ao terminar, os dados vão para Resultado e a sessão fica salva no IndexedDB.

### Atalhos globais na prática

| Tecla | Ação |
| --- | --- |
| `Tab` | Repetir o verso atual |
| `Ctrl+Espaço` | Pausar ou continuar |
| `Ctrl+↓` / `Ctrl+↑` | Diminuir ou aumentar a velocidade |
| `Ctrl+H` | Dica |
| `Enter` | Confirmar ou avançar |
| `Esc` | Sair (pede confirmação se houver progresso) |

## Modos

### 1. Digitar Junto (一緒に打つ)

- A letra corre com a música. O verso atual aparece grande, com os 2 versos anteriores e os 2 seguintes atenuados.
- A digitação é comparada **caractere a caractere**:
  - certo: tinta;
  - errado: vermelhão sublinhado;
  - ainda não digitado: cinza.
- Uma barra mostra o tempo restante do verso. Quando o verso acaba, o próximo começa mesmo que o atual esteja incompleto. O que faltou conta como erro.
- Métricas: precisão (caracteres) e PPM (palavras por minuto).
- Opções: velocidade, correção e tradução.

### 2. Preencher (穴埋め)

- A letra aparece inteira, com lacunas. As lacunas são escolhidas pelo **nível CEFR** (palavras ≥ nível escolhido têm prioridade) e pela **densidade** (10–50% das palavras).
- Palavras funcionais muito curtas (a, the, of…) só viram lacuna com densidade ≥ 40%.
- A música **espera no fim do verso** se houver lacuna aberta nele.
- Dica: a primeira letra e o número de letras (`a _ _ _ _ _ (6)`).
- Os estados das lacunas são: certa, quase (tracejado) e errada (riscada + correção).

### 3. Ditado (書き取り)

- **Sem a letra na tela.** O vídeo fica **visível** ao lado (as regras do YouTube proíbem cobrir ou esconder o player; ver ADR 0002). Um aviso lembra que clipes com legenda embutida podem mostrar a letra.
- Pausa automática no **fim de cada verso**. O usuário digita o verso inteiro e confirma com `Enter`.
- O resultado palavra a palavra aparece com a tradução. `Enter` vai para o próximo verso.
- Ouvir de novo é ilimitado e contado. Há opção de deixar mais devagar. A dica mostra a primeira letra de cada palavra.
- Versos anteriores aparecem abaixo, com a precisão de cada um.

### 4. Múltipla escolha (選択)

- O verso aparece com **1 lacuna** e **3 ou 4 opções**. Os distratores são **foneticamente parecidos** (CMUdict) e do mesmo tipo de palavra quando possível.
- As teclas `1`–`4` escolhem a opção. Depois da escolha:
  - a opção certa fica invertida com ✓;
  - a opção errada fica riscada com ✕;
  - aparece uma explicação curta de pronúncia ou sentido.
- Mostra a sequência de acertos seguidos.

### 5. Karaokê (カラオケ)

- O verso atual aparece com as palavras acendendo conforme o tempo. A palavra atual fica em barra invertida.
- O microfone (com permissão) reconhece a fala. Cada palavra recebe uma nota de 0–100 e um nível (3 quadrados: clara / entendível / treinar).
- Clicar numa palavra do verso anterior mostra o IPA esperado, o que foi ouvido, uma dica e os botões "Ouvir original" e "Gravar de novo".
- O texto deixa claro que o áudio não é salvo.

### 6. Assistir (鑑賞)

- Vídeo grande com legenda (original + tradução) e painel de letra ao lado. O verso atual fica invertido.
- As palavras do verso atual são clicáveis e abrem um painel com: palavra, nível, classe, IPA, ouvir, significado em pt-BR, nota de uso e **+ Salvar palavra**.
- Palavras já salvas ficam sublinhadas com pontilhado.
- Links rápidos para praticar a mesma música em outros modos.

## Resultado

- Precisão grande, selo de recorde e streak.
- Grade de estatísticas: versos, palavras certas, quase, erradas, tempo e repetições.
- Precisão por verso em barras: certo / quase / erro.
- "Versos para rever": o verso com a diferença marcada e uma nota explicando o erro.
- "Palavras para salvar": checkboxes, pré-marcadas com as palavras que o usuário errou.
- Ações: praticar só os versos com erro, repetir, outro modo e nova música.

## Vocabulário

- Abas: Para revisar (N) / Aprendendo / Dominadas / Todas.
- Uma lista à esquerda e o detalhe da palavra: palavra, IPA, ouvir, significado, **o verso da música onde apareceu** e um link para ouvir o trecho.
- Painel STATUS: caixa (1–5), próxima revisão, acertos e data em que foi salva.
- **Revisão Leitner**:
  - intervalos das caixas 1→5: 1, 2, 4, 8 e 16 dias;
  - acerto sobe uma caixa;
  - erro volta para a caixa 1;
  - caixa 5 com acerto = dominada.
- Exportar para Anki: CSV primeiro.

## Home

- Campo de link, explicação em 3 passos e idiomas (Inglês ativo; 日本語 "em breve").
- Biblioteca: Recentes / Em andamento / Favoritas, com a melhor nota e o último modo.
- STATUS: nível estimado, músicas praticadas, palavras salvas, precisão média, meta diária em minutos, sequência da semana e atalho "N palavras para revisar hoje".
