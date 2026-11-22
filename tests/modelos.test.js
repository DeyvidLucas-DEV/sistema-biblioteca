import { test } from 'node:test';
import assert from 'node:assert/strict';
import Livro from '../src/modelos/Livro.js';
import Usuario from '../src/modelos/Usuario.js';
import Emprestimo from '../src/modelos/Emprestimo.js';
import { ana, livros } from './apoio.js';

test('Livro expõe os dados apenas por leitura', () => {
  const livro = new Livro(1, 'Dom Casmurro', 'Machado de Assis', 'Literatura');
  assert.equal(livro.titulo, 'Dom Casmurro');
  assert.throws(() => {
    livro.titulo = 'Outro';
  }, TypeError);
  assert.throws(() => {
    livro.novoCampo = 1;
  }, TypeError);
  assert.equal(livro.titulo, 'Dom Casmurro');
  assert.deepEqual(Object.keys(livro), []);
});

test('Usuario não permite alterar a matrícula', () => {
  const usuario = new Usuario(1, 'Ana', '2024001');
  assert.throws(() => {
    usuario.matricula = '999';
  }, TypeError);
  assert.equal(usuario.descrever(), 'Ana (matrícula 2024001)');
});

test('Emprestimo começa ativo e a devolução gera um novo objeto', () => {
  const emprestimo = new Emprestimo(1, livros[0], ana, '2026-11-01', '2026-11-08');
  const devolvido = emprestimo.comDevolucao('2026-11-09');

  assert.equal(emprestimo.ativo, true);
  assert.equal(emprestimo.dataDevolucao, null);
  assert.equal(devolvido.ativo, false);
  assert.equal(devolvido.dataDevolucao, '2026-11-09');
  assert.notEqual(devolvido, emprestimo);
  assert.equal(devolvido.livro, emprestimo.livro);
  assert.equal(devolvido.usuario, emprestimo.usuario);
});
