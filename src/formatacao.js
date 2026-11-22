import { formatarData } from './funcional/datas.js';

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatarMoeda(valor) {
  return formatadorMoeda.format(valor);
}

export function formatarLivro(livro, disponivel) {
  return `#${livro.id} ${livro.descrever()} ${disponivel ? 'disponível' : 'emprestado'}`;
}

export function formatarUsuario(usuario) {
  return `#${usuario.id} ${usuario.descrever()}`;
}

export function formatarEmprestimo(emprestimo) {
  const situacao = emprestimo.ativo
    ? `ativo, devolução prevista em ${formatarData(emprestimo.dataPrevistaDevolucao)}`
    : `devolvido em ${formatarData(emprestimo.dataDevolucao)}`;
  return `#${emprestimo.id} "${emprestimo.livro.titulo}" para ${emprestimo.usuario.nome}, emprestado em ${formatarData(emprestimo.dataEmprestimo)}, ${situacao}`;
}

export function formatarRelatorioDeMultas(relatorio) {
  const cabecalho = `Relatório de multas em ${formatarData(relatorio.dataReferencia)}`;
  if (relatorio.itens.length === 0) {
    return [cabecalho, 'Nenhum empréstimo ativo em atraso.'];
  }
  const linhas = relatorio.itens.map(
    (item) =>
      `Empréstimo #${item.emprestimoId} "${item.titulo}" (${item.usuario}): ${item.diasDeAtraso} dia(s) de atraso, multa de ${formatarMoeda(item.multa)}`,
  );
  return [cabecalho, ...linhas, `Total: ${formatarMoeda(relatorio.total)}`];
}

export function formatarEstatisticas(estatisticas) {
  const porCategoria = Object.entries(estatisticas.livrosPorCategoria).map(
    ([categoria, quantidade]) => `  ${categoria}: ${quantidade}`,
  );
  const porUsuario = Object.entries(estatisticas.emprestimosPorUsuario).map(
    ([nome, quantidade]) => `  ${nome}: ${quantidade}`,
  );
  return [
    'Livros por categoria:',
    ...porCategoria,
    'Empréstimos por usuário:',
    ...porUsuario,
    `Empréstimos ativos: ${estatisticas.emprestimosAtivos}`,
    `Empréstimos ativos em atraso: ${estatisticas.emprestimosAtrasados}`,
    `Valor total das multas: ${formatarMoeda(estatisticas.totalDeMultas)}`,
  ];
}
