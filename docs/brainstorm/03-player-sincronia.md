# Brainstorm — Parte 03: Player e sincronia

Branch: `feat/03-player-sincronia` · Base: `main`
Data: 2026-10-31

## Contexto
Um wrapper da IFrame Player API do YouTube, com:
- o verso atual calculado pelo tempo;
- o offset de sincronia salvo por música;
- velocidade (0,5× / 0,75× / 1×);
- repetir o verso (loop);
- pausa automática no fim do verso.

É a base de todos os modos (05 em diante). Specs: `produto.md` ("Comum a todos os modos") e `dados.md` (`Song.offsetMs`). Design: `Setup` (ajuste de sincronia) e a barra do player do `DigitarJunto`.

## Já decidido
- Só a IFrame API (CLAUDE.md §8). Nada de baixar áudio ou vídeo.
- O `Song.offsetMs` já existe no Dexie (Parte 02).
- Zustand para o estado do player e da prática (ADR 0001).
- Atalhos globais da prática (spec): `Tab` repete o verso, `Ctrl+Espaço` pausa e continua, `Ctrl+↓/↑` mudam a velocidade.

## Perguntas bloqueantes (preciso da resposta antes de codar)
1. **Onde a Parte 03 aparece para testar?**
   - A) **Setup + página de teste.** Na tela da música:
     - o player real entra no lugar do placeholder;
     - o "AJUSTE DE SINCRONIA" (−/+ 0,1 s, salvo por música);
     - uma prévia do verso atual embaixo do vídeo, para calibrar.

     Também entra o componente **PlayerBar** (play, linha do tempo com losango, tempo, ↺ Verso, velocidade), e uma página só de dev, `/dev/player/:videoId`, com tudo ligado (loop, pausa no fim do verso e atalhos). A 05 reaproveita.
   - B) Só a tela Configurar música, com player, offset e prévia. A PlayerBar, o loop e a pausa ficam para a 05, junto com o Ditado.
   - C) Já criar a "casca" da prática (`/praticar/:id/:modo`, com PracticeHeader + PlayerBar + atalhos), para os modos só preencherem o miolo.
   - Recomendação: A. Cada peça fica testável sem inventar uma tela de produto antes da hora, e a C nasce com o Ditado na 05.
2. **E quando a duração do vídeo não bate com a da letra (> 2 s)?** O player finalmente informa a duração real, que faltava na Parte 02.
   - A) **Avisar e sugerir.** O Setup mostra "A letra tem 3:35 e o vídeo 3:41; pode estar dessincronizada". Se o LRCLIB tiver uma versão com a duração do vídeo, aparece o botão "Usar a versão de 3:41".
   - B) Trocar sozinho para a versão com duração compatível na primeira abertura (antes de qualquer ajuste de offset), com um aviso de que trocou.
   - C) Ignorar; o usuário usa "Trocar versão" se achar ruim.
   - Recomendação: A. Ajuda sem mexer na letra pelas costas do usuário.

## Perguntas não bloqueantes (sigo a recomendação se não houver resposta)
1. **Domínio do player?** Recomendação: `youtube-nocookie.com` (modo de privacidade aprimorada), que é suportado pela IFrame API.
2. **Sentido do offset?** Recomendação: `tempoDaLetra = tempoDoVídeo + offsetMs`.
   - "+" = **Adiantar letra** (o verso aparece antes) e "−" = **Atrasar letra**, como os `aria-label` do artboard.
   - Passo de 0,1 s, limite de ±10 s.
   - Salva no Dexie com debounce de 500 ms.
3. **Como ler o tempo?** A IFrame API não tem evento de tempo. Recomendação:
   - um laço `requestAnimationFrame` enquanto toca, usando o `getCurrentTime()`;
   - o store só muda quando muda o verso ou a cada ~250 ms (para o relógio), evitando re-render a 60 fps.
4. **Verso atual?** Recomendação: uma função pura `findLineIndex(lines, lyricMs)` com busca binária.
   - Devolve `-1` antes do primeiro verso e nos intervalos instrumentais.
   - Nos intervalos, a prévia mostra `♪`.
5. **Loop e pausa no fim do verso?** Recomendação: uma função pura `lineGuard(...)` que, a cada tique, decide entre `none`, `pause` e `seek(start)`. Sem timers do YouTube, porque são imprecisos.
6. **Testes?** Recomendação:
   - `PlayerController` como interface (play, pause, seek, rate, time, duration), com um **fake** nos testes;
   - o adaptador real do YouTube fica fino e sem teste unitário, verificado no navegador.
7. **Zustand?** Recomendação: entra agora (ADR), com o `createPlayerStore()` (store por player, via contexto), e não um global, porque o Setup e a prática não coexistem, mas os testes ficam isolados.
8. **Linha do tempo acessível?** Recomendação: `<input type="range">` estilizado com o losango ◆, com `aria-valuetext="0:24 de 3:41"`. As setas avançam 5 s.
9. **Autoplay?** Recomendação: não. O usuário aperta play, por causa da política dos navegadores e porque é menos invasivo.
10. **Atalhos no Setup?** Recomendação: nenhum novo; `↑ ↓`/`Enter`/`Esc` continuam como estão. Os atalhos de prática valem na página `/dev/player` e, depois, na prática.
11. **Botão ↺ Verso?** Recomendação: volta ao início do verso atual e toca. Se estiver num intervalo, volta ao último verso.

## Riscos e o que pode dar errado
- A precisão do `getCurrentTime()` varia por navegador. Mitigação: tolerância de 50 ms nas bordas do verso.
- Vídeos com incorporação desativada (erro 101/150 da IFrame API). Mitigação: mensagem "Este vídeo não permite reprodução fora do YouTube", com o link para abrir no YouTube.
- Em `setPlaybackRate`, alguns vídeos não aceitam 0,5×. Mitigação: ler `getAvailablePlaybackRates()` e desabilitar o que não houver.

## Plano de commits
1. `docs(brainstorm): parte 03 — player-sincronia`
2. `feat(player): funções puras de sincronia (verso atual, offset, loop, pausa) com testes`
3. `feat(player): PlayerController, adaptador da IFrame API e store do player`
4. `feat(player): PlayerBar e página /dev/player`
5. `feat(web): player e ajuste de sincronia na tela Configurar música`
6. `docs(acompanhamento): …` e `docs(entrega): parte 03 — player-sincronia`

## Decisões (preenchido depois das respostas)
- P1 → A: Setup com player, ajuste de sincronia e prévia do verso, mais a PlayerBar e a página de dev `/dev/player/:videoId` (dono, 2026-10-31)
- P2 → A: avisar quando a duração diverge (> 2 s) e sugerir a versão do LRCLIB com a duração do vídeo, se existir (dono, 2026-10-31)
- NB1–NB11 → decididos por padrão
