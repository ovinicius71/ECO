# 0001 — Início do repositório e regras de trabalho (geral)

Data: 2026-10-31 · Parte 00 · Branch `chore/00-setup-monorepo` · Técnico: [0001](../tecnico/0001-inicio-do-repositorio.md)

## Em uma frase
O projeto passou a ter controle de versão (git), e definimos como as decisões e o acompanhamento vão funcionar daqui para frente.

## O que mudou
- A pasta do projeto virou um repositório git. Tudo o que já existia (documentação, design e pastas vazias) entrou em um primeiro registro na `main`.
- O trabalho da Parte 00 está em uma branch própria (`chore/00-setup-monorepo`), separado da `main`.
- A stack proposta foi confirmada: React no site e FastAPI (Python) no servidor, com npm como gerenciador de pacotes do site.
- Para lint e verificação de tipos ficou o ESLint com TypeScript 6.0. O TypeScript 7, mais novo, ainda não funciona com o ESLint.
- Duas regras novas no CLAUDE.md:
  - as perguntas de brainstorm agora chegam pela caixa de perguntas do Claude Code;
  - toda mudança gera dois registros nesta pasta, um geral (este) e um técnico.
- Padronizamos o fim de linha dos arquivos, para o histórico não ficar poluído no Windows.

## Por que
- O git deixa você revisar cada passo, dar push quando quiser e autorizar os merges.
- As regras novas atendem ao seu pedido de acompanhar o desenvolvimento e responder às dúvidas de forma rápida.

## O que dá para ver ou testar agora
- `git log --oneline` mostra o histórico.
- `docs/brainstorm/00-setup-monorepo.md` traz as perguntas e as respostas da Parte 00.
- Ainda não há nada para abrir no navegador.

## Próximo passo
- Criar o esqueleto do site (`apps/web`) e do servidor (`apps/api`) com testes e lint funcionando. O servidor depende de você instalar o `uv`.
