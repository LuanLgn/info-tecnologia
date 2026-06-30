Este repositório contém a suíte de testes E2E (End-to-End) e a documentação técnica da auditoria realizada na plataforma InfoTecnologia.

O escopo do projeto vai além da automação de fluxos funcionais, incluindo:
- Testes exploratórios com foco em regras de negócio de fluxo de aluguel (carrinho, datas, opcionais)
- Validação do motor de cálculos dinâmico (soma de diárias, taxas e equipamentos extras)
- Mapeamento de falhas de segurança de rotas e inconsistências no Frontend
- Documentação de bugs estruturais com impacto real no sistema

Durante a análise da aplicação foram identificados:
- 2 Vulnerabilidades de controle de sessão (bypass direto para rotas de fechamento sem preencher dados)
- 4 bugs de lógica matemática e persistência de carrinho
- 3 problemas de UX (seletores Angular Material falhos)
- Cobertura de testes E2E com Cypress + Page Object Model (POM)

### Arquitetura de Automação
A automação foi estruturada utilizando Cypress com padrão Page Object Model (POM), garantindo escalabilidade e manutenção.

```
cypress/e2e/
├── pages/
│   ├── HomePage.js
│   ├── VehicleSelectionPage.js
│   └── SummaryPage.js
│
├── specs/
│   ├── 01_fluxo_positivo.cy.js
│   ├── 02_validacao_datas.cy.js
│   ├── 03_bypass_url.cy.js
│   ├── 04_validacao_opcionais.cy.js
│   └── 05_links_quebrados.cy.js
```

### Análise de Segurança & Regras de Negócio

**SEC-001 — Bypass de fluxo via URL**
- **Resultado Esperado:** O sistema deve validar a sessão e dados em memória, barrando o acesso direto a etapas finais do funil (ex: Passo 3) sem ter selecionado os itens anteriores.
- **Resultado Obtido:** Permite o carregamento da página de resumo sem dados no backend, gerando instabilidade na aplicação.

**SEC-002 — Validação Tardia de Datas**
- **Resultado Esperado:** Barrar o input de devolução menor que o de retirada imediatamente no frontend.
- **Resultado Obtido:** O sistema aceita a entrada visualmente e apenas trava (ou anula) nas etapas seguintes.

**SEC-003 — Manipulação de Inputs Quantitativos**
- **Descrição:** Inputs de adição de acessórios não possuem sanitização contra números negativos injetados via Console/JS (`dispatchEvent`).
- **Resultado:** A requisição é enviada para validação. Felizmente, o backend anula os valores, impedindo um cálculo negativo no carrinho.

### Code Review — Erros de Lógica (Frontend / UI)

- **ERR-01 — Seletores Ocultos (Angular):** O botão de `+` de opcionais (como "Assento de Elevação") embute um ícone `<mat-icon>` que não dispara o evento caso clicado na borda. 
- **ERR-02 — Empty State com Delay:** Adicionar e remover acessórios causa recálculos agressivos na árvore do DOM, resultando em flickering (tela piscando).
- **ERR-03 — Fluxo de erro "Silencioso":** Tentar pular para uma URL 404 redireciona para um fallback não padronizado, quebrando os estilos da página principal.

### Casos de Teste (QA Evidence)

**TC-FLUXO-001 — Fluxo Positivo Completo**
*Pré-condição: Usuário não autenticado na página principal*
Passos:
1. Buscar local de retirada (Ex: Confins) e data.
2. Avançar para o painel de veículos.
3. Escolher o primeiro veículo e prosseguir.
4. Adicionar opcional (Lavagem Antecipada) na aba de serviços.
- **Resultado esperado:** Valor somado com sucesso, avançando para a tela final de identificação do motorista.
*(Evidência)*


**TC-SEC-001 — Bypass de URL de Resumo**
*Pré-condição: Sem sessão de reserva ativa.*
Passos:
1. Acessar diretamente a rota do Passo 3 de resumo.
- **Resultado esperado:** Bloqueio e redirect.
- **Resultado observado:** O layout carrega vazio ou quebrado.
*(Evidência)*


### Mapeamento de Bugs 

| Módulo | Problema |
| :--- | :--- |
| Busca | Permite data de devolução anterior à de retirada visualmente |
| URL | Rotas de fechamento sem proteção de estado `Guard` |
| Resumo | Layout quebra se acessado diretamente |
| Opcionais | Botão (+) possui hitbox menor do que aparenta visualmente |

### Considerações finais
Neste projeto, atuei como QA com uma abordagem moderna e ofensiva de qualidade, indo além da automação tradicional de testes.

Minha análise incluiu:
- automação de testes E2E com Cypress (Page Object Model)
- análise de validações matemáticas do carrinho de compras
- investigação de vulnerabilidades de sessão e rotas
- identificação de inconsistências estruturais e falhas de UX
- validação de fluxos críticos e regras de negócio complexas

O objetivo não foi apenas validar funcionalidades, mas sim simular uma análise real de qualidade em ambiente de produção, identificando riscos funcionais, estruturais e de negócios.

### Relatório complementar
A documentação completa dos testes manuais, exploratórios e achados funcionais está disponível no Relatório de Testes anexado a este repositório.

### Encerramento
Obrigado pela oportunidade de participar do desafio técnico. Fico à disposição para os próximos passos.
