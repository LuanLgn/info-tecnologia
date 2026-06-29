class HomePage {
  elementos = {
    campoLoja: () => cy.get('input.store, input[placeholder*="retirada"], .loja-retirada input').first(),
    sugestoesLojas: () => cy.get('.stores, .suggestions, body'),
    
    campoDataRetirada: () => cy.get('input[placeholder*="retirada"], input[placeholder*="Retirada"]').first(),
    campoHoraRetirada: () => cy.get('input[placeholder*="Hora de retirada"], input[placeholder*="Hora retirada"], [class*="hour"]').first(),
    
    campoDataDevolucao: () => cy.get('input[placeholder*="devolução"], input[placeholder*="Devolução"]').first(),
    campoHoraDevolucao: () => cy.get('input[placeholder*="Hora de devolução"], input[placeholder*="Hora devolução"]').first(),
    
    listaHorarios: () => cy.get('ul.hours-list, .hours-picker, body'),
    botaoContinuar: () => cy.contains('button', 'Continuar')
  }

  visitar() {
    cy.visit('/');
    return this;
  }

  buscarLoja(local, lojaEsperada) {
    // Intercepta a chamada de autocomplete de lojas para controle de rede (Nível Pleno)
    cy.intercept('GET', '**/lojas**').as('apiLojas');
    cy.intercept('GET', '**/autocomplete**').as('apiAutocomplete');

    this.elementos.campoLoja()
      .should('be.visible')
      .click({ force: true })
      .type(local, { delay: 100 });

    // Aguarda e clica na sugestão
    cy.get('body').then(($body) => {
      cy.wait(500); // Pequena pausa para requisição iniciar
      cy.contains(lojaEsperada).should('be.visible').click({ force: true });
    });
    return this;
  }

  selecionarDataRetirada() {
    cy.log('Selecionando data de retirada (30 de Junho)...');
    const cellSelector = 'button.mat-calendar-body-cell:visible, [class*="calendar-body-cell"]:visible';
    
    // Clica no dia 30 no calendário de retirada
    cy.get(cellSelector)
      .filter((i, el) => el.textContent.trim() === '30')
      .first()
      .click();

    cy.wait(500);
    return this;
  }

  selecionarHoraRetirada(hora) {
    cy.log(`Selecionando hora de retirada (${hora})...`);
    this.elementos.campoHoraRetirada().should('be.visible').click({ force: true });
    cy.wait(500);
    
    // Rola a opção de hora no dropdown (evita falha se estiver fora da área visível do container com overflow)
    cy.contains('ul.hours-list li, .hours-picker li, li', hora)
      .scrollIntoView()
      .click({ force: true });
      
    cy.wait(500);
    return this;
  }

  selecionarDataDevolucao() {
    cy.log('Abrindo calendário de devolução...');
    this.elementos.campoDataDevolucao().should('be.visible').click({ force: true });
    cy.wait(500);

    // Como a retirada foi em 30 de Junho (último dia do mês), o calendário de devolução
    // abre automaticamente exibindo o mês subsequente (Julho). Portanto, não precisamos
    // avançar o mês e clicamos diretamente no dia 3.
    cy.log('Selecionando data de devolução (3 de Julho)...');
    const cellSelector = 'button.mat-calendar-body-cell:visible, [class*="calendar-body-cell"]:visible';
    cy.get(cellSelector)
      .filter((i, el) => el.textContent.trim() === '3')
      .first()
      .click();

    cy.wait(500);
    return this;
  }

  selecionarHoraDevolucao(hora) {
    cy.log(`Selecionando hora de devolução (${hora})...`);
    this.elementos.campoHoraDevolucao().should('be.visible').click({ force: true });
    cy.wait(500);
    
    // Rola a opção de hora no dropdown
    cy.contains('ul.hours-list li, .hours-picker li, li', hora)
      .scrollIntoView()
      .click({ force: true });
      
    cy.wait(500);
    return this;
  }

  confirmarBusca() {
    this.elementos.botaoContinuar().should('be.visible').click();
  }
}

export default new HomePage();
