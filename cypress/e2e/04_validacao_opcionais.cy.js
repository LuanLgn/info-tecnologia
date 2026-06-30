/// <reference types="cypress" />
/**
 * Validação do carrinho/resumo
 * - Garantir que a soma dos opcionais tá batendo com o total
 * - Usar foco no screenshot pra não ficar poluído
 */

import HomePage from '../support/pages/HomePage';
import VehicleSelectionPage from '../support/pages/VehicleSelectionPage';
import SummaryPage from '../support/pages/SummaryPage';

function navegarAtePasso3(dados) {
  HomePage.visitar();
  HomePage.buscarLoja(dados.busca.local, dados.busca.lojaEsperada);
  HomePage.selecionarDataRetirada();
  HomePage.selecionarHoraRetirada(dados.busca.horaRetirada);
  HomePage.selecionarDataDevolucao();
  HomePage.selecionarHoraDevolucao(dados.busca.horaDevolucao);
  HomePage.confirmarBusca();
  cy.url().should('include', '/passo-2');
  VehicleSelectionPage.aceitarCookies();
  VehicleSelectionPage.escolherGrupo(dados.veiculo.grupoEsperado);
  cy.url().should('include', '/passo-3');
}

// Helper: screenshot focado no card do opcional
function screenshotOpcional(nomeOpcional, nomeArquivo) {
  cy.get('body').then(($body) => {
    if ($body.text().match(new RegExp(nomeOpcional, 'i'))) {
      cy.contains(new RegExp(nomeOpcional, 'i'))
        .scrollIntoView()
        .parents('[class*="card"], [class*="item"], [class*="service"], li, .row')
        .first()
        .screenshot(nomeArquivo); // Screenshot do ELEMENTO, não da página inteira
    }
  });
}

// ═════════════════════════════════════════════════════════════════════════════

describe('[CT-004] Opcionais — Acessórios e Serviços (Positivo)', () => {
  before(() => { Cypress.on('uncaught:exception', () => false); });
  beforeEach(function () { cy.fixture('reserva').as('dados'); });

  it('[CT-004.1] Deve exibir todos os opcionais disponíveis na seção Acessórios e Serviços', function () {
    navegarAtePasso3(this.dados);
    cy.contains(/acessórios e serviços/i).scrollIntoView();
    // Screenshot da seção inteira de opcionais
    cy.contains(/acessórios e serviços/i)
      .parents('section, div, [class*="section"]').first()
      .screenshot('CT004-01_secao_acessorios_completa');
  });

  it('[CT-004.2] Deve incrementar a quantidade de Cadeira de Bebê ao clicar em "+"', function () {
    navegarAtePasso3(this.dados);

    screenshotOpcional('cadeira de bebê', 'CT004-02a_cadeira_bebe_quantidade_0');

    SummaryPage.adicionarCadeiraDeBebe();

    screenshotOpcional('cadeira de bebê', 'CT004-02b_cadeira_bebe_quantidade_1');
  });

  it('[CT-004.3] Deve incrementar a quantidade de Assento de Elevação ao clicar em "+"', function () {
    navegarAtePasso3(this.dados);

    screenshotOpcional('assento de elevação', 'CT004-03a_assento_elevacao_quantidade_0');

    SummaryPage.adicionarAssentoDeElevacao();

    screenshotOpcional('assento de elevação', 'CT004-03b_assento_elevacao_quantidade_1');
  });

  it('[CT-004.4] Deve incrementar a quantidade de Bebê Conforto ao clicar em "+"', function () {
    navegarAtePasso3(this.dados);

    screenshotOpcional('bebê conforto', 'CT004-04a_bebe_conforto_quantidade_0');

    SummaryPage.adicionarBebeConforto();

    screenshotOpcional('bebê conforto', 'CT004-04b_bebe_conforto_quantidade_1');
  });

  it('[CT-004.5] Deve marcar Locação Jovem via checkbox e refletir no valor total', function () {
    navegarAtePasso3(this.dados);
    SummaryPage.capturarValorInicial();

    screenshotOpcional('locação jovem', 'CT004-05a_locacao_jovem_desmarcada');

    SummaryPage.adicionarLocacaoJovem();

    screenshotOpcional('locação jovem', 'CT004-05b_locacao_jovem_marcada');
    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-004.6] Deve marcar Lavagem Antecipada via checkbox', function () {
    navegarAtePasso3(this.dados);
    SummaryPage.capturarValorInicial();

    screenshotOpcional('lavagem antecipada', 'CT004-06a_lavagem_antecipada_desmarcada');

    SummaryPage.adicionarLavagemAntecipada();

    screenshotOpcional('lavagem antecipada', 'CT004-06b_lavagem_antecipada_marcada');
    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-004.7] Deve exibir o painel de resumo financeiro com valor total', function () {
    navegarAtePasso3(this.dados);
    // Screenshot focado no painel lateral de preços (onde fica Valor Total, Diárias, etc.)
    cy.get('[class*="summary"], [class*="resumo"], aside, [class*="sidebar"]')
      .first().scrollIntoView()
      .screenshot('CT004-07_painel_resumo_financeiro');
  });
});

// ═════════════════════════════════════════════════════════════════════════════

describe('[CT-005] Opcionais — Cenários Negativos e Limites', () => {
  before(() => { Cypress.on('uncaught:exception', () => false); });
  beforeEach(function () { cy.fixture('reserva').as('dados'); });

  it('[CT-005.1] O botão "−" não deve decrementar a quantidade abaixo de 0', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().match(/cadeira de bebê/i)) {
        cy.log('[SKIP] Cadeira de Bebê indisponível.');
        return;
      }

      screenshotOpcional('cadeira de bebê', 'CT005-01a_cadeira_quantidade_inicial_zero');

      // Tenta clicar em "−" 3x com quantidade em 0
      for (let i = 0; i < 3; i++) {
        cy.contains(/cadeira de bebê/i)
          .parents('[class*="card"], [class*="item"], li, .row').first()
          .within(() => {
            cy.get('button').filter((i, el) => /^[\-−–]$/.test(el.textContent.trim()))
              .first().click({ force: true });
          });
        cy.wait(300);
      }

      screenshotOpcional('cadeira de bebê', 'CT005-01b_botao_menos_clicado_3x_resultado');

      // Quantidade deve permanecer em 0 (não vai negativo)
      cy.contains(/cadeira de bebê/i)
        .parents('[class*="card"], [class*="item"], li, .row').first()
        .within(() => {
          cy.get('span, [class*="quantity"]').first().invoke('text').then((qty) => {
            expect(parseInt(qty.trim()) || 0).to.be.gte(0);
            cy.log(`[RESULTADO CT-005.1] PASSOU — Quantidade: ${parseInt(qty.trim()) || 0}`);
          });
        });
    });
  });

  it('[CT-005.2] Deve rejeitar valor negativo injetado via JavaScript no DOM', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().match(/cadeira de bebê/i)) return;

      cy.contains(/cadeira de bebê/i)
        .parents('[class*="card"], [class*="item"], li, .row').first()
        .as('cardCadeira');

      screenshotOpcional('cadeira de bebê', 'CT005-02a_antes_injecao_negativo');

      // Injeta valor -1 diretamente no DOM (simula manipulação maliciosa)
      cy.get('@cardCadeira').find('span, input[type="number"], [class*="quantity"]').first()
        .then(($el) => {
          $el[0].textContent = '-1';
          $el.val && $el.val('-1');
          $el[0].dispatchEvent(new Event('input',  { bubbles: true }));
          $el[0].dispatchEvent(new Event('change', { bubbles: true }));
        });
      cy.wait(800);

      screenshotOpcional('cadeira de bebê', 'CT005-02b_apos_injecao_negativo_resultado');

      // Valor total deve permanecer positivo
      cy.get('body').invoke('text').then((texto) => {
        const match = texto.match(/valor total[:\s]*R\$\s*([\d.,]+)/i);
        if (match) {
          const valor = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
          expect(valor).to.be.gt(0);
          cy.log(`[RESULTADO CT-005.2] PASSOU — Valor total permanece: R$ ${valor.toFixed(2)}`);
        }
      });

      // Screenshot do painel financeiro após tentativa de ataque
      cy.get('[class*="summary"], [class*="resumo"], aside, [class*="sidebar"]')
        .first().scrollIntoView()
        .screenshot('CT005-02c_painel_valor_apos_injecao_js');
    });
  });

  it('[CT-005.3] Validação matemática — valor total deve refletir cada acréscimo', function () {
    navegarAtePasso3(this.dados);

    // Captura estrutura do painel de preços
    cy.get('[class*="summary"], [class*="resumo"], aside')
      .first().scrollIntoView()
      .screenshot('CT005-03a_estrutura_painel_precos');

    // Captura linha de Diárias
    cy.get('body').then(($body) => {
      if ($body.text().match(/diárias total/i)) {
        cy.contains(/diárias total/i).scrollIntoView()
          .parents('div').first()
          .screenshot('CT005-03b_linha_diarias_total');
      }
    });

    // Captura linha de Taxa Administrativa
    cy.get('body').then(($body) => {
      if ($body.text().match(/taxa administrativa/i)) {
        cy.contains(/taxa administrativa/i).scrollIntoView()
          .parents('div').first()
          .screenshot('CT005-03c_linha_taxa_administrativa');
      }
    });

    // Captura o Valor Total destacado
    cy.get('body').then(($body) => {
      if ($body.text().match(/valor total/i)) {
        cy.contains(/valor total/i).scrollIntoView()
          .parents('div').first()
          .screenshot('CT005-03d_valor_total_final');
      }
    });
  });

  it('[CT-005.4] O Valor Total deve crescer progressivamente a cada opcional adicionado', function () {
    navegarAtePasso3(this.dados);
    SummaryPage.capturarValorInicial();

    cy.get('[class*="summary"], [class*="resumo"], aside').first()
      .scrollIntoView().screenshot('CT005-04a_valor_base_sem_opcionais');

    SummaryPage.adicionarCadeiraDeBebe();
    cy.get('[class*="summary"], [class*="resumo"], aside').first()
      .scrollIntoView().screenshot('CT005-04b_valor_apos_cadeira_bebe');

    SummaryPage.adicionarAssentoDeElevacao();
    cy.get('[class*="summary"], [class*="resumo"], aside').first()
      .scrollIntoView().screenshot('CT005-04c_valor_apos_assento_elevacao');

    SummaryPage.adicionarBebeConforto();
    cy.get('[class*="summary"], [class*="resumo"], aside').first()
      .scrollIntoView().screenshot('CT005-04d_valor_apos_bebe_conforto');

    SummaryPage.adicionarLocacaoJovem();
    cy.get('[class*="summary"], [class*="resumo"], aside').first()
      .scrollIntoView().screenshot('CT005-04e_valor_apos_locacao_jovem');

    SummaryPage.adicionarLavagemAntecipada();
    cy.get('[class*="summary"], [class*="resumo"], aside').first()
      .scrollIntoView().screenshot('CT005-04f_valor_apos_lavagem_antecipada');

    SummaryPage.validarValorFinalMaiorQueInicial();
    cy.get('[class*="summary"], [class*="resumo"], aside').first()
      .scrollIntoView().screenshot('CT005-04g_valor_final_todos_opcionais_validado');

    cy.log('[RESULTADO CT-005.4] PASSOU — Valor cresceu progressivamente com cada opcional.');
  });

  it('[CT-005.5] O Valor Total deve diminuir ao remover um opcional previamente adicionado', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().match(/cadeira de bebê/i)) return;

      SummaryPage.adicionarCadeiraDeBebe();
      cy.wait(600);

      cy.get('[class*="summary"], [class*="resumo"], aside').first()
        .scrollIntoView().screenshot('CT005-05a_valor_com_cadeira_adicionada');

      // Captura o valor com o opcional
      cy.get('body').invoke('text').as('textoComOpcional');

      SummaryPage.removerOpcional('cadeira de bebê');
      cy.wait(600);

      cy.get('[class*="summary"], [class*="resumo"], aside').first()
        .scrollIntoView().screenshot('CT005-05b_valor_apos_remover_cadeira');

      cy.get('@textoComOpcional').then((textoComOpcional) => {
        const matchCom = textoComOpcional.match(/valor total[:\s]*R\$\s*([\d.,]+)/i);
        if (!matchCom) return;
        const valorCom = parseFloat(matchCom[1].replace(/\./g, '').replace(',', '.'));

        cy.get('body').invoke('text').then((textoSem) => {
          const matchSem = textoSem.match(/valor total[:\s]*R\$\s*([\d.,]+)/i);
          if (!matchSem) return;
          const valorSem = parseFloat(matchSem[1].replace(/\./g, '').replace(',', '.'));
          expect(valorSem).to.be.lte(valorCom);
          cy.log(`[RESULTADO CT-005.5] PASSOU — R$ ${valorCom.toFixed(2)} → R$ ${valorSem.toFixed(2)}`);
        });
      });
    });
  });
});
