import { filtrarEmprestimosAtivos, filtrarEmprestimosAtrasados } from './consultas.js';
import { gerarRelatorioDeMultas } from './multas.js';

export function contarLivrosPorCategoria(livros) {
  return livros.reduce(
    (contagem, livro) => ({ ...contagem, [livro.categoria]: (contagem[livro.categoria] ?? 0) + 1 }),
    {},
  );
}

export function contarEmprestimosPorUsuario(emprestimos) {
  return emprestimos.reduce(
    (contagem, emprestimo) => ({
      ...contagem,
      [emprestimo.usuario.nome]: (contagem[emprestimo.usuario.nome] ?? 0) + 1,
    }),
    {},
  );
}

export function gerarEstatisticas(livros, emprestimos, dataReferencia) {
  return Object.freeze({
    livrosPorCategoria: Object.freeze(contarLivrosPorCategoria(livros)),
    emprestimosPorUsuario: Object.freeze(contarEmprestimosPorUsuario(emprestimos)),
    emprestimosAtivos: filtrarEmprestimosAtivos(emprestimos).length,
    emprestimosAtrasados: filtrarEmprestimosAtrasados(emprestimos, dataReferencia).length,
    totalDeMultas: gerarRelatorioDeMultas(emprestimos, dataReferencia).total,
  });
}
