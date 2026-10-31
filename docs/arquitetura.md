# Arquitetura e onde cada arquivo fica

```
eco/
├── CLAUDE.md                     regras para o Claude Code (ler primeiro)
├── README.md                     visão geral e comandos (completado na Parte 00)
├── .gitignore
├── .claude/settings.json         permissões (bloqueia push, pede confirmação para merge)
│
├── docs/
│   ├── roadmap.md                partes, branches e status (fonte da verdade)
│   ├── arquitetura.md            este arquivo
│   ├── adr/NNNN-titulo.md        decisões de arquitetura
│   ├── brainstorm/NN-slug.md     um por parte + README (modelo)
│   ├── entregas/NN-slug.md       um por parte + README (modelo)
│   └── spec/                     produto.md, correcao.md, dados.md, api.md
│
├── design/
│   ├── README.md                 direção visual e regras
│   ├── tokens.css / tokens.json  cores, tipografia, espaçamento (fonte única)
│   ├── telas.md                  tela → rota → componentes
│   └── artboards/                referência visual exportada do canvas (NÃO é código)
│       ├── canvas.json
│       └── *.dc.html
│
├── apps/web/                     React + Vite + TS
│   ├── index.html
│   ├── public/                   favicon e estáticos
│   └── src/
│       ├── main.tsx
│       ├── app/                  App.tsx, router.tsx, providers (rotas e layout raiz)
│       ├── styles/               tokens.css (cópia de design/tokens.css), global.css, fonts.css
│       ├── components/           primitivos de UI reutilizáveis, sem regra de negócio
│       │   └── <Componente>/     Componente.tsx + Componente.module.css + Componente.test.tsx
│       ├── layout/               AppHeader, PracticeHeader, PlayerBar, KeyHintBar
│       ├── pages/                uma pasta por rota; só composição
│       │   ├── Home/
│       │   ├── SongSetup/
│       │   ├── practice/
│       │   │   ├── TypeAlong/        (Digitar Junto)
│       │   │   ├── FillBlanks/       (Preencher)
│       │   │   ├── Dictation/        (Ditado)
│       │   │   ├── MultipleChoice/   (Múltipla escolha)
│       │   │   ├── Karaoke/
│       │   │   └── Watch/            (Assistir)
│       │   ├── Result/
│       │   └── Vocabulary/
│       ├── features/             lógica por domínio (hooks + funções puras + testes)
│       │   ├── player/           wrapper da IFrame API, useCurrentLine, offset, velocidade, loop
│       │   ├── lyrics/           tipos, tokenização, helpers de Line/Token
│       │   ├── correction/       motor de correção (docs/spec/correcao.md) + contractions.ts
│       │   ├── blanks/           escolha de lacunas por CEFR/densidade
│       │   ├── srs/              Leitner, agendamento de revisão
│       │   ├── progress/         streak, metas, estatísticas
│       │   ├── translation/      busca e cache de tradução
│       │   ├── dictionary/       popover de palavra
│       │   └── speech/           reconhecimento de fala (Karaokê)
│       ├── lib/
│       │   ├── api/              cliente HTTP tipado para apps/api
│       │   ├── db/               Dexie: schema, migrações, repositórios
│       │   └── utils/            utilidades genéricas
│       ├── store/                stores Zustand (sessão de prática, preferências)
│       └── types/                tipos globais compartilhados
│
└── apps/api/                     FastAPI + uv
    ├── pyproject.toml
    ├── .env.example
    ├── app/
    │   ├── main.py               criação do app, CORS, routers
    │   ├── config.py             settings via env
    │   ├── routers/              songs.py, lyrics.py, translate.py, dictionary.py, words.py, transcribe.py
    │   ├── services/             youtube.py (oEmbed + parse de URL), lrclib.py, lrc.py, title_guess.py,
    │   │                         translator.py, dictionary.py, cefr.py, phonetics.py, whisper.py, cache.py
    │   ├── schemas/              modelos Pydantic de request e response
    │   └── data/                 listas de palavras e CMUdict (verificar licenças; registrar no README de data/)
    └── tests/
        ├── fixtures/             LRC/JSON de músicas INVENTADAS (nunca letras reais)
        └── test_*.py
```

## Regras de dependência

- `pages/` pode importar de `features/`, `components/`, `layout/`, `lib/` e `store/`.
- `features/` **não importa** de `pages/`. As funções puras não importam React.
- `components/` não conhece domínio (não importa de `features/`).
- O front só fala com serviços externos **via `apps/api`**. A exceção é a IFrame API do YouTube, que roda no cliente.

## Testes

- Os testes de front ficam ao lado do código: `*.test.ts(x)`.
- Os testes de API ficam em `apps/api/tests/`. Nada de rede real nos testes; use respx e fixtures.
