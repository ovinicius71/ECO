# 0014 — Duas correções no player (geral)

Data: 2026-10-31 · Parte 05 · Branch `feat/05-modo-ditado` · Técnico: [0014](../tecnico/0014-correcoes-do-player.md)

## Em uma frase
Testando o Ditado com um vídeo real, achei e corrigi dois defeitos do player da Parte 03.

## O que mudou
- **"Carregando" não é mais "pausado".** Quando a internet está lenta e o vídeo para para carregar, a tela dizia "PAUSADO" e o relógio do Eco parava. Agora o Eco continua tratando o vídeo como tocando.
- **O tempo exato na pausa.** Para não redesenhar a tela 60 vezes por segundo, o relógio do Eco anda em passos de 0,25 s. Na pausa ele podia ficar até 0,25 s atrasado, e o Ditado achava que o verso não tinha terminado ("PAUSADO" em vez de "PAUSADO NO FIM DO VERSO"). Agora, ao pausar, o tempo exato é gravado.

## Por que
- Os dois só apareciam com o YouTube de verdade; os testes automáticos usavam um player perfeito. Para o segundo, primeiro escrevi um teste que reproduz o defeito, depois corrigi.

## Também registrado
- Um teste do Ditado falhava às vezes quando a suíte inteira rodava (a máquina fica mais lenta). Um commit (`4fcabcf`) chegou a entrar com essa falha, porque o meu comando de verificação escondia o código de erro. O teste foi ajustado no commit seguinte, e a suíte passou 3 vezes seguidas. Agora confiro o código de saída do `check`.

## O que dá para ver ou testar agora
- No Ditado, o status mostra "PAUSADO NO FIM DO VERSO" no momento certo.
