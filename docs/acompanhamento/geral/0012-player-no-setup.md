# 0012 — Vídeo e ajuste de sincronia na tela da música (geral)

Data: 2026-10-31 · Parte 03 · Branch `feat/03-player-sincronia` · Técnico: [0012](../tecnico/0012-player-no-setup.md)

## Em uma frase
Na tela Configurar música, o vídeo agora toca de verdade, mostra o verso atual e permite acertar a sincronia da letra, que fica salva para aquela música.

## O que mudou
- O quadro hachurado deu lugar ao **vídeo do YouTube**.
- Abaixo dele, **"AGORA"** mostra o verso que está tocando, para você perceber se a letra está adiantada ou atrasada.
- **AJUSTE DE SINCRONIA** (− / +, de 0,1 em 0,1 s), como no design. Fica **salvo no navegador**, por música.
- **Aviso de duração:** se a letra e o vídeo têm durações diferentes (mais de 2 s), aparece "A letra tem 3:41 e o vídeo 3:50: pode estar dessincronizada". Se o LRCLIB tiver uma versão com a duração certa, aparece o botão "Usar a versão de 3:50" (foi a sua escolha).

## Por que
- A sincronia certa é o que faz os modos de prática funcionarem. Este é o lugar para calibrá-la antes de praticar.

## O que dá para ver ou testar agora
- `npm run dev:api` + `npm run dev:web` e depois abra uma música.
- Dê play no vídeo, veja o "AGORA" mudar, ajuste a sincronia e recarregue a página: o ajuste continua lá (testei).

## Próximo passo
- Parte 05: o modo Ditado, o primeiro modo de prática completo.
