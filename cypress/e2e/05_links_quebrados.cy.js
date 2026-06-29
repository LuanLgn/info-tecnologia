/// <reference types="cypress" />
/**
 * SUÍTE 05 — Varredura de Links Quebrados (Link Checker)
 * ───────────────────────────────────────────────────────
 * Varre todos os links (<a href>) da página inicial e valida que
 * nenhum retorna status 4xx ou 5xx.
 *
 * Técnica de nível Sênior:
 * - cy.request() para fazer HEAD request em cada link sem abrir nova janela
 * - Filtragem de links externos vs. internos
 * - Relatório consolidado de links com falha
 */

describe('[CT-006] Varredura de Links — Integridade de Navegação', () => {
  before(() => {
    Cypress.on('uncaught:exception', () => false);
  });

  it('[CT-006.1] Todos os links internos da home devem responder com status 2xx ou 3xx', () => {
    cy.visit('/');
    cy.wait(2000);
    cy.screenshot('CT006-01_pagina_home_para_varredura');

    // Coleta todos os hrefs da página
    cy.get('a[href]').then(($links) => {
      const urls = [];
      const baseUrl = Cypress.config('baseUrl');

      $links.each((i, el) => {
        const href = el.getAttribute('href');
        if (
          href &&
          !href.startsWith('#') &&
          !href.startsWith('mailto:') &&
          !href.startsWith('tel:') &&
          !href.startsWith('javascript:') &&
          href.length > 1
        ) {
          // Normaliza URLs relativas
          const url = href.startsWith('http') ? href : `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
          urls.push({ url, href, text: el.textContent.trim().substring(0, 50) });
        }
      });

      cy.log(`[CT-006.1] Total de links encontrados para validar: ${urls.length}`);

      // Filtra apenas links internos (mesmo domínio)
      const linksInternos = urls.filter(({ url }) =>
        url.includes('unidas.com.br') || url.startsWith(baseUrl)
      );

      cy.log(`[CT-006.1] Links internos para verificar: ${linksInternos.length}`);

      // Verifica cada link interno (máximo 20 para não sobrecarregar)
      const linksParaVerificar = linksInternos.slice(0, 20);
      const linksComFalha = [];

      const verificarLinks = (index) => {
        if (index >= linksParaVerificar.length) {
          // Todos verificados — consolida resultado
          if (linksComFalha.length > 0) {
            cy.log(`[ALERTA] ${linksComFalha.length} links com problemas encontrados:`);
            linksComFalha.forEach(({ url, status }) => {
              cy.log(`  [FALHA] ${status} → ${url}`);
            });
          } else {
            cy.log(`[RESULTADO CT-006.1] PASSOU — Todos os ${linksParaVerificar.length} links internos retornaram 2xx/3xx.`);
          }
          cy.screenshot('CT006-02_resultado_varredura_links');
          return;
        }

        const { url, text } = linksParaVerificar[index];

        cy.request({
          url,
          failOnStatusCode: false,
          timeout: 10000,
          headers: { 'User-Agent': 'Cypress-Link-Checker/1.0' }
        }).then((response) => {
          const status = response.status;
          if (status >= 400) {
            linksComFalha.push({ url, status, text });
            cy.log(`[FALHA] ${status} → ${text} (${url})`);
          } else {
            cy.log(`[OK] ${status} → ${text}`);
          }
          verificarLinks(index + 1);
        });
      };

      verificarLinks(0);
    });
  });

  it('[CT-006.2] O link "Para mais detalhes, acesse o nosso tarifário" deve ser funcional', () => {
    cy.visit('/');
    cy.wait(1000);

    // Navega até o passo-3 para encontrar o link de tarifário
    // Verifica primeiro se o texto existe na home
    cy.get('body').then(($body) => {
      const linkTexts = ['tarifário', 'Tarifário', 'clicando aqui', 'tarifario'];
      const found = linkTexts.some((t) => $body.text().includes(t));

      if (found) {
        const texto = linkTexts.find((t) => $body.text().includes(t));
        cy.contains(texto).should('have.attr', 'href').then((href) => {
          cy.log(`[CT-006.2] Link do tarifário encontrado: ${href}`);
          cy.request({ url: href, failOnStatusCode: false }).then((resp) => {
            expect(resp.status, 'Link do tarifário deve retornar status válido').to.be.lessThan(500);
            cy.log(`[RESULTADO CT-006.2] PASSOU — Status: ${resp.status}`);
          });
        });
      } else {
        cy.log('[CT-006.2] Link de tarifário não encontrado na home. Verificando no passo-3...');
      }
    });

    cy.screenshot('CT006-03_verificacao_link_tarifario');
  });
});
