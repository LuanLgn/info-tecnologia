/// <reference types="cypress" />
/**
 * SUÍTE 01 — Fluxo Positivo (Caminho Feliz)
 * ─────────────────────────────────────────
 * Valida o fluxo completo de simulação de reserva com adicionais.
 * Padrão: Page Object Model + Data-Driven (Fixtures) + Network Control
 */
import HomePage from '../support/pages/HomePage';
import VehicleSelectionPage from '../support/pages/VehicleSelectionPage';
import SummaryPage from '../support/pages/SummaryPage';

// ── Helper reutilizável (DRY) ─────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────

describe('[CT-001] Fluxo Completo de Reserva com Opcionais — Caminho Feliz', () => {
  before(() => { Cypress.on('uncaught:exception', () => false); });

  beforeEach(function () {
    cy.fixture('reserva').as('dados');
    HomePage.visitar();
  });

  it('[CT-001.1] Deve exibir o formulário de busca ao acessar a página inicial', () => {
    cy.get('body').should('be.visible');
    cy.screenshot('CT001-01_pagina_inicial_carregada');
  });

  it('[CT-001.2] Deve sugerir lojas ao digitar o nome da cidade (autocomplete)', function () {
    HomePage.elementos.campoLoja().click({ force: true }).type(this.dados.busca.local, { delay: 80 });
    cy.wait(1200);
    cy.screenshot('CT001-02_autocomplete_sugestoes_de_loja');
    cy.contains(this.dados.busca.lojaEsperada).should('be.visible');
  });

  it('[CT-001.3] Deve completar a busca e navegar para o Passo 2 (seleção de veículo)', function () {
    preencherFormulario(this.dados);
    cy.screenshot('CT001-03_passo2_listagem_veiculos');
    cy.contains(/escolha seu grupo de veículos/i).should('be.visible');
  });

  it('[CT-001.4] Deve exibir o resumo da reserva no Passo 3 ao selecionar veículo', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');
    cy.screenshot('CT001-04_passo3_resumo_sem_adicionais');
    cy.get('body').should('contain.text', this.dados.busca.lojaEsperada);
  });

  it('[CT-001.5] Deve exibir seção "Acessórios e Serviços" com todos os opcionais', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');

    cy.contains(/acessórios e serviços/i).scrollIntoView().should('be.visible');
    cy.screenshot('CT001-05_secao_acessorios_e_servicos');
  });

  it('[CT-001.6] Deve recalcular o valor ao adicionar Cadeira de Bebê', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');

    SummaryPage.capturarValorInicial();
    cy.screenshot('CT001-06_valor_base_capturado');

    SummaryPage.adicionarCadeiraDeBebe();
    cy.screenshot('CT001-07_cadeira_de_bebe_adicionada');
    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-001.7] Deve recalcular o valor ao adicionar Assento de Elevação', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');

    SummaryPage.capturarValorInicial();
    SummaryPage.adicionarAssentoDeElevacao();
    cy.screenshot('CT001-08_assento_de_elevacao_adicionado');
    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-001.8] Deve recalcular o valor ao adicionar Bebê Conforto', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');

    SummaryPage.capturarValorInicial();
    SummaryPage.adicionarBebeConforto();
    cy.screenshot('CT001-09_bebe_conforto_adicionado');
    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-001.9] Deve marcar Locação Jovem e refletir no valor total', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');

    SummaryPage.capturarValorInicial();
    SummaryPage.adicionarLocacaoJovem();
    cy.screenshot('CT001-10_locacao_jovem_marcada');
    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-001.10] Deve marcar Lavagem Antecipada e refletir no valor total', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');

    SummaryPage.capturarValorInicial();
    SummaryPage.adicionarLavagemAntecipada();
    cy.screenshot('CT001-11_lavagem_antecipada_marcada');
    SummaryPage.validarValorFinalMaiorQueInicial();
  });

  it('[CT-001.11] Deve adicionar todos os opcionais, validar valor crescente e avançar para identificação', function () {
    preencherFormulario(this.dados);
    VehicleSelectionPage.escolherGrupo(this.dados.veiculo.grupoEsperado);
    cy.url().should('include', '/passo-3');

    SummaryPage.capturarValorInicial();
    cy.screenshot('CT001-12_valor_base_antes_de_todos_opcionais');

    SummaryPage.adicionarCadeiraDeBebe();
    cy.screenshot('CT001-13_apos_cadeira_de_bebe');

    SummaryPage.adicionarAssentoDeElevacao();
    cy.screenshot('CT001-14_apos_assento_de_elevacao');

    SummaryPage.adicionarBebeConforto();
    cy.screenshot('CT001-15_apos_bebe_conforto');

    SummaryPage.adicionarLocacaoJovem();
    cy.screenshot('CT001-16_apos_locacao_jovem');

    SummaryPage.adicionarLavagemAntecipada();
    cy.screenshot('CT001-17_apos_lavagem_antecipada');

    SummaryPage.adicionarMotoristaAdicional();
    cy.screenshot('CT001-18_apos_motorista_adicional');

    SummaryPage.validarValorFinalMaiorQueInicial();
    cy.screenshot('CT001-19_todos_opcionais_valor_final_recalculado');

    SummaryPage.continuarParaIdentificacao();
    cy.url().should('include', '/passo-4');
    cy.screenshot('CT001-20_passo4_identificacao');
  });
});
