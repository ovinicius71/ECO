# 0011 — O player do Eco (geral)

Data: 2026-10-31 · Parte 03 · Branch `feat/03-player-sincronia` · Técnico: [0011](../tecnico/0011-nucleo-do-player.md)

## Em uma frase
O Eco agora controla o vídeo do YouTube e sabe, a cada momento, qual verso está tocando.

## O que mudou
- **Verso atual:** o Eco acompanha o tempo do vídeo e identifica o verso, inclusive os trechos instrumentais (mostrados como ♪).
- **Repetir verso:** o vídeo volta ao início do verso sozinho, em loop.
- **Pausar no fim do verso:** a base do Ditado.
- **Velocidade** 0,5× / 0,75× / 1×, oferecendo só as que o vídeo aceita.
- **↺ Verso:** volta ao começo do verso atual e toca.
- **Atalhos da prática:** `Ctrl+Espaço` pausa, `Ctrl+↓/↑` muda a velocidade e `Tab` repete o verso. O `Tab` só repete quando você está digitando, para não atrapalhar quem navega pelo teclado.
- **Barra do player** do design: botão redondo, linha do tempo com o losango ◆, tempo, ↺ Verso e velocidade.
- **Bancada de teste** (só para desenvolvimento): `/dev/player/<id do vídeo>`, com tudo isso ligado.
- O vídeo usa o modo de privacidade aprimorada do YouTube (`youtube-nocookie`).

## Por que
- Todos os modos de prática (a partir da Parte 05) dependem disso. Agora eles só precisam montar a tela.

## O que dá para ver ou testar agora
- Abra uma música em `/musica/<id>` uma vez e depois vá para http://localhost:5173/dev/player/<id>.
- Aperte play e veja o verso mudar. Teste "Repetir verso", "Pausar no fim", a velocidade e os atalhos.
- Testei com um vídeo real: o verso acompanha o tempo, o loop fica no mesmo verso e a pausa para no fim dele.

## Achado no caminho
- Um bug que só aparecia no navegador: em modo de desenvolvimento, o React monta a tela duas vezes, e o primeiro player apagava o segundo. Corrigido. Os testes automáticos agora usam um player falso, e o real foi conferido no navegador.

## Próximo passo
- O player na tela Configurar música (registro 0012).
