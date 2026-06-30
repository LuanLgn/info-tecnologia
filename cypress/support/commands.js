// cypress/support/commands.js
// Comandos customizados úteis pro nosso dia a dia de QA

/**
 * cy.acceptCookies()
 * Aceita o banner de cookies LGPD da Unidas (OneTrust), se presente.
 */
Cypress.Commands.add('acceptCookies', () => {
  cy.get('body').then(($body) => {
    const selector = '#onetrust-accept-btn-handler';
    if ($body.find(selector).length > 0) {
      cy.get(selector).click({ force: true });
      cy.log('Cookies aceitos com sucesso.');
    } else {
      cy.log('Banner de cookies não visível nesta execução.');
    }
  });
});

/**
 * cy.screenshotFoco(nomeArquivo, seletor)
 * Tira um print mais focado num elemento específico.
 * Calcula automaticamente as dimensões e posição do elemento via getBoundingClientRect()
 * e usa a opção `clip` do Cypress para capturar apenas aquela área + padding de contexto.
 *
 * @param {string} nomeArquivo  - Nome do arquivo de screenshot (sem extensão)
 * @param {string} seletor      - Seletor CSS do elemento a ser destacado
 * @param {number} [padding=60] - Espaço em pixels ao redor do elemento (contexto visual)
 *
 * @example
 * cy.screenshotFoco('CT001-02_campo_loja_preenchido', 'input[placeholder*="retirada"]');
 * cy.screenshotFoco('CT002-01_opcao_cadeira', '.card-opcional', 80);
 */
Cypress.Commands.add('screenshotFoco', (nomeArquivo, seletor, padding = 60) => {
  cy.get(seletor).first().scrollIntoView().then(($el) => {
    const rect = $el[0].getBoundingClientRect();

    // Calcula a área de clip com padding ao redor do elemento
    const x      = Math.max(0, rect.left   - padding);
    const y      = Math.max(0, rect.top    - padding);
    const width  = Math.min(Cypress.config('viewportWidth'),  rect.width  + padding * 2);
    const height = Math.min(Cypress.config('viewportHeight'), rect.height + padding * 2);

    cy.screenshot(nomeArquivo, {
      capture: 'viewport',
      clip: { x, y, width, height },
    });
  });
});

/**
 * cy.screenshotViewport(nomeArquivo)
 * Tira um print só da parte visível da tela.
 * Use para prints de estado geral onde não há um único elemento de foco.
 *
 * @param {string} nomeArquivo - Nome do arquivo de screenshot
 */
Cypress.Commands.add('screenshotViewport', (nomeArquivo) => {
  cy.screenshot(nomeArquivo, { capture: 'viewport' });
});
