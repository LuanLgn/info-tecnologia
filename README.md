Este repositório contém a suíte de testes E2E (End-to-End) e a documentação técnica da automação realizada no portal Unidas (Projeto InfoTecnologia).

O escopo do projeto vai além da automação de fluxos funcionais, incluindo:
- Testes exploratórios e cenários de borda (bypass de rotas)
- Validação matemática e lógica no front-end (cálculos de opcionais, diárias e taxas)
- Varredura de links quebrados em ambiente de produção
- Documentação e mapeamento de inconsistências estruturais no front-end (Angular Material)

Durante a análise da aplicação foram desenhados e executados 27 cenários de teste. O saldo da automação resultou em:
- 13 Cenários Positivos (Caminho Feliz) validados com sucesso
- 14 Cenários Negativos / Borda testados
- 4 Validações de segurança em navegação (Bypass URL) 100% protegidas pela aplicação
- 1 Defeito (Bug) de UI mapeado na estrutura do Angular Material
- Cobertura de testes E2E estruturada com Cypress + Page Object Model (POM)

### Arquitetura de Automação
A automação foi estruturada utilizando Cypress com padrão Page Object Model (POM), garantindo escalabilidade e manutenção. Os dados e fixtures foram isolados da lógica dos testes.

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

**CT-003 — Bypass de URL (Segurança de Rotas)**
- **Objetivo:** Tentar acessar rotas dos Passos 2, 3 e 4 do fluxo de reserva diretamente pela URL, sem possuir uma sessão ou preencher os dados anteriores.
- **Resultado:** A aplicação trata o fluxo de forma segura. Nenhuma falha de IDOR ou exposição foi encontrada. O sistema aplica o "fallback" corretamente, redirecionando para páginas seguras ou de erro.

**CT-005 — Injeção JS e Botões Negativos**
- **Objetivo:** Forçar a adição de valores negativos nos acessórios via painel e injeção de eventos JS (`dispatchEvent`).
- **Resultado:** A aplicação possui regras sólidas no DOM e não vai abaixo de `0`. O valor total da locação permanece positivo e a lógica matemática de `Diárias + Opcionais + 15% Taxa` não é corrompida.

### Code Review — Defeitos Encontrados (Frontend / UI)

**DEF-001 — Botão '+' nos opcionais com quantidade (Medium)**
- **Problema:** O seletor do botão '+' nos opcionais (Cadeira de Bebê, Bebê Conforto) não localiza o elemento Angular Material de forma acessível. 
- **Causa Raiz:** O Angular renderiza o ícone como `<mat-icon>add</mat-icon>` dentro de um botão genérico sem atributo `aria-label` ou `id` claro para automação ou acessibilidade. A busca depende da estrutura exata do nó da árvore (quebrando os testes frequentemente quando o layout muda).

### Casos de Teste (QA Evidence)

**CT-001.13 — Todos os opcionais + avanço Passo 4**
- **Pré-condição:** Usuário acessa o formulário de reserva na Home.
- **Passos:** 
  1. Preencher Aeroporto de Confins, datas e horas.
  2. Escolher o grupo de veículo.
  3. Adicionar opcionais: Cadeira de Bebê, Lavagem Antecipada e Locação Jovem.
- **Resultado esperado:** Valor recálculado a cada clique, permitindo fechar a reserva.
- **Resultado observado:** O fluxo de fechamento e cálculos foi executado e aprovado com sucesso.

**CT-002.1 — Data de devolução anterior à retirada**
- **Resultado esperado:** O backend não deve ser estressado com datas ilógicas. O front deve barrar.
- **Resultado observado:** Validado utilizando `cy.intercept`. Nenhuma requisição HTTP é disparada ao tentar preencher o formulário no formato inválido.

### Mapeamento de Bugs 

| Módulo | Problema | Severidade |
| :--- | :--- | :--- |
| Opcionais (Angular) | O seletor do botão "+" nos acessórios usa ícone puro sem label de acessibilidade (mat-icon) | Média |

### Considerações finais
Neste projeto, atuei como QA com uma abordagem moderna e ofensiva de qualidade, indo além da automação tradicional de testes.

Minha análise incluiu:
- automação de testes E2E com Cypress (Page Object Model)
- análise de segurança estrutural com testes de bypass de URLs
- investigação de comportamento da aplicação em runtime (foco em injeção JavaScript e limites no carrinho)
- mapeamento de falhas de acessibilidade e seletores (Angular Material)
- validação matemática complexa em formulários dinâmicos

O objetivo não foi apenas validar funcionalidades (o chamado "Happy Path"), mas sim simular uma análise real de qualidade em ambiente de produção, identificando riscos na arquitetura front-end e atestando a integridade das regras de negócio.

### Relatório complementar
A documentação completa do Plano de Testes e os resultados detalhados estão anexados à documentação deste repositório.

### Encerramento
Obrigado pela oportunidade de participar do desafio técnico. Fico à disposição para os próximos passos.
