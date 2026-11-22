import { calcularDiasDeAtraso, filtrarEmprestimosAtrasados } from './consultas.js';
import { calcularMulta, MULTA_DIARIA } from './multas.js';

export function calcularTotalDeMultasImperativo(emprestimos, dataReferencia) {
  let total = 0;
  for (let indice = 0; indice < emprestimos.length; indice++) {
    const emprestimo = emprestimos[indice];
    if (emprestimo.ativo) {
      const diasDeAtraso = calcularDiasDeAtraso(emprestimo, dataReferencia);
      if (diasDeAtraso > 0) {
        total += diasDeAtraso * MULTA_DIARIA;
      }
    }
  }
  return total;
}

export function calcularTotalDeMultasFuncional(emprestimos, dataReferencia) {
  return filtrarEmprestimosAtrasados(emprestimos, dataReferencia)
    .map((emprestimo) => calcularMulta(calcularDiasDeAtraso(emprestimo, dataReferencia), MULTA_DIARIA))
    .reduce((soma, multa) => soma + multa, 0);
}
