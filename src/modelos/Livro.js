export default class Livro {
  #id;
  #titulo;
  #autor;
  #categoria;

  constructor(id, titulo, autor, categoria) {
    this.#id = id;
    this.#titulo = titulo;
    this.#autor = autor;
    this.#categoria = categoria;
    Object.freeze(this);
  }

  get id() {
    return this.#id;
  }

  get titulo() {
    return this.#titulo;
  }

  get autor() {
    return this.#autor;
  }

  get categoria() {
    return this.#categoria;
  }

  descrever() {
    return `${this.#titulo} (${this.#autor}) [${this.#categoria}]`;
  }
}
