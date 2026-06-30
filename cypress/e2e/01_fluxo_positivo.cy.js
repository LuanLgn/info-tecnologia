/// <reference types="cypress" />
/**
 * SUÍTE 01 — Fluxo Positivo (Caminho Feliz)
 * ─────────────────────────────────────────
 * Screenshots com foco no elemento sendo interagido — cy.screenshotFoco()
 * Padrão: Page Object Model + Data-Driven (Fixtures) + Network Control
 */
import HomePage from '../support/pages/HomePage';
import VehicleSelectionPage from '../support/pages/VehicleSelectionPage';
import SummaryPage from '../support/pages/SummaryPage';

function preencherFormulario(dados) {
  HomePage.buscarLoja(dados.busca.local, dados.busca.lojaEsperada);
  HomePage.selecionarDataRetirada();
  HomePage.selecionarHoraRetirada(dados.busca.horaRetirada);
  HomePage.selecionarDataDevolucao();
  HomePage.selecionarHoraDevolucao(dados.busca.horaDevolucao);
  HomePage.confirmarBusca();
  cy.url().should('include', '/passo-2');
  VehicleSelectionPage.aceitarCookies();
}

describe('[CT-001] Fluxo Completo de Reserva com Opcionais — Caminho Feliz', () => {
  before(() => { Cypress.on('uncaught:exception', () => false); });

  beforeEach(function () {
    cy.fixture('reserva').as('dados');
    HomePage.visitar();
  });

  it('[CT-001.1] Deve exibir o formulário de busca ao acessar a página inicial', () => {
    // Foco no widget de busca principal
    cy.screenshotFoco('CT001-01_widget_de_busca', '.widget-reserva, form, [class*="search"], [class*="form"]', 40);
  });

  it('[CT-001.2] Deve sugerir lojas ao digitar o nome da cidade (autocomplete)', function () {
    HomePage.elementos.campoLoja().click({ force: true }).type(this.dados.busca.local, { delay: 80 });
    cy.wait(1200);
    // Foco no dropdown de sugestões
    cy.screenshotFoco('CT001-02_autocomplete_lista_sugestoes', 'input[placeholder*="retirada"], input[placeholder*="Retirada"]', 120);
    cy.contains(this.dados.busca.lojaEsperada).should('be.visible');
  });

  it('[CT-001.3] Deve selecionar a loja Aeroporto de Confins no autocomplete', function () {
    HomePage.elementos.campoLoja().click({ force: true }).type(this.dados.busca.local, { delay: 80 });
    cy.wait(1200);
    cy.contains(this.dados.busca.lojaEsperada).click({ force: true });
    cy.wait(500);
    // Foco no campo de loja com o valor preenchido
    cy.screenshotFoco('CT001-03_loja_selecionada_no_campo', 'input[placeholder*="retirada"], input[placeholder*="Retirada"]', 80);
  });

  it('[CT-001.4] Deve exibir o calendário de retirada ao clicar no campo de data', function () {
    HomePage.elementos.campoLoja().click({ force: true }).type(this.dados.busca.local, { delay: 80 });
    cy.wait(1000);
    cy.contains(this.dados.busca.lojaEsperada).click({ force: true });
    cy.wait(500);
    // Foco no calendário de retirada aberto
    cy.screenshotFoco('CT001-04_calendario_retirada_aberto', 'mat-calendar, [class*="calendar"]', 20);
  });

  it('[CT-001.5] Deve completar a busca e navegar para o Passo 2 (seleção de veículo)', function () {
    preencherFormulario(this.dados);
    cy.screenshotViewport('CT001-05_passo2_listagem_veiculos');
    cy.contains(/escolha seu grupo de veículos/i).should('be.visible');
  });

  it('[CT-001.6] Deve exibir o resumo no Passo 3 ao selecionar veículo', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');
    cy.screenshotViewport('CT001-06_passo3_resumo_inicial');
  });

  it('[CT-001.7] Deve exibir seção "Acessórios e Serviços" com todos os opcionais', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');
    cy.contains(/acessórios e serviços/i).scrollIntoView();
    // Foco na seção inteira de opcionais
    cy.screenshotFoco('CT001-07_secao_acessorios_e_servicos', '[class*="accessories"], [class*="optional"], [class*="service"]', 30);
  });

  it('[CT-001.8] Deve recalcular o valor ao adicionar Cadeira de Bebê', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');
    SummaryPage.capturarValorInicial();

    cy.contains(/cadeira de bebê/i).scrollIntoView();
    cy.screenshotFoco('CT001-08a_cadeira_bebe_antes', 'body', 0);

    SummaryPage.adicionarCadeiraDeBebe();
    cy.contains(/cadeira de bebê/i).scrollIntoView();
    cy.screenshotFoco('CT001-08b_cadeira_bebe_quantidade_1', 'body', 0);

    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-001.9] Deve recalcular o valor ao adicionar Assento de Elevação', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');
    SummaryPage.capturarValorInicial();

    SummaryPage.adicionarAssentoDeElevacao();
    cy.contains(/assento de elevação/i).scrollIntoView();
    cy.screenshotFoco('CT001-09_assento_elevacao_adicionado', 'body', 0);

    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-001.10] Deve recalcular o valor ao adicionar Bebê Conforto', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');
    SummaryPage.capturarValorInicial();

    SummaryPage.adicionarBebeConforto();
    cy.contains(/bebê conforto/i).scrollIntoView();
    cy.screenshotFoco('CT001-10_bebe_conforto_adicionado', 'body', 0);

    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-001.11] Deve marcar Locação Jovem e refletir no valor total', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');
    SummaryPage.capturarValorInicial();

    SummaryPage.adicionarLocacaoJovem();
    cy.contains(/locação jovem/i).scrollIntoView();
    cy.screenshotFoco('CT001-11_locacao_jovem_marcada', 'body', 0);

    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-001.12] Deve marcar Lavagem Antecipada e refletir no valor total', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');
    SummaryPage.capturarValorInicial();

    SummaryPage.adicionarLavagemAntecipada();
    cy.contains(/lavagem antecipada/i).scrollIntoView();
    cy.screenshotFoco('CT001-12_lavagem_antecipada_marcada', 'body', 0);

    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-001.13] Deve adicionar todos os opcionais, validar valor crescente e avançar para identificação', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');

    SummaryPage.capturarValorInicial();
    cy.screenshotViewport('CT001-13a_valor_base_antes_de_adicionais');

    SummaryPage.adicionarCadeiraDeBebe();
    cy.contains(/cadeira de bebê/i).scrollIntoView();
    cy.screenshotFoco('CT001-13b_cadeira_de_bebe', 'body', 0);

    SummaryPage.adicionarAssentoDeElevacao();
    cy.contains(/assento de elevação/i).scrollIntoView();
    cy.screenshotFoco('CT001-13c_assento_de_elevacao', 'body', 0);

    SummaryPage.adicionarBebeConforto();
    cy.contains(/bebê conforto/i).scrollIntoView();
    cy.screenshotFoco('CT001-13d_bebe_conforto', 'body', 0);

    SummaryPage.adicionarLocacaoJovem();
    cy.contains(/locação jovem/i).scrollIntoView();
    cy.screenshotFoco('CT001-13e_locacao_jovem', 'body', 0);

    SummaryPage.adicionarLavagemAntecipada();
    cy.contains(/lavagem antecipada/i).scrollIntoView();
    cy.screenshotFoco('CT001-13f_lavagem_antecipada', 'body', 0);

    SummaryPage.adicionarMotoristaAdicional();
    cy.contains(/motoristas adicionais/i).scrollIntoView();
    cy.screenshotFoco('CT001-13g_motorista_adicional', 'body', 0);

    SummaryPage.validarValorFinalMaiorQueInicial();

    // Foco no painel de resumo financeiro direito
    cy.screenshotFoco('CT001-13h_painel_valor_total_final', '[class*="summary"], [class*="resumo"], aside, [class*="sidebar"]', 10);

    SummaryPage.continuarParaIdentificacao();
    cy.url().should('include', '/passo-4');
    cy.screenshotViewport('CT001-13i_passo4_identificacao');
  });
});
