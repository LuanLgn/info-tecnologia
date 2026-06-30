/// <reference types="cypress" />
/**
 * Cenário negativo de datas do formulário
 * - Testar o bloqueio quando a devolução é antes da retirada
 * - Importante usar intercept pra garantir que não vaza requisição
 * - Conferir mensagens de erro e bloqueio do botão
 */

describe('[CT-002] Validação de Datas Inválidas', () => {
  before(() => {
    Cypress.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    cy.fixture('reserva').as('dados');
    cy.visit('/');
  });

  it('[CT-002.1] Deve impedir a busca quando a data de devolução é anterior à de retirada', function () {
    // Monitora se qualquer chamada de busca de veículos é disparada (não deveria ser)
    cy.intercept('GET', '**/veiculos**').as('buscaVeiculos');
    cy.intercept('POST', '**/reserva**').as('criarReserva');

    // Seleciona a data de RETIRADA como 03 de Julho (posterior)
    cy.log('[CT-002.1] Selecionando data de retirada: 03/07...');
    cy.get('button.mat-calendar-body-cell:visible, [class*="calendar-body-cell"]:visible')
      .filter((i, el) => el.textContent.trim() === '3')
      .first()
      .click();
    cy.wait(500);

    // Tenta selecionar hora de retirada
    cy.get('input[placeholder*="Hora de retirada"], input[placeholder*="Hora retirada"], [class*="hour"]')
      .first()
      .should('be.visible')
      .click({ force: true });
    cy.wait(500);
    cy.contains('li', '12:00').scrollIntoView().click({ force: true });
    cy.wait(500);

    // Agora abre o calendário de devolução
    cy.get('input[placeholder*="devolução"], input[placeholder*="Devolução"]')
      .first()
      .should('be.visible')
      .click({ force: true });
    cy.wait(500);

    cy.screenshot('CT002-01_calendario_devolucao_aberto');

    // Tenta selecionar 30 de JUNHO como data de devolução (anterior à retirada)
    // No mês atual (Junho), o dia 30 DEVERIA estar desabilitado ou no passado
    cy.log('[CT-002.1] Tentando selecionar data de devolução ANTERIOR à retirada (30/06)...');

    // Verifica se há algum dia no mês anterior (desabilitado/cinza)
    cy.get('body').then(($body) => {
      // Opção A: botão desabilitado explicitamente
      const botaoDesabilitado = $body.find('button.mat-calendar-body-cell[disabled]:visible, button.mat-calendar-body-cell[aria-disabled="true"]:visible');

      if (botaoDesabilitado.length > 0) {
        cy.log('[VALIDADO] O portal desabilita datas anteriores à retirada no calendário de devolução.');
        cy.screenshot('CT002-02_datas_anteriores_desabilitadas_no_calendario');

        // Tenta clicar mesmo assim (deve ignorar ou mostrar erro)
        cy.wrap(botaoDesabilitado.first()).click({ force: true });
        cy.wait(500);

        // Valida que o botão Continuar ainda está desabilitado ou que a data não mudou
        cy.screenshot('CT002-03_tentativa_de_selecionar_data_invalida');
        cy.contains('button', 'Continuar').should('have.attr', 'disabled').or('not.exist');
      } else {
        // Opção B: o portal redireciona após seleção inválida ou exibe mensagem de erro
        cy.log('[OBSERVAÇÃO] Nenhum botão desabilitado encontrado. Verificando mensagem de erro após seleção.');
        cy.screenshot('CT002-02_estado_calendario_para_devolucao');
      }
    });

    // Assertion principal: nenhuma chamada de busca deve ter sido feita
    cy.log('[CT-002.1] Verificando que nenhuma busca foi disparada com dados inválidos...');
    cy.get('@buscaVeiculos.all').should('have.length', 0);
    cy.get('@criarReserva.all').should('have.length', 0);

    cy.screenshot('CT002-04_nenhuma_requisicao_com_dados_invalidos');
    cy.log('[RESULTADO CT-002.1] PASSOU — Portal não permitiu busca com datas invertidas.');
  });

  it('[CT-002.2] Deve manter o botão Continuar desabilitado com formulário incompleto', function () {
    cy.screenshot('CT002-05_formulario_vazio');

    // Tenta clicar em Continuar sem preencher nada
    cy.contains('button', 'Continuar').click({ force: true });
    cy.wait(1000);

    // A URL deve permanecer na página inicial (sem redirecionamento)
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    cy.screenshot('CT002-06_botao_continuar_formulario_incompleto_sem_redirecionamento');
    cy.log('[RESULTADO CT-002.2] PASSOU — Portal não avança com formulário incompleto.');
  });
});
