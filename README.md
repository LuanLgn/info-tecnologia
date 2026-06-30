# 🚗 Automação de Testes E2E — Portal Unidas

> Projeto de automação de testes desenvolvido como parte do processo seletivo para vaga de Analista de Qualidade (QA) Pleno.  
> Tecnologia: **Cypress 13** · JavaScript ES6+ · Node.js 22 · GitHub Actions CI/CD

---

## 📋 Sobre o Projeto

Este repositório contém a solução completa para o teste técnico proposto, cobrindo **todos os itens solicitados**:

| Item | Requisito | Entregável |
|:---:|---|---|
| 1 | Acessar www.unidas.com.br | Automatizado via `cy.visit()` |
| 2a | Local, Data e Hora de Retirada/Devolução | `HomePage.js` (Page Object) |
| 2b | Escolha do grupo de veículos | `VehicleSelectionPage.js` (Page Object) |
| 2c | Resumo / Proteções / Acessórios e Serviços | `SummaryPage.js` — 6 opcionais cobertos |
| 3 | Plano de Testes | [`Plano_de_Testes.md`](./Plano_de_Testes.md) |
| 4 | Evidências de Testes | `cypress/screenshots/` — gerado automaticamente |
| 5 | Relatório de Testes | [`Relatorio_de_Testes.md`](./Relatorio_de_Testes.md) |
| 6 | Automação de Testes (Opcional) | ✅ Suíte completa com 5 specs e CI/CD |

---

## 🏗️ Arquitetura

```
Info-tecnica/
├── cypress/
│   ├── e2e/                              # Especificações de teste (suítes)
│   │   ├── 01_fluxo_positivo.cy.js       # CT-001: Caminho Feliz — 13 cenários
│   │   ├── 02_validacao_datas.cy.js      # CT-002: Data devolução < retirada
│   │   ├── 03_bypass_url.cy.js           # CT-003: Bypass de URL / pulo de etapas
│   │   ├── 04_validacao_opcionais.cy.js  # CT-004/005: Opcionais + cenários negativos
│   │   └── 05_links_quebrados.cy.js      # CT-006: Varredura de links quebrados
│   ├── fixtures/
│   │   └── reserva.json                  # Massa de dados parametrizados
│   ├── support/
│   │   ├── commands.js                   # Comandos customizados globais
│   │   ├── e2e.js                        # Setup global
│   │   └── pages/                        # Page Object Model (POM)
│   │       ├── HomePage.js
│   │       ├── VehicleSelectionPage.js
│   │       └── SummaryPage.js
│   ├── screenshots/                      # Evidências geradas (gitignore)
│   └── videos/                           # Gravações MP4 (gitignore)
├── .github/
│   └── workflows/
│       └── cypress.yml                   # Pipeline CI/CD (GitHub Actions)
├── cypress.config.js                     # Configuração central do Cypress
├── package.json
├── Plano_de_Testes.md                    # Documentação: Plano de Testes
└── Relatorio_de_Testes.md               # Documentação: Relatório de Resultados
```

---

## 🧪 Cenários de Teste

### Positivos — CT-001 (13 cenários)
| ID | Cenário |
|---|---|
| CT-001.1 | Formulário de busca carregado |
| CT-001.2 | Autocomplete de lojas ao digitar cidade |
| CT-001.3 | Loja Aeroporto de Confins selecionada |
| CT-001.4 | Calendário de retirada exibido |
| CT-001.5 | Navegação para Passo 2 com listagem de veículos |
| CT-001.6 | Navegação para Passo 3 com resumo da reserva |
| CT-001.7 | Seção "Acessórios e Serviços" exibida |
| CT-001.8 | Cadeira de Bebê — valor recalculado |
| CT-001.9 | Assento de Elevação — valor recalculado |
| CT-001.10 | Bebê Conforto — valor recalculado |
| CT-001.11 | Locação Jovem — checkbox + valor recalculado |
| CT-001.12 | Lavagem Antecipada — checkbox + valor recalculado |
| CT-001.13 | Todos os opcionais + avanço para Passo 4 |

### Negativos — CT-002 a CT-006

| ID | Cenário | Técnica |
|---|---|---|
| CT-002.1 | Data de devolução anterior à retirada | `cy.intercept` — valida que nenhuma requisição é disparada |
| CT-002.2 | Botão Continuar com formulário incompleto | Assertion de URL sem redirecionamento |
| CT-003.1 | Bypass direto ao Passo 2 sem sessão | Acesso por URL + verificação de estado vazio |
| CT-003.2 | Bypass direto ao Passo 3 sem selecionar veículo | Acesso por URL + verificação de estado vazio |
| CT-003.3 | Bypass direto ao Passo 4 | Comportamento documentado |
| CT-003.4 | URL inexistente no domínio (404) | `failOnStatusCode: false` + asserção de fallback |
| CT-004.2–4 | Botão `+` incrementa quantidade | Assert `>= 1` |
| CT-005.1 | Botão `−` não vai abaixo de 0 | Clique 3x seguidos com assertion `>= 0` |
| CT-005.2 | **Injeção de valor negativo via JavaScript** | `dispatchEvent` no DOM — valor total deve permanecer positivo |
| CT-005.3 | Validação matemática do valor total | Captura estrutura completa: Diárias + Opcionais + Taxa 15% |
| CT-005.4 | Valor cresce progressivamente por opcional | Assertion encadeada a cada adição |
| CT-005.5 | Remoção de opcional diminui o valor | Assertion antes/depois com alias Cypress |
| CT-006.1 | Varredura de links internos | `cy.request()` em até 20 links — status `< 400` |
| CT-006.2 | Link do tarifário funcional | `cy.request()` no href |

---

## ⚙️ Como Executar

### Pré-requisitos
- Node.js 18 ou superior

### Instalação
```bash
npm install
```

### Executar todos os testes (modo headless)
```bash
npm run cypress:run
# ou
npx cypress run
```

### Executar com interface gráfica (modo interativo)
```bash
npm run cypress:open
# ou
npx cypress open
```

### Executar uma suíte específica
```bash
npx cypress run --spec "cypress/e2e/03_bypass_url.cy.js"
```

---

## 📸 Evidências Geradas Automaticamente

A cada execução, o Cypress gera:

- **Screenshots nomeados em português** em `cypress/screenshots/`, organizados por spec
- **Vídeo MP4 completo** em `cypress/videos/` — um por spec executado
- Cada screenshot usa `cy.screenshotFoco()` — comando customizado que recorta apenas o elemento em interação (não a página inteira)

---

## 🔧 Comandos Customizados

| Comando | Descrição |
|---|---|
| `cy.acceptCookies()` | Aceita o banner de cookies LGPD (OneTrust), se presente |
| `cy.screenshotFoco(nome, seletor, padding)` | Screenshot focado — usa `getBoundingClientRect` + `clip` |
| `cy.screenshotViewport(nome)` | Screenshot da viewport apenas (sem scroll full-page) |

---

## 🔄 CI/CD — GitHub Actions

O workflow `.github/workflows/cypress.yml` executa automaticamente a suíte completa a cada `push` ou `pull_request` na branch `master`, em ambiente Ubuntu com Node.js 22.

---

## 📚 Documentação Técnica

- [Plano de Testes](./Plano_de_Testes.md) — Estratégia, escopo, arquitetura e cenários mapeados
- [Relatório de Testes](./Relatorio_de_Testes.md) — Resultados, evidências e análise de defeitos

---

## 🛠️ Stack

| Tecnologia | Versão | Uso |
|---|---|---|
| Cypress | 13.x | Framework de automação E2E |
| Node.js | 22.x | Runtime |
| JavaScript | ES6+ | Linguagem dos testes |
| GitHub Actions | — | CI/CD pipeline |
