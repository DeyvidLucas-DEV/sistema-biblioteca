import Biblioteca from './modelos/Biblioteca.js';

export function criarBibliotecaDeExemplo() {
  const biblioteca = new Biblioteca();

  const domCasmurro = biblioteca.cadastrarLivro('Dom Casmurro', 'Machado de Assis', 'Literatura');
  const vidasSecas = biblioteca.cadastrarLivro('Vidas Secas', 'Graciliano Ramos', 'Literatura');
  biblioteca.cadastrarLivro('A Hora da Estrela', 'Clarice Lispector', 'Literatura');
  const codigoLimpo = biblioteca.cadastrarLivro('Código Limpo', 'Robert C. Martin', 'Computação');
  const algoritmos = biblioteca.cadastrarLivro('Algoritmos: Teoria e Prática', 'Thomas H. Cormen', 'Computação');
  biblioteca.cadastrarLivro('Estruturas de Dados e Algoritmos em Java', 'Michael T. Goodrich', 'Computação');
  const calculo = biblioteca.cadastrarLivro('Cálculo Volume 1', 'James Stewart', 'Matemática');
  biblioteca.cadastrarLivro('Álgebra Linear', 'José Luiz Boldrini', 'Matemática');

  const ana = biblioteca.cadastrarUsuario('Ana Souza', '2024001');
  const bruno = biblioteca.cadastrarUsuario('Bruno Lima', '2024002');
  const carla = biblioteca.cadastrarUsuario('Carla Mendes', '2024003');

  biblioteca.registrarEmprestimo(domCasmurro.id, ana.id, '2026-11-01', '2026-11-08');
  biblioteca.registrarEmprestimo(codigoLimpo.id, ana.id, '2026-11-10', '2026-11-17');
  biblioteca.registrarEmprestimo(calculo.id, bruno.id, '2026-11-05', '2026-11-12');
  biblioteca.registrarEmprestimo(algoritmos.id, carla.id, '2026-11-18', '2026-11-25');
  const devolvido = biblioteca.registrarEmprestimo(vidasSecas.id, bruno.id, '2026-10-20', '2026-10-27');
  biblioteca.registrarDevolucao(devolvido.id, '2026-10-30');

  return biblioteca;
}
