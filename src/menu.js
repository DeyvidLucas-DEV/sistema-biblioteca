import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { criarBibliotecaDeExemplo } from './dadosDeExemplo.js';
import { calcularTotalDeMultasFuncional, calcularTotalDeMultasImperativo } from './funcional/comparacao.js';
import {
  formatarEmprestimo,
  formatarEstatisticas,
  formatarLivro,
  formatarMoeda,
  formatarRelatorioDeMultas,
  formatarUsuario,
} from './formatacao.js';

class EntradaEncerrada extends Error {}

const OPCOES = [
  '1. Listar livros',
  '2. Cadastrar livro',
  '3. Consultar livros por categoria',
  '4. Listar usuários',
  '5. Cadastrar usuário',
  '6. Registrar empréstimo',
  '7. Registrar devolução',
  '8. Listar empréstimos',
  '9. Empréstimos de um usuário',
  '10. Relatório de multas',
  '11. Estatísticas',
  '12. Comparar versões imperativa e funcional',
  '0. Sair',
];

const biblioteca = criarBibliotecaDeExemplo();
const terminal = createInterface({ input, output, terminal: false });
const linhas = terminal[Symbol.asyncIterator]();

function exibir(linhas) {
  console.log(linhas.length ? linhas.join('\n') : 'Nenhum registro.');
}

async function perguntar(texto) {
  output.write(`${texto}: `);
  const { value, done } = await linhas.next();
  if (done) {
    throw new EntradaEncerrada();
  }
  return value.trim();
}

async function perguntarNumero(texto) {
  const valor = Number(await perguntar(texto));
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new Error('Informe um número inteiro positivo.');
  }
  return valor;
}

const acoes = {
  1: async () =>
    exibir(biblioteca.listarLivros().map((livro) => formatarLivro(livro, biblioteca.livroEstaDisponivel(livro.id)))),
  2: async () => {
    const livro = biblioteca.cadastrarLivro(await perguntar('Título'), await perguntar('Autor'), await perguntar('Categoria'));
    console.log(`Livro cadastrado: ${formatarLivro(livro, true)}`);
  },
  3: async () => {
    const livros = biblioteca.consultarLivrosPorCategoria(await perguntar('Categoria'));
    exibir(livros.map((livro) => formatarLivro(livro, biblioteca.livroEstaDisponivel(livro.id))));
  },
  4: async () => exibir(biblioteca.listarUsuarios().map(formatarUsuario)),
  5: async () => {
    const usuario = biblioteca.cadastrarUsuario(await perguntar('Nome'), await perguntar('Matrícula'));
    console.log(`Usuário cadastrado: ${formatarUsuario(usuario)}`);
  },
  6: async () => {
    const emprestimo = biblioteca.registrarEmprestimo(
      await perguntarNumero('Id do livro'),
      await perguntarNumero('Id do usuário'),
      await perguntar('Data do empréstimo (AAAA-MM-DD)'),
      await perguntar('Data prevista de devolução (AAAA-MM-DD)'),
    );
    console.log(`Empréstimo registrado: ${formatarEmprestimo(emprestimo)}`);
  },
  7: async () => {
    const emprestimo = biblioteca.registrarDevolucao(
      await perguntarNumero('Id do empréstimo'),
      await perguntar('Data da devolução (AAAA-MM-DD)'),
    );
    console.log(`Devolução registrada: ${formatarEmprestimo(emprestimo)}`);
  },
  8: async () => exibir(biblioteca.listarEmprestimos().map(formatarEmprestimo)),
  9: async () => exibir(biblioteca.consultarEmprestimosDoUsuario(await perguntarNumero('Id do usuário')).map(formatarEmprestimo)),
  10: async () => exibir(formatarRelatorioDeMultas(biblioteca.gerarRelatorioDeMultas(await perguntar('Data de referência (AAAA-MM-DD)')))),
  11: async () => exibir(formatarEstatisticas(biblioteca.gerarEstatisticas(await perguntar('Data de referência (AAAA-MM-DD)')))),
  12: async () => {
    const dataReferencia = await perguntar('Data de referência (AAAA-MM-DD)');
    const relatorio = biblioteca.gerarRelatorioDeMultas(dataReferencia);
    const emprestimos = biblioteca.listarEmprestimos();
    exibir([
      `Imperativa: ${formatarMoeda(calcularTotalDeMultasImperativo(emprestimos, relatorio.dataReferencia))}`,
      `Funcional:  ${formatarMoeda(calcularTotalDeMultasFuncional(emprestimos, relatorio.dataReferencia))}`,
    ]);
  },
};

async function executar() {
  console.log('Sistema de Gerenciamento de Biblioteca');
  while (true) {
    console.log(`\n${OPCOES.join('\n')}`);
    const opcao = await perguntar('Escolha uma opção').catch(() => '0');
    if (opcao === '0') {
      break;
    }
    const acao = acoes[opcao];
    if (!acao) {
      console.log('Opção inválida.');
      continue;
    }
    try {
      await acao();
    } catch (erro) {
      if (erro instanceof EntradaEncerrada) {
        break;
      }
      console.log(`Erro: ${erro.message}`);
    }
  }
  terminal.close();
}

executar();
