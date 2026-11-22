export default class Usuario {
  #id;
  #nome;
  #matricula;

  constructor(id, nome, matricula) {
    this.#id = id;
    this.#nome = nome;
    this.#matricula = matricula;
    Object.freeze(this);
  }

  get id() {
    return this.#id;
  }

  get nome() {
    return this.#nome;
  }

  get matricula() {
    return this.#matricula;
  }

  descrever() {
    return `${this.#nome} (matrícula ${this.#matricula})`;
  }
}
