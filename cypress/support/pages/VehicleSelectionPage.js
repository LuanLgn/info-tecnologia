class VehicleSelectionPage {
  elementos = {
    cookieAcceptButton: () => cy.get('#onetrust-accept-btn-handler')
  }

  aceitarCookies() {
    cy.acceptCookies();
    return this;
  }

  escolherGrupo(grupo) {
    cy.log(`Selecionando o grupo de veículos: ${grupo}...`);
    // Localiza o container do veículo (ex: .rental__item, .card-veiculo, etc.) contendo o texto do grupo
    cy.contains('.rental__item, .card-veiculo, [class*="card"], [class*="item"], div', grupo)
      .should('be.visible')
      .scrollIntoView()
      .within(() => {
        // Encontra o primeiro botão contido no card, independente de rótulos específicos como "Escolher grupo" ou "Selecionar"
        cy.get('button, a[role="button"], .btn, [class*="btn"]').first().click({ force: true });
      });
      
    return this;
  }
}

export default new VehicleSelectionPage();
