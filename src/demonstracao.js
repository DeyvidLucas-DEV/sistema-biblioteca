import { criarBibliotecaDeExemplo } from './dadosDeExemplo.js';
import { filtrarLivrosPorCategoria } from './funcional/consultas.js';
import { calcularMulta, MULTA_DIARIA } from './funcional/multas.js';
import { calcularTotalDeMultasFuncional, calcularTotalDeMultasImperativo } from './funcional/comparacao.js';
import {
  formatarEmprestimo,
  formatarEstatisticas,
  formatarLivro,
  formatarMoeda,
  formatarRelatorioDeMultas,
  formatarUsuario,
} from './formatacao.js';

const DATA_REFERENCIA = process.argv[2] ?? '2026-11-22';

function exibirSecao(titulo, linhas) {
  console.log(`\n=== ${titulo} ===`);
  linhas.forEach((linha) => console.log(linha));
}

const biblioteca = criarBibliotecaDeExemplo();

exibirSecao(
  'Acervo',
  biblioteca.listarLivros().map((livro) => formatarLivro(livro, biblioteca.livroEstaDisponivel(livro.id))),
);
exibirSecao('Usuários', biblioteca.listarUsuarios().map(formatarUsuario));
exibirSecao('Empréstimos', biblioteca.listarEmprestimos().map(formatarEmprestimo));

const livros = biblioteca.listarLivros();
const computacao = filtrarLivrosPorCategoria(livros, 'Computação');
exibirSecao('Filtragem por categoria (filter)', [
  ...computacao.map((livro) => livro.descrever()),
  `Coleção original continua com ${livros.length} livros.`,
]);

exibirSecao('Cálculo de multa (função pura)', [
  `calcularMulta(5, ${MULTA_DIARIA}) = ${formatarMoeda(calcularMulta(5, MULTA_DIARIA))}`,
  `calcularMulta(5, ${MULTA_DIARIA}) de novo = ${formatarMoeda(calcularMulta(5, MULTA_DIARIA))}`,
  `calcularMulta(0, ${MULTA_DIARIA}) = ${formatarMoeda(calcularMulta(0, MULTA_DIARIA))}`,
]);

exibirSecao('Regra: livro já emprestado', (() => {
  try {
    biblioteca.registrarEmprestimo(1, 3, '2026-11-20', '2026-11-27');
    return ['Empréstimo registrado.'];
  } catch (erro) {
    return [`Recusado: ${erro.message}`];
  }
})());

exibirSecao('Relatório de multas (filter, map e reduce)', formatarRelatorioDeMultas(biblioteca.gerarRelatorioDeMultas(DATA_REFERENCIA)));
exibirSecao('Estatísticas', formatarEstatisticas(biblioteca.gerarEstatisticas(DATA_REFERENCIA)));

const emprestimos = biblioteca.listarEmprestimos();
exibirSecao('Comparação entre paradigmas (total de multas)', [
  `Imperativa: ${formatarMoeda(calcularTotalDeMultasImperativo(emprestimos, DATA_REFERENCIA))}`,
  `Funcional:  ${formatarMoeda(calcularTotalDeMultasFuncional(emprestimos, DATA_REFERENCIA))}`,
]);

const devolvido = biblioteca.registrarDevolucao(1, DATA_REFERENCIA);
exibirSecao('Devolução', [
  formatarEmprestimo(devolvido),
  formatarLivro(devolvido.livro, biblioteca.livroEstaDisponivel(devolvido.livro.id)),
  ...formatarRelatorioDeMultas(biblioteca.gerarRelatorioDeMultas(DATA_REFERENCIA)),
]);
