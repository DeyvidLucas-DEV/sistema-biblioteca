import Livro from './Livro.js';
import Usuario from './Usuario.js';
import Emprestimo from './Emprestimo.js';
import { ehDataValida, diferencaEmDias } from '../funcional/datas.js';
import { filtrarLivrosPorCategoria } from '../funcional/consultas.js';
import { gerarRelatorioDeMultas } from '../funcional/multas.js';
import { gerarEstatisticas } from '../funcional/estatisticas.js';

function exigirTexto(valor, campo) {
  const texto = typeof valor === 'string' ? valor.trim() : '';
  if (!texto) {
    throw new Error(`Informe ${campo}.`);
  }
  return texto;
}

function exigirData(valor, campo) {
  if (!ehDataValida(valor)) {
    throw new Error(`Informe ${campo} no formato AAAA-MM-DD.`);
  }
  return valor;
}

export default class Biblioteca {
  #livros = [];
  #usuarios = [];
  #emprestimos = [];
  #proximoIdLivro = 1;
  #proximoIdUsuario = 1;
  #proximoIdEmprestimo = 1;

  cadastrarLivro(titulo, autor, categoria) {
    const livro = new Livro(
      this.#proximoIdLivro,
      exigirTexto(titulo, 'o título'),
      exigirTexto(autor, 'o autor'),
      exigirTexto(categoria, 'a categoria'),
    );
    this.#livros = [...this.#livros, livro];
    this.#proximoIdLivro += 1;
    return livro;
  }

  cadastrarUsuario(nome, matricula) {
    const matriculaInformada = exigirTexto(matricula, 'a matrícula');
    if (this.#usuarios.some((usuario) => usuario.matricula === matriculaInformada)) {
      throw new Error(`Já existe um usuário com a matrícula ${matriculaInformada}.`);
    }
    const usuario = new Usuario(this.#proximoIdUsuario, exigirTexto(nome, 'o nome'), matriculaInformada);
    this.#usuarios = [...this.#usuarios, usuario];
    this.#proximoIdUsuario += 1;
    return usuario;
  }

  buscarLivro(id) {
    const livro = this.#livros.find((item) => item.id === id);
    if (!livro) {
      throw new Error(`Livro ${id} não encontrado.`);
    }
    return livro;
  }

  buscarUsuario(id) {
    const usuario = this.#usuarios.find((item) => item.id === id);
    if (!usuario) {
      throw new Error(`Usuário ${id} não encontrado.`);
    }
    return usuario;
  }

  buscarEmprestimo(id) {
    const emprestimo = this.#emprestimos.find((item) => item.id === id);
    if (!emprestimo) {
      throw new Error(`Empréstimo ${id} não encontrado.`);
    }
    return emprestimo;
  }

  listarLivros() {
    return Object.freeze([...this.#livros]);
  }

  listarUsuarios() {
    return Object.freeze([...this.#usuarios]);
  }

  listarEmprestimos() {
    return Object.freeze([...this.#emprestimos]);
  }

  consultarLivrosPorCategoria(categoria) {
    return filtrarLivrosPorCategoria(this.#livros, categoria);
  }

  consultarEmprestimosDoUsuario(idUsuario) {
    this.buscarUsuario(idUsuario);
    return this.#emprestimos.filter((emprestimo) => emprestimo.usuario.id === idUsuario);
  }

  livroEstaDisponivel(idLivro) {
    this.buscarLivro(idLivro);
    return !this.#emprestimos.some((emprestimo) => emprestimo.ativo && emprestimo.livro.id === idLivro);
  }

  registrarEmprestimo(idLivro, idUsuario, dataEmprestimo, dataPrevistaDevolucao) {
    const livro = this.buscarLivro(idLivro);
    const usuario = this.buscarUsuario(idUsuario);
    exigirData(dataEmprestimo, 'a data do empréstimo');
    exigirData(dataPrevistaDevolucao, 'a data prevista de devolução');

    if (diferencaEmDias(dataEmprestimo, dataPrevistaDevolucao) <= 0) {
      throw new Error('A data prevista de devolução deve ser posterior à data do empréstimo.');
    }
    if (!this.livroEstaDisponivel(idLivro)) {
      throw new Error(`O livro "${livro.titulo}" já está emprestado.`);
    }

    const emprestimo = new Emprestimo(this.#proximoIdEmprestimo, livro, usuario, dataEmprestimo, dataPrevistaDevolucao);
    this.#emprestimos = [...this.#emprestimos, emprestimo];
    this.#proximoIdEmprestimo += 1;
    return emprestimo;
  }

  registrarDevolucao(idEmprestimo, dataDevolucao) {
    const emprestimo = this.buscarEmprestimo(idEmprestimo);
    exigirData(dataDevolucao, 'a data de devolução');

    if (!emprestimo.ativo) {
      throw new Error(`O empréstimo ${idEmprestimo} já foi devolvido.`);
    }
    if (diferencaEmDias(emprestimo.dataEmprestimo, dataDevolucao) < 0) {
      throw new Error('A data de devolução não pode ser anterior à data do empréstimo.');
    }

    const devolvido = emprestimo.comDevolucao(dataDevolucao);
    this.#emprestimos = this.#emprestimos.map((item) => (item.id === idEmprestimo ? devolvido : item));
    return devolvido;
  }

  gerarRelatorioDeMultas(dataReferencia) {
    return gerarRelatorioDeMultas(this.#emprestimos, exigirData(dataReferencia, 'a data de referência'));
  }

  gerarEstatisticas(dataReferencia) {
    return gerarEstatisticas(this.#livros, this.#emprestimos, exigirData(dataReferencia, 'a data de referência'));
  }
}
