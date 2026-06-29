# Plano de Testes: Fluxo de Reserva - Portal Unidas (Cypress Avançado)

Este documento apresenta o planejamento, a estratégia e a arquitetura técnica para a validação do fluxo de reserva de veículos no portal da **Unidas** (https://www.unidas.com.br). O foco do projeto foi estabelecido exclusivamente na plataforma de testes modernos **Cypress**, implementando padrões de arquitetura corporativos de nível Pleno/Sênior, incluindo cenários robustos de testes negativos e de contorno.

---

## 1. Introdução e Objetivo
O objetivo principal deste plano é estruturar a validação automatizada e manual do fluxo de reserva de carros da Unidas. A arquitetura de testes foi concebida para ser altamente manutenível, resiliente contra instabilidades de rede (flakiness), integrada a esteiras de Integração Contínua (CI/CD) e altamente defensiva contra entradas inválidas do usuário.

---

## 2. Escopo dos Testes
Os testes validam o fluxo de ponta a ponta ("Caminho Feliz"), regras acessórias e cenários negativos de estresse e segurança:
1.  **Página Inicial (Busca):**
    *   Preenchimento e seleção do autocomplete do campo de "Loja de retirada".
    *   Preenchimento de datas dinâmicas e horários.
2.  **Página de Seleção de Veículos (Passo 2):**
    *   Tratamento de banner de cookies (LGPD).
    *   Seleção de grupos de veículos.
3.  **Página de Resumo, Proteções e Opcionais (Passo 3):**
    *   Validação assertiva dos dados selecionados (grupo de veículo e loja correspondente).
    *   Adição de múltiplos opcionais (GPS, Bebê Conforto e Condutor Adicional).
    *   Asserção sobre o recálculo dinâmico do preço total.
4.  **Cenários Negativos e Resiliência (Segurança & UX):**
    *   Injeção de valores negativos em quantidades de opcionais.
    *   Inversão cronológica de datas no formulário de busca.
    *   Bypass/Quebra de fluxo via acesso direto a URLs secundárias.
    *   Auditoria de links quebrados (Broken Links) no portal.

---

## 3. Estratégia e Arquitetura de Automação (Cypress Pleno)
A fim de garantir a conformidade com as melhores práticas de QA Engineering do mercado, a automação foi desenhada utilizando os seguintes pilares arquiteturais:

### 3.1. Page Object Model (POM)
Os seletores e ações foram divididos e encapsulados por telas, impedindo o acoplamento de seletores nos testes e garantindo manutenibilidade:
*   `HomePage.js`: Controla as interações do widget de busca de reservas.
*   `VehicleSelectionPage.js`: Controla a aceitação de cookies e seleção do veículo.
*   `SummaryPage.js`: Gerencia as asserções de integridade do resumo, seleção de adicionais (GPS, Cadeirinhas, Condutor) e botões de avanço.

### 3.2. Data-Driven Testing (Fixtures)
Toda a massa de dados utilizada na execução dos testes (nomes de lojas, horários, filtros de grupos) foi extraída do código e isolada em um arquivo JSON parametrizado (`cypress/fixtures/reserva.json`).

### 3.3. Comandos Customizados (Custom Commands)
Ações reutilizáveis e transversais à aplicação foram desenvolvidas em `cypress/support/commands.js`. O comando customizado principal implementado foi o `cy.acceptCookies()`, garantindo tratamento robusto para o consentimento de cookies da LGPD.

### 3.4. Controle Dinâmico de Rede (`cy.intercept`)
Para evitar esperas estáticas de tempo, o projeto intercepta chamadas assíncronas do backend (`cy.intercept`) de autocomplete de lojas e de seleção de grupos, aguardando que as requisições HTTP retornem status `200 OK` antes de seguir com as interações visuais.

### 3.5. Integração Contínua (DevOps QA)
O projeto acompanha um workflow pré-configurado do GitHub Actions (`.github/workflows/cypress.yml`) para executar os testes em modo headless em ambiente Linux a cada commit/pull request, gerando relatórios de execução e salvando capturas de tela e vídeos em caso de falha.

---

## 4. Cenários de Teste Mapeados

### 4.1. Cenários Positivos (Caminho Feliz)

#### CT-001: Fluxo Principal de Reserva (Confins) com Adição de Múltiplos Opcionais
*   **Objetivo:** Validar o fluxo de reserva do preenchimento da busca até a visualização correta do resumo com adição de todos os opcionais de acessórios e serviços disponíveis.
*   **Massa de Teste (Via Fixture):**
    *   Loja: `Aeroporto De Confins`
    *   Data: Retirada para amanhã, devolução para +3 dias.
    *   Grupo de veículo esperado: `Grupo AM`
*   **Passos (Automatizados por POM):**
    1. Acessar https://www.unidas.com.br.
    2. Pesquisar e selecionar a loja parametrizada.
    3. Definir datas e horários dinâmicos.
    4. Submeter busca.
    5. Aceitar o consentimento de cookies.
    6. Selecionar o grupo de veículos parametrizado.
    7. Validar a tela do Passo 3.
    8. Adicionar Motorista Adicional, GPS e Assento Infantil.
    9. Validar que o valor total sofreu acréscimo tarifário dinamicamente.
    10. Avançar para a tela de Identificação.
*   **Resultado Esperado:** Transição perfeita de telas, incremento dinâmico correto no valor total com a inclusão de opcionais e direcionamento ao Passo 4.

---

### 4.2. Cenários Negativos e de Contorno (Pleno/Sênior)

#### CT-002: Bypass de URL (Acesso Direto Sem Sessão)
*   **Objetivo:** Validar a resiliência do sistema e controle de sessão ao tentar pular etapas de reserva digitando diretamente as URLs dos passos seguintes.
*   **Passos:**
    1. Abrir uma aba limpa do navegador (sem histórico/cookies da Unidas ativos).
    2. Acessar diretamente a URL: `https://www.unidas.com.br/reserva/passo-2` ou `https://www.unidas.com.br/reserva/passo-3`.
*   **Resultado Esperado:** O sistema deve detectar a ausência de dados de pesquisa ativos no estado da aplicação (ou sessionStorage/cookies) e redirecionar o usuário imediatamente para a Home Page (`/`) ou exibir uma mensagem clara informando que a sessão expirou.

#### CT-003: Entrada de Quantidades Negativas em Opcionais
*   **Objetivo:** Garantir que o sistema impeça a entrada de quantidades inválidas ou negativas nos inputs de acessórios (ex: `-1` assento infantil).
*   **Passos:**
    1. Avançar no fluxo de testes até o Passo 3 (Resumo e Opcionais).
    2. Tentar inserir via teclado um valor negativo (ex: `-1`, `-5`) nos campos de input numérico de opcionais ou inspecionar o código e alterar o atributo `value` para valores negativos.
*   **Resultado Esperado:** O sistema não deve processar reduções de valores no preço total da reserva, bloquear caracteres especiais/negativos nos inputs, ou forçar o valor mínimo do campo de volta para zero (ou desabilitar o botão de decrementar).

#### CT-004: Inconsistência Cronológica de Datas (Devolução Menor que Retirada)
*   **Objetivo:** Impedir reservas em períodos cronologicamente inválidos (ex: data de devolução anterior à data de retirada).
*   **Passos:**
    1. Acessar a página inicial.
    2. Selecionar a data de retirada (ex: 15 de Julho).
    3. Clicar no calendário de devolução e tentar selecionar uma data anterior (ex: 12 de Julho).
    4. Caso o calendário não bloqueie o clique, tentar submeter a busca.
*   **Resultado Esperado:** O portal deve desabilitar visualmente no calendário todos os dias anteriores ao da retirada ou ajustar automaticamente a devolução para a data da retirada + 1 dia, ou exibir um alerta de validação bloqueando a submissão.

#### CT-005: Auditoria de Links e Botões Funcionais (Links Quebrados)
*   **Objetivo:** Garantir que todos os caminhos institucionais ou de cabeçalho sejam funcionais, mitigando erros 404 que quebram a experiência do usuário.
*   **Passos:**
    1. Fazer uma varredura geral de links (`a[href]`) nas seções do cabeçalho e rodapé.
    2. Clicar ou testar a resposta HTTP de cada link.
*   **Resultado Esperado:** Todos os redirecionamentos devem retornar status code `200 OK` (ou códigos 3xx válidos), sem apresentar erros de página inexistente (404) ou erros internos de servidor (500).

---

## 5. Ferramentas e Ambiente
*   **Framework Principal:** Cypress (v13+)
*   **Ambiente de Execução:** Node.js (v18+)
*   **Linguagem de Automação:** JavaScript (ES6+)
*   **Configuração Global:** [cypress.config.js](file:///c:/Users/luant/OneDrive/Documentos/Info-tecnica/cypress.config.js)
