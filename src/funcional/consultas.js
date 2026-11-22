import { diferencaEmDias } from './datas.js';

export function filtrarLivrosPorCategoria(livros, categoria) {
  const categoriaProcurada = categoria.trim().toLowerCase();
  return livros.filter((livro) => livro.categoria.toLowerCase() === categoriaProcurada);
}

export function filtrarEmprestimosAtivos(emprestimos) {
  return emprestimos.filter((emprestimo) => emprestimo.ativo);
}

export function calcularDiasDeAtraso(emprestimo, dataReferencia) {
  if (!emprestimo.ativo) {
    return 0;
  }
  return Math.max(0, diferencaEmDias(emprestimo.dataPrevistaDevolucao, dataReferencia));
}

export function estaAtrasado(emprestimo, dataReferencia) {
  return calcularDiasDeAtraso(emprestimo, dataReferencia) > 0;
}

export function filtrarEmprestimosAtrasados(emprestimos, dataReferencia) {
  return emprestimos.filter((emprestimo) => estaAtrasado(emprestimo, dataReferencia));
}
