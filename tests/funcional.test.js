import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ehDataValida, diferencaEmDias } from '../src/funcional/datas.js';
import {
  calcularDiasDeAtraso,
  filtrarEmprestimosAtivos,
  filtrarEmprestimosAtrasados,
  filtrarLivrosPorCategoria,
} from '../src/funcional/consultas.js';
import { calcularMulta, gerarRelatorioDeMultas, MULTA_DIARIA } from '../src/funcional/multas.js';
import { contarEmprestimosPorUsuario, contarLivrosPorCategoria, gerarEstatisticas } from '../src/funcional/estatisticas.js';
import { calcularTotalDeMultasFuncional, calcularTotalDeMultasImperativo } from '../src/funcional/comparacao.js';
import { criarEmprestimos, fotografar, livros } from './apoio.js';

test('validação e diferença de datas', () => {
  assert.equal(ehDataValida('2026-11-22'), true);
  assert.equal(ehDataValida('2026-02-30'), false);
  assert.equal(ehDataValida('22/11/2026'), false);
  assert.equal(ehDataValida(undefined), false);
  assert.equal(diferencaEmDias('2026-11-08', '2026-11-22'), 14);
  assert.equal(diferencaEmDias('2026-12-31', '2027-01-01'), 1);
  assert.equal(diferencaEmDias('2026-11-22', '2026-11-20'), -2);
});

test('filtragem de livros por categoria não altera a coleção original', () => {
  const copiaAntes = [...livros];
  const computacao = filtrarLivrosPorCategoria(livros, ' computação ');

  assert.deepEqual(computacao.map((livro) => livro.id), [2, 4]);
  assert.notEqual(computacao, livros);
  assert.deepEqual(livros, copiaAntes);
  assert.deepEqual(filtrarLivrosPorCategoria(livros, 'Física'), []);
});

test('calcularMulta é pura: mesmas entradas, mesma saída', () => {
  assert.equal(MULTA_DIARIA, 2);
  assert.equal(calcularMulta(5, MULTA_DIARIA), 10);
  assert.equal(calcularMulta(5, MULTA_DIARIA), calcularMulta(5, MULTA_DIARIA));
  assert.equal(calcularMulta(0, MULTA_DIARIA), 0);
  assert.equal(calcularMulta(-3, MULTA_DIARIA), 0);
  assert.equal(calcularMulta(1, 2.5), 2.5);
});

test('dias de atraso consideram só empréstimos ativos após a data prevista', () => {
  const [domCasmurro, , , devolvido] = criarEmprestimos();
  assert.equal(calcularDiasDeAtraso(domCasmurro, '2026-11-08'), 0);
  assert.equal(calcularDiasDeAtraso(domCasmurro, '2026-11-09'), 1);
  assert.equal(calcularDiasDeAtraso(domCasmurro, '2026-11-01'), 0);
  assert.equal(calcularDiasDeAtraso(devolvido, '2026-11-22'), 0);
});

test('empréstimos atrasados ignoram devolvidos e dependem da data de referência', () => {
  const emprestimos = criarEmprestimos();
  assert.deepEqual(filtrarEmprestimosAtivos(emprestimos).map((item) => item.id), [1, 2, 3]);
  assert.deepEqual(filtrarEmprestimosAtrasados(emprestimos, '2026-11-22').map((item) => item.id), [1, 2]);
  assert.deepEqual(filtrarEmprestimosAtrasados(emprestimos, '2026-11-30').map((item) => item.id), [1, 2, 3]);
  assert.deepEqual(filtrarEmprestimosAtrasados(emprestimos, '2026-11-05'), []);
});

test('relatório de multas usa filter, map e reduce sem modificar os dados', () => {
  const emprestimos = criarEmprestimos();
  const antes = fotografar(emprestimos);
  const relatorio = gerarRelatorioDeMultas(emprestimos, '2026-11-22');

  assert.equal(relatorio.dataReferencia, '2026-11-22');
  assert.deepEqual(
    relatorio.itens.map((item) => [item.emprestimoId, item.diasDeAtraso, item.multa]),
    [
      [1, 14, 28],
      [2, 5, 10],
    ],
  );
  assert.equal(relatorio.total, 38);
  assert.equal(emprestimos.length, 4);
  assert.deepEqual(fotografar(emprestimos), antes);
  assert.ok(Object.isFrozen(relatorio));
  assert.ok(Object.isFrozen(relatorio.itens));
  assert.ok(Object.isFrozen(relatorio.itens[0]));
});

test('relatório sem atrasos tem total zero', () => {
  const relatorio = gerarRelatorioDeMultas(criarEmprestimos(), '2026-11-01');
  assert.deepEqual(relatorio.itens, []);
  assert.equal(relatorio.total, 0);
});

test('estatísticas de livros, usuários, ativos, atrasados e multas', () => {
  const emprestimos = criarEmprestimos();
  assert.deepEqual(contarLivrosPorCategoria(livros), { Literatura: 1, 'Computação': 2, 'Matemática': 1 });
  assert.deepEqual(contarEmprestimosPorUsuario(emprestimos), { 'Ana Souza': 2, 'Bruno Lima': 2 });
  assert.deepEqual({ ...gerarEstatisticas(livros, emprestimos, '2026-11-22') }, {
    livrosPorCategoria: { Literatura: 1, 'Computação': 2, 'Matemática': 1 },
    emprestimosPorUsuario: { 'Ana Souza': 2, 'Bruno Lima': 2 },
    emprestimosAtivos: 3,
    emprestimosAtrasados: 2,
    totalDeMultas: 38,
  });
});

test('versões imperativa e funcional produzem o mesmo total', () => {
  const emprestimos = criarEmprestimos();
  ['2026-11-01', '2026-11-09', '2026-11-22', '2026-12-31'].forEach((data) => {
    assert.equal(
      calcularTotalDeMultasImperativo(emprestimos, data),
      calcularTotalDeMultasFuncional(emprestimos, data),
    );
  });
  assert.equal(calcularTotalDeMultasFuncional(emprestimos, '2026-11-22'), 38);
  assert.equal(calcularTotalDeMultasImperativo([], '2026-11-22'), 0);
});
