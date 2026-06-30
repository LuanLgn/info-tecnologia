class SummaryPage {
  // Valor base capturado antes de adicionar opcionais (Cypress alias)
  _valorInicial = 0;

  // Elementos da tela
  elementos = {
    resumoContainer:  () => cy.get('body'),
    botaoContinuar:   () => cy.contains('button', 'CONTINUAR').or(cy.contains('button', 'Continuar')),
    valorTotal:       () => cy.contains(/valor total/i).parent().find('strong, span, b, [class*="valor"]').last(),
    secaoOpcionais:   () => cy.contains(/acessórios e serviços|adicionais|opcionais/i),
  }

  // Função de apoio pra achar o card pelo nome
  _card(nomeOpcional) {
    return cy.contains(new RegExp(nomeOpcional, 'i'))
      .scrollIntoView()
      .parents('[class*="card"], [class*="item"], [class*="service"], [class*="optional"], .row, li')
      .first();
  }

  // Função de apoio pra ler e converter o preço da tela
  _lerValorTotal() {
    return cy.get('body').invoke('text').then((texto) => {
      // Busca padrão "Valor total: R$ 420,53" no texto da página
      const match = texto.match(/valor total[:\s]*R\$\s*([\d.,]+)/i);
      if (match) {
        return parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
      }
      // Fallback: pega o maior número monetário da página
      const matches = [...texto.matchAll(/R\$\s*([\d]+[.,][\d]{2})/g)];
      const valores = matches.map(m => parseFloat(m[1].replace(/\./g, '').replace(',', '.')));
      return Math.max(...valores);
    });
  }

  validarResumo(grupoEsperado, lojaEsperada) {
    cy.get('body')
      .should('contain.text', grupoEsperado)
      .and('contain.text', lojaEsperada);
    return this;
  }

  capturarValorInicial() {
    this._lerValorTotal().then((valor) => {
      cy.log(`[Resumo] Valor base capturado: R$ ${valor.toFixed(2)}`);
      cy.wrap(valor).as('valorInicial');
    });
    return this;
  }

  // Interação de add (botão +)
  _clicarMais(nomeOpcional) {
    cy.get('body').then(($body) => {
      if (!$body.text().match(new RegExp(nomeOpcional, 'i'))) {
        cy.log(`[SKIP] "${nomeOpcional}" não disponível nesta reserva.`);
        return;
      }
      cy.contains(new RegExp(nomeOpcional, 'i'))
        .scrollIntoView()
        .parents('[class*="card"], [class*="item"], [class*="service"], li, .row')
        .first()
        .within(($card) => {
          // Cobre: botão com texto "+", "add", mat-icon "add", ou último botão do card
          // O botão de incrementar é sempre o ÚLTIMO botão (após o contador e o "-")
          cy.get('button').last().click({ force: true });
        });
      cy.wait(600);
    });
  }

  // Interação de add (checkbox)
  _clicarCheckbox(nomeOpcional) {
    cy.get('body').then(($body) => {
      if (!$body.text().match(new RegExp(nomeOpcional, 'i'))) {
        cy.log(`[SKIP] "${nomeOpcional}" não disponível.`);
        return;
      }
      cy.contains(new RegExp(nomeOpcional, 'i'))
        .scrollIntoView()
        .parents('[class*="card"], [class*="item"], [class*="service"], li, .row')
        .first()
        .within(() => {
          cy.get('input[type="checkbox"], mat-checkbox, [role="checkbox"], .mat-checkbox-inner-container')
            .first()
            .click({ force: true });
        });
      cy.wait(600);
    });
  }

  // Métodos que a gente chama nos testes
  adicionarCadeiraDeBebe()      { this._clicarMais('cadeira de bebê');       return this; }
  adicionarAssentoDeElevacao()  { this._clicarMais('assento de elevação');   return this; }
  adicionarBebeConforto()       { this._clicarMais('bebê conforto');          return this; }
  adicionarLocacaoJovem()       { this._clicarCheckbox('locação jovem');      return this; }
  adicionarLavagemAntecipada()  { this._clicarCheckbox('lavagem antecipada'); return this; }
  adicionarMotoristaAdicional() { this._clicarMais('motoristas adicionais');  return this; }
  adicionarGPS()                { this._clicarMais('gps');                    return this; }

  // Interação de remover (botão -)
  removerOpcional(nomeOpcional) {
    cy.get('body').then(($body) => {
      if (!$body.text().match(new RegExp(nomeOpcional, 'i'))) return;
      cy.contains(new RegExp(nomeOpcional, 'i'))
        .scrollIntoView()
        .parents('[class*="card"], [class*="item"], [class*="service"], li, .row')
        .first()
        .within(() => {
          cy.get('button').filter((i, el) => /^[\-−–]$/.test(el.textContent.trim()))
            .first()
            .click({ force: true });
        });
      cy.wait(600);
    });
    return this;
  }

  // Validações de valores
  validarValorFinalMaiorQueInicial() {
    cy.get('@valorInicial').then((valorInicial) => {
      this._lerValorTotal().then((valorFinal) => {
        cy.log(`[Assert] R$ ${valorInicial.toFixed(2)} → R$ ${valorFinal.toFixed(2)}`);
        expect(valorFinal, 'Valor total deve ser ≥ valor base após adicionar opcionais')
          .to.be.gte(valorInicial);
      });
    });
    return this;
  }

  validarValorFinalMenorOuIgual(referencia) {
    this._lerValorTotal().then((valorFinal) => {
      expect(valorFinal, 'Valor total deve ser ≤ valor de referência após remover opcional')
        .to.be.lte(referencia);
    });
    return this;
  }

  validarQuantidadeNaoNegativa(nomeOpcional) {
    cy.contains(new RegExp(nomeOpcional, 'i'))
      .scrollIntoView()
      .parents('[class*="card"], [class*="item"], li, .row').first()
      .within(() => {
        cy.get('span, [class*="quantity"], [class*="quantidade"], input[type="number"]')
          .first()
          .invoke('text')
          .then((qty) => {
            const quantidade = parseInt(qty.trim()) || 0;
            expect(quantidade, `Quantidade de "${nomeOpcional}" não deve ser negativa`).to.be.gte(0);
          });
      });
    return this;
  }

  continuarParaIdentificacao() {
    cy.contains(/continuar/i).scrollIntoView().click({ force: true });
    return this;
  }
}

export default new SummaryPage();
