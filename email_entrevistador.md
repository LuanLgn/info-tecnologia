# 📧 E-mail para o Entrevistador

**Assunto:** Entrega de Projeto – Automação de Testes E2E com Cypress | Luan Tedeschi

---

Prezado(a) [Nome do Entrevistador / Equipe de Seleção],

Meu nome é Luan Tedeschi e estou enviando, conforme solicitado, o projeto de automação de testes desenvolvido como parte do processo seletivo para a vaga de Analista de Qualidade Pleno.

---

## 🎯 Sobre o Projeto

O projeto consiste em uma **suíte de testes E2E (End-to-End)** automatizados utilizando **Cypress** para validar o fluxo completo de reserva de veículos no portal [Unidas](https://www.unidas.com.br), desde a pesquisa inicial até a adição de opcionais (Motorista Adicional, GPS e Bebê Conforto).

---

## 🏗️ Arquitetura e Padrões Utilizados

O projeto foi desenvolvido seguindo padrões e práticas de nível **Pleno/Sênior em QA**:

| Padrão | Implementação |
|---|---|
| **Page Object Model (POM)** | Cada tela da aplicação é representada por uma classe (`HomePage.js`, `VehicleSelectionPage.js`, `SummaryPage.js`), isolando os seletores e ações da lógica dos testes |
| **Data-Driven Testing** | Dados de entrada centralizados em `cypress/fixtures/reserva.json`, permitindo parametrização sem alterar o código dos testes |
| **Comandos Customizados** | Comando `cy.acceptCookies()` criado em `commands.js` para reutilização global |
| **Controle de Rede** | `cy.intercept()` utilizado para monitorar e aguardar chamadas de API, eliminando waits arbitrários |
| **Validação Dinâmica** | Assertion matemática que captura o valor inicial, adiciona opcionais e valida que o valor total aumentou, garantindo a integridade do cálculo da aplicação |
| **CI/CD** | Workflow do GitHub Actions configurado (`.github/workflows/cypress.yml`) para execução automatizada a cada push |

---

## 📁 Estrutura do Repositório

```
Info-tecnica/
├── cypress/
│   ├── e2e/
│   │   └── reserva_unidas.cy.js        # Especificação do teste principal
│   ├── fixtures/
│   │   └── reserva.json               # Massa de dados parametrizados
│   ├── support/
│   │   ├── commands.js                # Comandos customizados globais
│   │   ├── e2e.js                     # Configurações globais do teste
│   │   └── pages/                     # Page Object Model
│   │       ├── HomePage.js
│   │       ├── VehicleSelectionPage.js
│   │       └── SummaryPage.js
│   ├── screenshots/                   # Evidências (prints) geradas automaticamente
│   └── videos/                        # Gravação completa do teste em MP4
├── .github/
│   └── workflows/
│       └── cypress.yml               # Pipeline de CI/CD (GitHub Actions)
├── cypress.config.js                  # Configuração central do Cypress
├── package.json                       # Dependências e scripts
├── Plano_de_Testes.md                 # Documentação: Plano de Testes
└── Relatorio_de_Testes.md             # Documentação: Relatório de Resultados
```

---

## 🧪 Cenários de Teste Implementados

### ✅ Cenário Positivo — Fluxo Completo (Caminho Feliz)
Reserva completa com seleção de veículo e adicionais de:
- Motorista/Condutor Adicional
- GPS
- Bebê Conforto / Assento Infantil

### ❌ Cenários Negativos (Testes de Resiliência)
1. **Bypass de URL** — Acesso direto ao Passo 2 sem preencher o formulário
2. **Quantidades Inválidas** — Inserção de valores negativos nos opcionais
3. **Inversão Cronológica de Datas** — Data de devolução anterior à data de retirada
4. **Varredura de Links Quebrados** — Validação de todos os links da página inicial

---

## 📸 Evidências Geradas

O Cypress gera automaticamente, a cada execução:
- **15 capturas de tela** nomeadas em português, cobrindo cada etapa do fluxo
- **1 vídeo MP4** com a gravação completa da sessão de testes

---

## ▶️ Como Executar

### Pré-requisitos
- Node.js 18+

### Instalação
```bash
npm install
```

### Executar em modo headless (linha de comando)
```bash
npm run cypress:run
```

### Executar em modo interativo (interface gráfica)
```bash
npm run cypress:open
```

---

Fico à disposição para demonstrar o projeto ao vivo, explicar as decisões técnicas tomadas ou esclarecer qualquer dúvida.

Agradeço a atenção e aguardo retorno.

Atenciosamente,
**Luan Tedeschi**
📧 [seu-email@email.com]
📱 [seu-telefone]
🔗 [linkedin.com/in/seu-perfil]

---
*Projeto desenvolvido com Cypress 13 · Node.js 22 · JavaScript ES6+*
