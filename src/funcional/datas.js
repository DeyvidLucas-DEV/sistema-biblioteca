const FORMATO_DATA = /^\d{4}-\d{2}-\d{2}$/;
const MILISSEGUNDOS_POR_DIA = 86400000;

function paraMilissegundos(data) {
  const [ano, mes, dia] = data.split('-').map(Number);
  return Date.UTC(ano, mes - 1, dia);
}

export function ehDataValida(data) {
  if (typeof data !== 'string' || !FORMATO_DATA.test(data)) {
    return false;
  }
  const [ano, mes, dia] = data.split('-').map(Number);
  const convertida = new Date(paraMilissegundos(data));
  return (
    convertida.getUTCFullYear() === ano &&
    convertida.getUTCMonth() === mes - 1 &&
    convertida.getUTCDate() === dia
  );
}

export function diferencaEmDias(dataInicial, dataFinal) {
  return Math.round((paraMilissegundos(dataFinal) - paraMilissegundos(dataInicial)) / MILISSEGUNDOS_POR_DIA);
}

export function formatarData(data) {
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}
