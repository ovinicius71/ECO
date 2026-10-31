# Brainstorm — Escopo inicial (feito com o dono antes do código)

Data: 2026-10-31

## Decisões já tomadas pelo dono

| Tema | Decisão |
| --- | --- |
| Nome | **Eco** (エコ) |
| Fonte da letra | **LRCLIB** (principal) + **Whisper local** (alternativa) |
| Modos | Digitar Junto, Preencher, Ditado, Assistir, **Múltipla escolha**, **Karaokê/pronúncia** |
| Preencher | Lacunas **por nível (A1–C2)** e **densidade ajustável** |
| Correção | **O usuário escolhe** entre tolerante e estrita |
| Aprendizado | Tradução por linha, clicar na palavra, vocabulário + revisão espaçada, progresso e streak |
| Conta | **Sem login**, tudo salvo localmente no navegador |
| Plataforma | **Desktop primeiro** |
| Idiomas | **Inglês primeiro**, japonês depois |
| Visual | Novo, inspirado em folha de conceito japonesa (papel, tinta) + menus do NieR:Automata (ver `design/`) |

## Perguntas em aberto (o Claude Code deve levar ao dono no brainstorm da parte indicada)

| # | Pergunta | Opções | Recomendação | Parte |
| --- | --- | --- | --- | --- |
| A | Stack confirmada? | React+Vite+TS / FastAPI+uv (proposta no ADR 0001) vs. outra | Manter a proposta | 00 |
| B | Gerenciador de pacotes do front? | npm / pnpm | npm (mais simples) | 00 |
| C | Provedor de tradução por linha? | DeepL API Free (precisa de chave) / LibreTranslate self-host / LLM via API da Anthropic / tradução manual | DeepL Free, com cache por música | 08 |
| D | Dicionário para o popover de palavra? | Free Dictionary API (dictionaryapi.dev) / Wiktionary dump local / LLM | Free Dictionary API + cache | 08 |
| E | Lista de nível CEFR por palavra? | CEFR-J Wordlist / EFLLex / lista de frequência + mapeamento | Verificar licença de cada uma antes de escolher | 07 |
| F | Como o Whisper recebe o áudio? | Upload de arquivo do usuário / gravação do sistema / baixar do YouTube (**viola os ToS — exige decisão explícita e ADR**) | Upload de arquivo | 13 |
| G | Reconhecimento de fala no Karaokê? | Web Speech API (só Chrome/Edge, envia áudio ao provedor do navegador) / Whisper local em streaming | Web Speech API no protótipo, avisando o usuário | 12 |
| H | Exportar para Anki? | CSV importável / pacote `.apkg` | CSV primeiro | 09 |
| I | Telas ainda sem design | Ajustes, Progresso detalhado, estados de erro e carregamento | Propor no mesmo estilo antes de implementar | quando surgir |
