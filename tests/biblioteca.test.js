import { test } from 'node:test';
import assert from 'node:assert/strict';
import Biblioteca from '../src/modelos/Biblioteca.js';

function montarBiblioteca() {
  const biblioteca = new Biblioteca();
  const livro = biblioteca.cadastrarLivro('Dom Casmurro', 'Machado de Assis', 'Literatura');
  const outroLivro = biblioteca.cadastrarLivro('Código Limpo', 'Robert C. Martin', 'Computação');
  const ana = biblioteca.cadastrarUsuario('Ana Souza', '2024001');
  const bruno = biblioteca.cadastrarUsuario('Bruno Lima', '2024002');
  return { biblioteca, livro, outroLivro, ana, bruno };
}

test('cadastra livros e usuários com identificadores sequenciais', () => {
  const { biblioteca, livro, outroLivro, ana, bruno } = montarBiblioteca();
  assert.deepEqual([livro.id, outroLivro.id, ana.id, bruno.id], [1, 2, 1, 2]);
  assert.equal(biblioteca.buscarLivro(2).titulo, 'Código Limpo');
  assert.equal(biblioteca.buscarUsuario(1).nome, 'Ana Souza');
});

test('recusa cadastros incompletos e matrícula repetida', () => {
  const { biblioteca } = montarBiblioteca();
  assert.throws(() => biblioteca.cadastrarLivro('  ', 'Autor', 'Categoria'), /título/);
  assert.throws(() => biblioteca.cadastrarUsuario('Carla', '2024001'), /matrícula 2024001/);
  assert.throws(() => biblioteca.buscarLivro(99), /Livro 99 não encontrado/);
  assert.equal(biblioteca.listarUsuarios().length, 2);
});

test('estado interno não fica exposto', () => {
  const { biblioteca } = montarBiblioteca();
  const lista = biblioteca.listarLivros();
  assert.ok(Object.isFrozen(lista));
  assert.throws(() => lista.push('intruso'), TypeError);
  assert.equal(biblioteca.listarLivros().length, 2);
  assert.equal(biblioteca.livros, undefined);
});

test('livro emprestado fica indisponível e não pode ir para outro usuário', () => {
  const { biblioteca, livro, ana, bruno } = montarBiblioteca();
  const emprestimo = biblioteca.registrarEmprestimo(livro.id, ana.id, '2026-11-01', '2026-11-08');

  assert.equal(emprestimo.livro, livro);
  assert.equal(emprestimo.usuario, ana);
  assert.equal(biblioteca.livroEstaDisponivel(livro.id), false);
  assert.throws(
    () => biblioteca.registrarEmprestimo(livro.id, bruno.id, '2026-11-02', '2026-11-09'),
    /já está emprestado/,
  );
  assert.equal(biblioteca.listarEmprestimos().length, 1);
});

test('um usuário pode ter vários empréstimos', () => {
  const { biblioteca, livro, outroLivro, ana } = montarBiblioteca();
  biblioteca.registrarEmprestimo(livro.id, ana.id, '2026-11-01', '2026-11-08');
  biblioteca.registrarEmprestimo(outroLivro.id, ana.id, '2026-11-01', '2026-11-08');
  assert.equal(biblioteca.consultarEmprestimosDoUsuario(ana.id).length, 2);
});

test('valida as datas do empréstimo', () => {
  const { biblioteca, livro, ana } = montarBiblioteca();
  assert.throws(() => biblioteca.registrarEmprestimo(livro.id, ana.id, '01/11/2026', '2026-11-08'), /AAAA-MM-DD/);
  assert.throws(() => biblioteca.registrarEmprestimo(livro.id, ana.id, '2026-11-08', '2026-11-08'), /posterior/);
  assert.equal(biblioteca.livroEstaDisponivel(livro.id), true);
});

test('devolução registra a data e libera o livro', () => {
  const { biblioteca, livro, ana, bruno } = montarBiblioteca();
  const emprestimo = biblioteca.registrarEmprestimo(livro.id, ana.id, '2026-11-01', '2026-11-08');
  const devolvido = biblioteca.registrarDevolucao(emprestimo.id, '2026-11-10');

  assert.equal(devolvido.dataDevolucao, '2026-11-10');
  assert.equal(emprestimo.dataDevolucao, null);
  assert.equal(biblioteca.buscarEmprestimo(emprestimo.id).ativo, false);
  assert.equal(biblioteca.livroEstaDisponivel(livro.id), true);

  const novo = biblioteca.registrarEmprestimo(livro.id, bruno.id, '2026-11-10', '2026-11-17');
  assert.equal(novo.id, 2);
});

test('não devolve duas vezes nem antes da data do empréstimo', () => {
  const { biblioteca, livro, ana } = montarBiblioteca();
  const emprestimo = biblioteca.registrarEmprestimo(livro.id, ana.id, '2026-11-05', '2026-11-12');
  assert.throws(() => biblioteca.registrarDevolucao(emprestimo.id, '2026-11-04'), /anterior/);
  biblioteca.registrarDevolucao(emprestimo.id, '2026-11-06');
  assert.throws(() => biblioteca.registrarDevolucao(emprestimo.id, '2026-11-07'), /já foi devolvido/);
});

test('relatório e estatísticas da biblioteca ignoram empréstimos devolvidos', () => {
  const { biblioteca, livro, outroLivro, ana, bruno } = montarBiblioteca();
  const primeiro = biblioteca.registrarEmprestimo(livro.id, ana.id, '2026-11-01', '2026-11-08');
  biblioteca.registrarEmprestimo(outroLivro.id, bruno.id, '2026-11-01', '2026-11-12');

  assert.equal(biblioteca.gerarRelatorioDeMultas('2026-11-22').total, 14 * 2 + 10 * 2);

  biblioteca.registrarDevolucao(primeiro.id, '2026-11-20');
  const relatorio = biblioteca.gerarRelatorioDeMultas('2026-11-22');
  assert.deepEqual(relatorio.itens.map((item) => item.usuario), ['Bruno Lima']);
  assert.equal(relatorio.total, 20);

  const estatisticas = biblioteca.gerarEstatisticas('2026-11-22');
  assert.equal(estatisticas.emprestimosAtivos, 1);
  assert.equal(estatisticas.emprestimosAtrasados, 1);
  assert.equal(estatisticas.totalDeMultas, 20);
  assert.throws(() => biblioteca.gerarRelatorioDeMultas('ontem'), /data de referência/);
});
