export default class Emprestimo {
  #id;
  #livro;
  #usuario;
  #dataEmprestimo;
  #dataPrevistaDevolucao;
  #dataDevolucao;

  constructor(id, livro, usuario, dataEmprestimo, dataPrevistaDevolucao, dataDevolucao = null) {
    this.#id = id;
    this.#livro = livro;
    this.#usuario = usuario;
    this.#dataEmprestimo = dataEmprestimo;
    this.#dataPrevistaDevolucao = dataPrevistaDevolucao;
    this.#dataDevolucao = dataDevolucao;
    Object.freeze(this);
  }

  get id() {
    return this.#id;
  }

  get livro() {
    return this.#livro;
  }

  get usuario() {
    return this.#usuario;
  }

  get dataEmprestimo() {
    return this.#dataEmprestimo;
  }

  get dataPrevistaDevolucao() {
    return this.#dataPrevistaDevolucao;
  }

  get dataDevolucao() {
    return this.#dataDevolucao;
  }

  get ativo() {
    return this.#dataDevolucao === null;
  }

  comDevolucao(dataDevolucao) {
    return new Emprestimo(
      this.#id,
      this.#livro,
      this.#usuario,
      this.#dataEmprestimo,
      this.#dataPrevistaDevolucao,
      dataDevolucao,
    );
  }
}
