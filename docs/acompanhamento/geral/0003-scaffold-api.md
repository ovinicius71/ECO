# 0003 — Esqueleto do servidor (geral)

Data: 2026-10-31 · Parte 00 · Branch `chore/00-setup-monorepo` · Técnico: [0003](../tecnico/0003-scaffold-api.md)

## Em uma frase
O servidor (`apps/api`) já sobe e responde a um "estou vivo" em `/api/health`.

## O que mudou
- Criamos a base do servidor em Python (FastAPI), gerenciada pelo `uv`.
- Por enquanto ele tem uma rota só, `/api/health`, que avisa se está no ar e se o Whisper está ligado (por padrão, desligado).
- O servidor só aceita chamadas vindas do endereço do site em desenvolvimento.
- Ganhou verificação de estilo e formatação (ruff) e 3 testes automáticos.

## Por que
- É por esse servidor que o site vai buscar as letras (LRCLIB), o título do vídeo, as traduções e o dicionário, a partir da Parte 02.

## O que dá para ver ou testar agora
- Na raiz: `npm run dev:api` e depois abrir http://localhost:8000/api/health → `{"ok":true,"whisper":false}`.
- http://localhost:8000/docs mostra a documentação interativa da API.

## Próximo passo
- Atalhos na raiz para rodar e testar os dois apps juntos.
