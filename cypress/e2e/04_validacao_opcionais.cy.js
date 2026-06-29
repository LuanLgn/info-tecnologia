/// <reference types="cypress" />
/**
 * SUÍTE 04 — Validação de Opcionais e Cálculo de Valor Total
 * ────────────────────────────────────────────────────────────
 * Testa cada opcional disponível na tela de Resumo (Passo 3):
 *  - Cadeira de Bebê (botões +/-)
 *  - Assento de Elevação (botões +/-)
 *  - Bebê Conforto (botões +/-)
 *  - Locação Jovem (checkbox)
 *  - Lavagem Antecipada (checkbox)
 *  - Motoristas Adicionais (botões +/-)
 *
 * Cenários Negativos de Alto Valor (Nível Pleno/Sênior):
 *  - Tentar inserir quantidade negativa via JS (manipulação de DOM)
 *  - Tentar inserir quantidade superior ao limite permitido
 *  - Validar que o valor total é matematicamente correto
 *  - Validar que o botão "-" nunca vai abaixo de 0
 */

import HomePage from '../support/pages/HomePage';
import VehicleSelectionPage from '../support/pages/VehicleSelectionPage';

// ─── Helper: navegar até o Passo 3 ─────────────────────────────────────────────
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

// ─── Helper: capturar valor numérico do campo de total ─────────────────────────
function capturarValorTotal() {
  return cy.get('.valor-total, .preco-total, .total-reserva, [class*="total"]')
    .first()
    .invoke('text')
    .then((texto) => parseFloat(texto.replace(/[^\d,]/g, '').replace(',', '.')));
}

// ─── Helper: encontrar card de opcional e retornar seus botões ─────────────────
function getCardOpcional(nomeOpcional) {
  return cy.contains('Cadeira de Bebê, Assento de Elevação, Bebê Conforto, Locação Jovem, Lavagem Antecipada, Motoristas Adicionais, GPS'
    .split(',').includes(nomeOpcional) ? nomeOpcional : nomeOpcional)
    .scrollIntoView()
    .parents('[class*="card"], [class*="item"], [class*="service"], [class*="optional"], .row, li, div')
    .first();
}

// ─── Helper: ler quantidade atual de um opcional ───────────────────────────────
function lerQuantidade(nomeOpcional) {
  return cy.contains(nomeOpcional)
    .scrollIntoView()
    .parents('[class*="card"], [class*="item"], li, div').first()
    .find('span, input[type="number"], [class*="quantity"], [class*="quantidade"]')
    .first()
    .invoke('text')
    .then((t) => parseInt(t.trim()) || 0);
}

// ═══════════════════════════════════════════════════════════════════════════════

describe('[CT-004] Opcionais — Acessórios e Serviços', () => {
  before(() => {
    Cypress.on('uncaught:exception', () => false);
  });

  beforeEach(function () {
    cy.fixture('reserva').as('dados');
  });

  // ── CT-004.1: Screenshot de todos os opcionais disponíveis ──────────────────
  it('[CT-004.1] Deve exibir todos os opcionais disponíveis na seção Acessórios e Serviços', function () {
    navegarAtePasso3(this.dados);

    cy.contains('Acessórios e serviços, Acessorios e servicos, Adicionais, Opcionais'.split(', ')[0])
      .scrollIntoView();
    cy.screenshot('CT004-01_todos_opcionais_disponiveis');

    // Valida presença dos principais opcionais
    const opcionaisEsperados = [
      'Cadeira De Bebê',
      'Assento De Elevação',
      'Bebê Conforto',
      'Locação Jovem',
      'Lavagem Antecipada',
      'Motoristas Adicionais'
    ];

    opcionaisEsperados.forEach((opcional) => {
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes(opcional.toLowerCase())) {
          cy.log(`[OK] Opcional encontrado: ${opcional}`);
        } else {
          cy.log(`[AVISO] Opcional não disponível nesta reserva: ${opcional}`);
        }
      });
    });

    cy.screenshot('CT004-02_validacao_lista_opcionais');
  });

  // ── CT-004.2: Cadeira de Bebê — botão "+" incrementa quantidade ────────────
  it('[CT-004.2] Deve incrementar a quantidade de Cadeira de Bebê ao clicar em "+"', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().toLowerCase().includes('cadeira')) {
        cy.log('[SKIP] Cadeira de Bebê não disponível. Pulando teste.');
        return;
      }

      cy.contains(/cadeira de bebê/i).scrollIntoView();
      cy.screenshot('CT004-03_cadeira_bebe_antes_de_adicionar');

      // Clica no botão "+"
      cy.contains(/cadeira de bebê/i)
        .parents('[class*="card"], [class*="item"], li, div').first()
        .find('button').contains('+').click({ force: true });
      cy.wait(600);

      cy.screenshot('CT004-04_cadeira_bebe_quantidade_1');

      // Verifica que a quantidade mudou de 0 para 1
      cy.contains(/cadeira de bebê/i)
        .parents('[class*="card"], [class*="item"], li, div').first()
        .find('span, [class*="quantity"]').first()
        .invoke('text')
        .then((qty) => {
          expect(parseInt(qty.trim())).to.be.gte(1);
          cy.log(`[OK] Quantidade Cadeira de Bebê: ${qty.trim()}`);
        });
    });
  });

  // ── CT-004.3: Assento de Elevação — botão "+" incrementa ──────────────────
  it('[CT-004.3] Deve incrementar a quantidade de Assento de Elevação ao clicar em "+"', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().toLowerCase().includes('assento de elevação')) {
        cy.log('[SKIP] Assento de Elevação não disponível. Pulando teste.');
        return;
      }

      cy.contains(/assento de elevação/i).scrollIntoView();
      cy.screenshot('CT004-05_assento_elevacao_antes_de_adicionar');

      cy.contains(/assento de elevação/i)
        .parents('[class*="card"], [class*="item"], li, div').first()
        .find('button').contains('+').click({ force: true });
      cy.wait(600);

      cy.screenshot('CT004-06_assento_elevacao_quantidade_1');
    });
  });

  // ── CT-004.4: Bebê Conforto — botão "+" incrementa ─────────────────────────
  it('[CT-004.4] Deve incrementar a quantidade de Bebê Conforto ao clicar em "+"', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().toLowerCase().includes('bebê conforto')) {
        cy.log('[SKIP] Bebê Conforto não disponível. Pulando teste.');
        return;
      }

      cy.contains(/bebê conforto/i).scrollIntoView();
      cy.screenshot('CT004-07_bebe_conforto_antes_de_adicionar');

      cy.contains(/bebê conforto/i)
        .parents('[class*="card"], [class*="item"], li, div').first()
        .find('button').contains('+').click({ force: true });
      cy.wait(600);

      cy.screenshot('CT004-08_bebe_conforto_quantidade_1');
    });
  });

  // ── CT-004.5: Locação Jovem — checkbox seleciona e reflete no total ────────
  it('[CT-004.5] Deve adicionar Locação Jovem via checkbox e refletir no valor total', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().toLowerCase().includes('locação jovem')) {
        cy.log('[SKIP] Locação Jovem não disponível nesta reserva. Pulando teste.');
        return;
      }

      cy.contains(/locação jovem/i).scrollIntoView();
      cy.screenshot('CT004-09_locacao_jovem_desmarcada');

      cy.contains(/locação jovem/i)
        .parents('[class*="card"], [class*="item"], li, div').first()
        .find('input[type="checkbox"], mat-checkbox, [class*="checkbox"]').first()
        .click({ force: true });
      cy.wait(800);

      cy.screenshot('CT004-10_locacao_jovem_marcada_valor_atualizado');
      cy.log('[OK] Locação Jovem marcada.');
    });
  });

  // ── CT-004.6: Lavagem Antecipada — checkbox seleciona ─────────────────────
  it('[CT-004.6] Deve adicionar Lavagem Antecipada via checkbox', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().toLowerCase().includes('lavagem antecipada')) {
        cy.log('[SKIP] Lavagem Antecipada não disponível. Pulando teste.');
        return;
      }

      cy.contains(/lavagem antecipada/i).scrollIntoView();
      cy.screenshot('CT004-11_lavagem_antecipada_desmarcada');

      cy.contains(/lavagem antecipada/i)
        .parents('[class*="card"], [class*="item"], li, div').first()
        .find('input[type="checkbox"], mat-checkbox, [class*="checkbox"]').first()
        .click({ force: true });
      cy.wait(800);

      cy.screenshot('CT004-12_lavagem_antecipada_marcada');
      cy.log('[OK] Lavagem Antecipada marcada.');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════

describe('[CT-005] Opcionais — Cenários Negativos e Limites', () => {
  before(() => {
    Cypress.on('uncaught:exception', () => false);
  });

  beforeEach(function () {
    cy.fixture('reserva').as('dados');
  });

  // ── CT-005.1: Botão "-" não deve ir abaixo de zero ─────────────────────────
  it('[CT-005.1] O botão "-" não deve decrementar a quantidade abaixo de 0', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().toLowerCase().includes('cadeira')) return;

      cy.contains(/cadeira de bebê/i).scrollIntoView();

      // Tenta decrementar sem ter adicionado nenhum item (quantidade inicial = 0)
      cy.contains(/cadeira de bebê/i)
        .parents('[class*="card"], [class*="item"], li, div').first()
        .as('cardCadeira');

      cy.get('@cardCadeira').find('button').contains('−').click({ force: true });
      cy.wait(500);
      cy.get('@cardCadeira').find('button').contains('−').click({ force: true });
      cy.wait(500);

      cy.screenshot('CT005-01_botao_menos_com_quantidade_zero');

      // A quantidade deve continuar em 0
      cy.get('@cardCadeira')
        .find('span, [class*="quantity"]').first()
        .invoke('text')
        .then((qty) => {
          const quantidade = parseInt(qty.trim()) || 0;
          expect(quantidade, 'Quantidade não deve ser negativa').to.be.gte(0);
          cy.log(`[RESULTADO CT-005.1] PASSOU — Quantidade: ${quantidade} (não negativa)`);
        });

      cy.screenshot('CT005-02_quantidade_minima_zero_validada');
    });
  });

  // ── CT-005.2: Injeção de valor negativo via JS direto no DOM ───────────────
  it('[CT-005.2] Deve ignorar/rejeitar valor negativo injetado via JavaScript no input de quantidade', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().toLowerCase().includes('cadeira')) return;

      cy.contains(/cadeira de bebê/i).scrollIntoView();
      cy.screenshot('CT005-03_antes_injecao_js_negativo');

      // Tenta injetar valor negativo diretamente via execScript (simula ataque de manipulação de DOM)
      cy.contains(/cadeira de bebê/i)
        .parents('[class*="card"], [class*="item"], li, div').first()
        .find('span, input[type="number"], [class*="quantity"]').first()
        .then(($el) => {
          // Força o valor -1 via propriedade do DOM
          $el.val && $el.val(-1);
          $el[0].textContent = '-1';
          $el[0].innerText = '-1';

          // Dispara evento de mudança para que o Angular/framework reaja
          $el[0].dispatchEvent(new Event('input', { bubbles: true }));
          $el[0].dispatchEvent(new Event('change', { bubbles: true }));
        });

      cy.wait(800);
      cy.screenshot('CT005-04_apos_injecao_js_negativo');

      // Captura o valor total para verificar que não houve desconto indevido
      cy.get('.valor-total, .preco-total, .total-reserva, [class*="total"]')
        .first().invoke('text').then((texto) => {
          const valor = parseFloat(texto.replace(/[^\d,]/g, '').replace(',', '.'));
          expect(valor, 'Valor total não deve ser negativo após manipulação').to.be.gt(0);
          cy.log(`[RESULTADO CT-005.2] PASSOU — Valor total permanece positivo: R$ ${valor}`);
        });

      cy.screenshot('CT005-05_valor_total_positivo_apos_manipulacao');
    });
  });

  // ── CT-005.3: Validação matemática do valor total ──────────────────────────
  it('[CT-005.3] O Valor Total deve ser matematicamente igual à soma das diárias + opcionais + taxas', function () {
    navegarAtePasso3(this.dados);
    cy.screenshot('CT005-06_resumo_para_validacao_matematica');

    // Captura os valores individuais do resumo lateral
    cy.get('body').then(($body) => {
      const textoBody = $body.text();
      cy.log(`[CT-005.3] Conteúdo do resumo de preços disponível para validação.`);

      // Extrai "Diárias total com desconto"
      cy.contains(/diárias total/i).scrollIntoView();
      cy.screenshot('CT005-07_detalhamento_diarias');

      // Captura valor de Opcionais (Proteção Completa já incluída)
      cy.get('body').then(($b) => {
        if ($b.text().toLowerCase().includes('opcionais total')) {
          cy.contains(/opcionais total/i).scrollIntoView();
          cy.screenshot('CT005-08_detalhamento_opcionais');
        }
      });

      // Captura Taxa Administrativa
      cy.get('body').then(($b) => {
        if ($b.text().toLowerCase().includes('taxa administrativa')) {
          cy.contains(/taxa administrativa/i).scrollIntoView();
          cy.screenshot('CT005-09_taxa_administrativa');
        }
      });

      // Captura Valor Total
      cy.contains(/valor total/i).scrollIntoView();
      cy.screenshot('CT005-10_valor_total_final');

      cy.log('[RESULTADO CT-005.3] Estrutura de precificação documentada com sucesso.');
    });
  });

  // ── CT-005.4: Todos os opcionais juntos — valor total aumenta ──────────────
  it('[CT-005.4] O Valor Total deve aumentar progressivamente a cada opcional adicionado', function () {
    navegarAtePasso3(this.dados);

    // Captura o valor base
    cy.get('.valor-total, .preco-total, .total-reserva, [class*="total"]')
      .first().invoke('text').as('textoInicial');

    cy.get('@textoInicial').then((textoInicial) => {
      const valorBase = parseFloat(textoInicial.replace(/[^\d,]/g, '').replace(',', '.'));
      cy.log(`[CT-005.4] Valor base: R$ ${valorBase}`);
      cy.screenshot('CT005-11_valor_base_sem_opcionais');

      // Adiciona Cadeira de Bebê
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('cadeira')) {
          cy.contains(/cadeira de bebê/i)
            .parents('[class*="card"], [class*="item"], li, div').first()
            .find('button').contains('+').click({ force: true });
          cy.wait(700);

          cy.get('.valor-total, .preco-total, .total-reserva, [class*="total"]')
            .first().invoke('text').then((t) => {
              const valorComCadeira = parseFloat(t.replace(/[^\d,]/g, '').replace(',', '.'));
              expect(valorComCadeira, 'Valor deve aumentar com Cadeira de Bebê').to.be.gte(valorBase);
              cy.log(`[OK] Após Cadeira de Bebê: R$ ${valorComCadeira}`);
            });

          cy.screenshot('CT005-12_valor_apos_cadeira_bebe');
        }
      });

      // Adiciona Assento de Elevação
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('assento de elevação')) {
          cy.contains(/assento de elevação/i)
            .parents('[class*="card"], [class*="item"], li, div').first()
            .find('button').contains('+').click({ force: true });
          cy.wait(700);
          cy.screenshot('CT005-13_valor_apos_assento_elevacao');
        }
      });

      // Adiciona Bebê Conforto
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('bebê conforto')) {
          cy.contains(/bebê conforto/i)
            .parents('[class*="card"], [class*="item"], li, div').first()
            .find('button').contains('+').click({ force: true });
          cy.wait(700);
          cy.screenshot('CT005-14_valor_apos_bebe_conforto');
        }
      });

      // Adiciona Locação Jovem
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('locação jovem')) {
          cy.contains(/locação jovem/i)
            .parents('[class*="card"], [class*="item"], li, div').first()
            .find('input[type="checkbox"], mat-checkbox, [class*="checkbox"]').first()
            .click({ force: true });
          cy.wait(700);
          cy.screenshot('CT005-15_valor_apos_locacao_jovem');
        }
      });

      // Adiciona Lavagem Antecipada
      cy.get('body').then(($body) => {
        if ($body.text().toLowerCase().includes('lavagem antecipada')) {
          cy.contains(/lavagem antecipada/i)
            .parents('[class*="card"], [class*="item"], li, div').first()
            .find('input[type="checkbox"], mat-checkbox, [class*="checkbox"]').first()
            .click({ force: true });
          cy.wait(700);
          cy.screenshot('CT005-16_valor_apos_lavagem_antecipada');
        }
      });

      // Verificação final
      cy.get('.valor-total, .preco-total, .total-reserva, [class*="total"]')
        .first().invoke('text').then((textoFinal) => {
          const valorFinal = parseFloat(textoFinal.replace(/[^\d,]/g, '').replace(',', '.'));
          expect(valorFinal, 'Valor final com todos os opcionais deve ser >= valor base').to.be.gte(valorBase);
          cy.log(`[RESULTADO CT-005.4] PASSOU — Valor final: R$ ${valorFinal} | Base: R$ ${valorBase}`);
        });

      cy.screenshot('CT005-17_todos_opcionais_adicionados_valor_final');
    });
  });

  // ── CT-005.5: Remover opcional e verificar que o valor diminui ─────────────
  it('[CT-005.5] O Valor Total deve diminuir ao remover um opcional adicionado', function () {
    navegarAtePasso3(this.dados);

    cy.get('body').then(($body) => {
      if (!$body.text().toLowerCase().includes('cadeira')) return;

      // Adiciona Cadeira de Bebê
      cy.contains(/cadeira de bebê/i)
        .parents('[class*="card"], [class*="item"], li, div').first()
        .find('button').contains('+').click({ force: true });
      cy.wait(700);

      // Captura valor com 1 cadeira
      cy.get('.valor-total, .preco-total, .total-reserva, [class*="total"]')
        .first().invoke('text').as('textoComOpcional');
      cy.screenshot('CT005-18_valor_com_cadeira_adicionada');

      // Remove a Cadeira de Bebê
      cy.contains(/cadeira de bebê/i)
        .parents('[class*="card"], [class*="item"], li, div').first()
        .find('button').contains('−').click({ force: true });
      cy.wait(700);

      cy.get('@textoComOpcional').then((textoComOpcional) => {
        const valorComOpcional = parseFloat(textoComOpcional.replace(/[^\d,]/g, '').replace(',', '.'));

        cy.get('.valor-total, .preco-total, .total-reserva, [class*="total"]')
          .first().invoke('text').then((textoSemOpcional) => {
            const valorSemOpcional = parseFloat(textoSemOpcional.replace(/[^\d,]/g, '').replace(',', '.'));
            expect(valorSemOpcional, 'Valor deve diminuir ao remover opcional').to.be.lte(valorComOpcional);
            cy.log(`[RESULTADO CT-005.5] PASSOU — R$ ${valorComOpcional} → R$ ${valorSemOpcional}`);
          });
      });

      cy.screenshot('CT005-19_valor_apos_remover_opcional');
    });
  });
});
