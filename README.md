# Cultivando Cognição na Era da IA

**Plataforma educacional multimídia, autônoma e assíncrona sobre o uso crítico de IAs Generativas.**

> Lema do projeto: **"IA como copiloto, não muleta."**

---

## Sobre o site

Este repositório contém o código-fonte da plataforma web educacional desenvolvida como entregável do **Projeto de Extensão I - Ciência da Computação** (Anhanguera).

A proposta parte de uma pergunta central:

> Como a **Engenharia de Prompts Socráticos**, combinada a metáforas comportamentais, pode transformar a IA Generativa de "muleta" em "copiloto" no processo de aprendizagem?

A ideia é mitigar o *cognitive offloading* (delegação cognitiva passiva) e a "dívida cognitiva" do uso acrítico de IA, induzindo uma **fricção cognitiva intencional** por meio de tutores socráticos digitais.

---

## O que você encontra aqui

| Recurso | Descrição |
|---------|-----------|
| **Artigos formativos** | Conteúdos sobre IA Generativa, engenharia de prompts e uso crítico de tecnologia |
| **Prompts socráticos** | Prompts copiáveis com restrições rígidas (Hard Constraints) para estimular o raciocínio |
| **Quiz formativo** | Autoavaliação que mapeia o próprio perfil de uso de IA (passivo, transição ou ativo) |
| **Lâminas e infográficos** | Materiais didáticos visuais para apoio em sala de aula ou estudo autônomo |
| **Métricas anônimas** | Contador de acessos e estatísticas do quiz, sem coleta de dados pessoais |

---

## Público-alvo

- Estudantes dos **Anos Finais do Ensino Fundamental**
- Estudantes do **Ensino Médio**
- **Ingressantes no Ensino Superior**
- Professores e interessados em alfabetização digital e uso crítico de IA

---

## Stack técnica

| Camada | Tecnologia |
|--------|------------|
| **Front-end** | HTML5 + CSS3 (responsivo, mobile-first, **WCAG 2.1 AA**: ARIA, contraste, navegação teclado) |
| **Interatividade** | JavaScript vanilla (Clipboard API, quiz logic, filtro do gráfico) |
| **Back-end** | Python + Flask |
| **Banco de dados** | SQLite (`db/quiz_stats.db`) com `timeout=10` para concorrência |
| **Implantação** | **PythonAnywhere** — https://projetodeextensao1diego.pythonanywhere.com/ |
| **Segurança de mídia** | Streaming privado (`/stream/audio`, `/stream/video`) + `controlsList="nodownload"` + `oncontextmenu` blocking |
| **Validação** | Whitelists `PERFIS_VALIDOS` e `FAIXAS_VALIDAS` no endpoint `/update` |

---

## URLs de produção

| Ambiente | URL |
|----------|-----|
| **Produção** | https://projetodeextensao1diego.pythonanywhere.com/ |
| **Estatísticas (JSON)** | https://projetodeextensao1diego.pythonanywhere.com/stats |
| **Streaming de áudio** | https://projetodeextensao1diego.pythonanywhere.com/stream/audio/<arquivo> |
| **Streaming de vídeo** | https://projetodeextensao1diego.pythonanywhere.com/stream/video/<arquivo> |

---

## Estrutura do repositório

```
site/
├── backend.py          # Aplicação Flask: rotas, rastreamento de visitas, quiz e estatísticas
├── run.py              # Inicialização: cria .venv, instala dependências e roda o servidor
├── requirements.txt    # Dependências Python
├── db/
│   └── quiz_stats.db   # Banco SQLite com métricas anônimas (visitas, perfis e faixas etárias)
├── html/               # Páginas HTML do site
├── js/
│   ├── quiz.js         # Lógica de pontuação do quiz e pergunta demográfica
│   ├── metrics.js      # Gráfico de perfis com filtro por faixa etária
│   └── prompts.js      # Cópia de prompts via Clipboard API
├── style/              # Folhas de estilo CSS
├── tests/
│   └── test_backend.py # Testes unittest: migração, whitelists e /stats
└── assets/             # Imagens, vídeos e outros meios
```

---

## Métricas e privacidade

O site coleta apenas dados **anônimos e agregados**:

- Número total de visitas à página inicial
- Quantidade de participantes que concluíram o quiz
- Distribuição por perfil de uso de IA (passivo / transição / ativo)
- Distribuição por faixa etária (`ate_19`, `20_25`, `26_39`, `40_mais`), cruzada com o perfil

A faixa etária é a primeira pergunta do quiz, exclusivamente demográfica, e não altera a pontuação. Respostas sem faixa válida são rejeitadas com HTTP 400.

Não são coletados nomes, e-mails, IPs ou qualquer dado pessoal identificável. As informações ficam armazenadas localmente no banco `db/quiz_stats.db` e podem ser consultadas pelo endpoint `/stats`.

---

## Contexto educacional

Desenvolvido no âmbito da disciplina **Projeto de Extensão I**, do curso de **Ciência da Computação** (Anhanguera), com execução entre agosto e dezembro de 2026.

Está alinhado aos **ODS 4 - Educação de Qualidade** (meta 4.4) e **ODS 9 - Indústria, Inovação e Infraestrutura** (meta 9.5). A base teórica inclui a BNCC (Competência Geral 5), Parecer CNE/CEB nº 2/2022, PL 2338/2023, UNESCO AI Competency Framework e pesquisas recentes sobre uso crítico de IA Generativa na educação.
