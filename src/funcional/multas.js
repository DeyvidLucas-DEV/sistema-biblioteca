import { calcularDiasDeAtraso, filtrarEmprestimosAtrasados } from './consultas.js';

export const MULTA_DIARIA = 2;

export function calcularMulta(diasDeAtraso, valorMultaDiaria) {
  return diasDeAtraso > 0 ? diasDeAtraso * valorMultaDiaria : 0;
}

export function gerarRelatorioDeMultas(emprestimos, dataReferencia) {
  const itens = filtrarEmprestimosAtrasados(emprestimos, dataReferencia).map((emprestimo) => {
    const diasDeAtraso = calcularDiasDeAtraso(emprestimo, dataReferencia);
    return Object.freeze({
      emprestimoId: emprestimo.id,
      titulo: emprestimo.livro.titulo,
      usuario: emprestimo.usuario.nome,
      dataPrevistaDevolucao: emprestimo.dataPrevistaDevolucao,
      diasDeAtraso,
      multa: calcularMulta(diasDeAtraso, MULTA_DIARIA),
    });
  });

  const total = itens.reduce((soma, item) => soma + item.multa, 0);

  return Object.freeze({ dataReferencia, itens: Object.freeze(itens), total });
}
