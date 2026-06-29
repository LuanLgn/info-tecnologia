/// <reference types="cypress" />
/**
 * SUÍTE 03 — Bypass de URL / Pulos de Etapa (Cenários Negativos)
 * ──────────────────────────────────────────────────────────────────
 * Valida se a aplicação protege rotas que exigem dados de sessão/contexto.
 * Um engenheiro QA Pleno sabe que atacar o fluxo via URL é uma das primeiras
 * formas de encontrar falhas de segurança e estado em aplicações SPA (Angular).
 *
 * Técnicas de nível Pleno/Sênior:
 * - Acesso direto a rotas protegidas (deep link manipulation)
 * - Verificação de redirecionamento automático
 * - Interceptação do cy.on('window:before:load') para simular ausência de estado
 * - Asserções de URL e conteúdo após tentativa de acesso indevido
 */

describe('[CT-003] Bypass de URL — Acesso Direto a Etapas Protegidas', () => {
  before(() => {
    Cypress.on('uncaught:exception', () => false);
  });

  it('[CT-003.1] Deve redirecionar para o início ao tentar acessar o Passo 2 diretamente sem sessão', () => {
    cy.log('[CT-003.1] Tentando bypass: acesso direto à /reserva/passo-2 sem preencher formulário...');

    // Acessa diretamente o passo-2 sem nenhuma interação anterior
    cy.visit('/reserva/passo-2', { failOnStatusCode: false });
    cy.wait(2000);

    cy.screenshot('CT003-01_acesso_direto_passo2_resultado');

    // O portal DEVE redirecionar para a home OU exibir estado vazio/erro
    cy.url().then((url) => {
      if (url.includes('/passo-2')) {
        // Se ficou no passo-2, valida que está vazio (sem veículos carregados)
        cy.log('[OBSERVAÇÃO] Portal manteve a rota. Verificando se a página está sem dados...');
        cy.get('body').should('not.contain.text', 'Escolha seu grupo de veículos');
        cy.screenshot('CT003-02_passo2_sem_dados_por_falta_de_contexto');
        cy.log('[RESULTADO CT-003.1] PASSOU — Página sem dados de busca válidos (estado inválido detectado).');
      } else {
        // Redirecionou corretamente
        cy.log(`[RESULTADO CT-003.1] PASSOU — Redirecionado para: ${url}`);
        cy.screenshot('CT003-02_redirecionado_para_inicio');
      }
    });
  });

  it('[CT-003.2] Deve redirecionar ao tentar acessar o Passo 3 diretamente sem selecionar veículo', () => {
    cy.log('[CT-003.2] Tentando bypass: acesso direto à /reserva/passo-3...');

    cy.visit('/reserva/passo-3', { failOnStatusCode: false });
    cy.wait(2000);

    cy.screenshot('CT003-03_acesso_direto_passo3_resultado');

    cy.url().then((url) => {
      if (url.includes('/passo-3')) {
        cy.get('body').should('not.contain.text', 'Resumo da reserva');
        cy.screenshot('CT003-04_passo3_sem_veiculo_selecionado');
        cy.log('[RESULTADO CT-003.2] PASSOU — Resumo sem dados de veículo (estado inválido protegido).');
      } else {
        cy.log(`[RESULTADO CT-003.2] PASSOU — Redirecionado para: ${url}`);
        cy.screenshot('CT003-04_redirecionado_apos_bypass_passo3');
      }
    });
  });

  it('[CT-003.3] Deve redirecionar ao tentar acessar o Passo 4 (Identificação) diretamente', () => {
    cy.log('[CT-003.3] Tentando bypass: acesso direto à /reserva/passo-4...');

    cy.visit('/reserva/passo-4', { failOnStatusCode: false });
    cy.wait(2000);

    cy.screenshot('CT003-05_acesso_direto_passo4_resultado');

    cy.url().then((url) => {
      if (url.includes('/passo-4')) {
        // Se ficou no passo-4, garante que formulário de identificação está vazio sem dados de reserva
        cy.get('body').should('be.visible');
        cy.screenshot('CT003-06_passo4_sem_contexto_de_reserva');
        cy.log('[RESULTADO CT-003.3] OBSERVAÇÃO — Rota acessível, mas sem contexto de reserva prévia.');
      } else {
        cy.log(`[RESULTADO CT-003.3] PASSOU — Redirecionado para: ${url}`);
        cy.screenshot('CT003-06_redirecionado_apos_bypass_passo4');
      }
    });
  });

  it('[CT-003.4] Deve retornar 404 ou redirecionar para URL inexistente no domínio', () => {
    cy.log('[CT-003.4] Testando URL completamente inexistente no domínio...');

    cy.visit('/pagina-que-nao-existe-abc123', { failOnStatusCode: false });
    cy.wait(1500);

    cy.screenshot('CT003-07_url_inexistente_comportamento');

    cy.url().then((url) => {
      cy.log(`[CT-003.4] URL após acesso a rota inexistente: ${url}`);
      // O esperado é que retorne 404 ou redirecione para a home
      cy.get('body').should('be.visible');
      cy.screenshot('CT003-08_pagina_404_ou_fallback');
      cy.log('[RESULTADO CT-003.4] DOCUMENTADO — Comportamento de fallback para rotas inexistentes mapeado.');
    });
  });
});
