# Design — Eco

## Direção

É um "caderno de campo" de idiomas. A base são duas referências:
- **folha de conceito japonesa:** papel creme, tinta escura, rótulos técnicos pequenos, linhas finas e katakana como detalhe;
- **menus do NieR:Automata:** fundo bege acinzentado, seleção em **barra escura invertida**, abas de categoria grandes com as inativas desbotadas, painéis **STATUS** com linhas e números em mono, e uma barra de atalhos no rodapé.

## Regras visuais

1. **Cor:**
   - fundo de papel pontilhado;
   - tinta para quase tudo;
   - **vermelhão (`--eco-error`) só para erro** e para pequenos destaques numéricos (streak, numeração "01/02/03");
   - "quase" é **sempre** sublinhado tracejado (`--eco-near`), nunca só a cor.
2. **Seleção e item atual** = barra invertida (`--eco-bar` com `--eco-on-bar`). Vale para:
   - linha de lista;
   - aba do menu do topo;
   - opção de controle segmentado;
   - verso atual no Assistir;
   - palavra atual no Karaokê.
3. **Tipografia:**
   - Jost para a interface e as letras;
   - IBM Plex Mono para números, tempos, IPA e teclas;
   - Noto Sans JP para os subtítulos em japonês (ex.: 書き取り).
   - Rótulos: 12px, caixa alta, `letter-spacing: .2em`, cor `ink-2`.
4. **Forma:**
   - cantos retos;
   - bordas de 1px (`rule`) e de 1.5px (fortes);
   - pílulas só em chips, gauges e no botão play.
5. **Ícones:** SVG de traço fino (1.6–2px), sem emoji.
6. **Barra de atalhos** no rodapé de todas as telas: tecla em caixa mono com borda + ação em caixa alta.
7. **Losango (◆)** como cabeçote da linha do tempo e do slider.

## Arquivos

- `tokens.css` / `tokens.json`: a fonte única de valores.
- `telas.md`: mapa de cada tela para rota e componentes.
- `artboards/`: o protótipo exportado do canvas "Eco — Protótipo" (claude.ai), com 10 telas de 1440px.
  - Abra os `.dc.html` como texto para ler a estrutura e o copy. **Eles não rodam sozinhos**, porque dependem do runtime do canvas.
  - Os dados de exemplo são inventados ("Paper Moon Radio — The Quiet Arcade") e servem como fixtures.
  - O copy das telas (textos em pt-BR) deve ser reaproveitado como está.

## Lacunas conhecidas do design

Proponha no brainstorm da parte em que surgirem, no mesmo estilo:
- Ajustes;
- Progresso detalhado (histórico);
- estados de carregamento, erro e "letra não encontrada";
- revisão de vocabulário (a tela de cartão);
- mobile específico;
- tema escuro (não previsto).
