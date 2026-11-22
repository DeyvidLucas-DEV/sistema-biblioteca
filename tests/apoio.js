import Livro from '../src/modelos/Livro.js';
import Usuario from '../src/modelos/Usuario.js';
import Emprestimo from '../src/modelos/Emprestimo.js';

export const ana = new Usuario(1, 'Ana Souza', '2024001');
export const bruno = new Usuario(2, 'Bruno Lima', '2024002');

export const livros = Object.freeze([
  new Livro(1, 'Dom Casmurro', 'Machado de Assis', 'Literatura'),
  new Livro(2, 'Código Limpo', 'Robert C. Martin', 'Computação'),
  new Livro(3, 'Cálculo Volume 1', 'James Stewart', 'Matemática'),
  new Livro(4, 'Algoritmos', 'Thomas H. Cormen', 'Computação'),
]);

export function criarEmprestimos() {
  return [
    new Emprestimo(1, livros[0], ana, '2026-11-01', '2026-11-08'),
    new Emprestimo(2, livros[1], ana, '2026-11-10', '2026-11-17'),
    new Emprestimo(3, livros[2], bruno, '2026-11-15', '2026-11-25'),
    new Emprestimo(4, livros[3], bruno, '2026-10-01', '2026-10-08', '2026-10-20'),
  ];
}

export function fotografar(emprestimos) {
  return emprestimos.map((emprestimo) => [emprestimo.id, emprestimo.livro.id, emprestimo.dataDevolucao]);
}
