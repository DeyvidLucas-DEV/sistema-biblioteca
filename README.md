# Sistema de Gerenciamento de Biblioteca

Atividade prática da disciplina de Linguagens de Programação, integrando Programação Orientada a Objetos e Programação Funcional.

O sistema gerencia livros, usuários e empréstimos de uma biblioteca universitária, registra devoluções, identifica atrasos, calcula multas de R$ 2,00 por dia e gera relatórios e estatísticas. Os dados ficam em memória, sem banco de dados.

## Integrantes

| Nome | Matrícula |
| ---- | --------- |
|      |           |
|      |           |
|      |           |
|      |           |

## Linguagem e requisitos

- JavaScript (módulos ES) executado com Node.js 20 ou superior
- Nenhuma dependência externa: os testes usam o executor nativo `node:test`

## Como executar

```bash
git clone <url-do-repositorio>
cd sistema-biblioteca
```

Demonstração completa, com data de referência opcional (padrão 2026-11-22):

```bash
npm run demo
npm run demo -- 2026-12-01
```

Menu interativo, já carregado com livros, usuários e empréstimos de exemplo:

```bash
npm start
```

Testes automatizados:

```bash
npm test
```

As datas são informadas no formato `AAAA-MM-DD`.

## Funcionalidades

- Cadastro e consulta de livros e usuários
- Consulta de livros por categoria
- Registro de empréstimos e devoluções com controle de disponibilidade
- Consulta de todos os empréstimos e dos empréstimos de um usuário
- Relatório de multas dos empréstimos ativos e atrasados em uma data de referência
- Estatísticas: livros por categoria, empréstimos por usuário, empréstimos ativos, empréstimos ativos em atraso e valor total das multas
- Comparação entre a versão imperativa e a funcional do cálculo do total de multas

## Estrutura

```
src/
  modelos/
    Livro.js            identificador, título, autor e categoria
    Usuario.js          identificador, nome e matrícula
    Emprestimo.js       livro, usuário, datas e situação do empréstimo
    Biblioteca.js       estado do sistema e operações de gerenciamento
  funcional/
    datas.js            validação e diferença de datas
    consultas.js        filtragens e dias de atraso
    multas.js           cálculo da multa e relatório de multas
    estatisticas.js     contagens e estatísticas
    comparacao.js       total de multas nas versões imperativa e funcional
  formatacao.js         transformação dos resultados em texto
  dadosDeExemplo.js     carga inicial usada pelo menu e pela demonstração
  demonstracao.js       roteiro que executa todas as funcionalidades
  menu.js               interface de linha de comando
tests/
  modelos.test.js
  funcional.test.js
  biblioteca.test.js
```

## Modelagem orientada a objetos

| Classe | Responsabilidade |
| ------ | ---------------- |
| `Livro` | Representa um exemplar do acervo |
| `Usuario` | Representa uma pessoa cadastrada |
| `Emprestimo` | Liga um livro a um usuário e guarda as datas do empréstimo |
| `Biblioteca` | Mantém as coleções, aplica as regras de negócio e entrega os dados para relatórios e estatísticas |

Relacionamentos:

- `Biblioteca` agrega vários `Livro`, `Usuario` e `Emprestimo`
- Cada `Emprestimo` referencia exatamente um `Livro` e um `Usuario`
- Um `Usuario` pode aparecer em vários `Emprestimo`; um `Livro` pode ter vários empréstimos ao longo do tempo, mas no máximo um ativo

Encapsulamento: todos os atributos são campos privados (`#`), lidos apenas por getters. `Livro`, `Usuario` e `Emprestimo` são congelados com `Object.freeze` e não aceitam alteração depois de criados. A `Biblioteca` não expõe suas coleções internas; os métodos `listar...` devolvem cópias congeladas.

## Regras de negócio

1. Um usuário pode ter vários empréstimos; cada empréstimo tem um único usuário e um único livro.
2. Um livro não pode estar emprestado para mais de um usuário ao mesmo tempo (`Biblioteca.livroEstaDisponivel`).
3. Cada livro é um exemplar único.
4. A devolução registra a data e torna o livro disponível de novo.
5. Um empréstimo está atrasado quando a data de referência passa da data prevista e o livro ainda não foi devolvido.
6. A multa é de R$ 2,00 por dia de atraso; sem atraso, não há multa.
7. O relatório de multas considera apenas empréstimos ativos e atrasados, na data de referência informada.

Validações adicionais: datas no formato `AAAA-MM-DD` e existentes no calendário, devolução prevista posterior à data do empréstimo, devolução não anterior ao empréstimo, empréstimo não devolvido duas vezes e matrícula sem repetição.

## Programação funcional

| Requisito | Onde está |
| --------- | --------- |
| Filtragem de livros por categoria com `filter` | `filtrarLivrosPorCategoria` em `consultas.js` |
| Função pura de multa | `calcularMulta(diasDeAtraso, valorMultaDiaria)` em `multas.js` |
| Empréstimos atrasados com `filter` | `filtrarEmprestimosAtrasados` em `consultas.js` |
| Relatório com `filter`, `map` e `reduce` | `gerarRelatorioDeMultas` em `multas.js` |
| Estatísticas com `reduce` | `contarLivrosPorCategoria` e `contarEmprestimosPorUsuario` em `estatisticas.js` |
| Comparação entre paradigmas | `calcularTotalDeMultasImperativo` e `calcularTotalDeMultasFuncional` em `comparacao.js` |

Funções puras do projeto: `calcularMulta`, `calcularDiasDeAtraso`, `estaAtrasado`, `filtrarLivrosPorCategoria`, `filtrarEmprestimosAtivos`, `filtrarEmprestimosAtrasados`, `gerarRelatorioDeMultas`, `contarLivrosPorCategoria`, `contarEmprestimosPorUsuario`, `gerarEstatisticas`, `ehDataValida` e `diferencaEmDias`. Todas dependem apenas dos parâmetros, não leem a data do sistema e não alteram o que recebem.

### Fluxo do relatório de multas

1. `Biblioteca.gerarRelatorioDeMultas(dataReferencia)` valida a data e entrega a coleção interna de empréstimos (impuro, pois lê o estado da biblioteca).
2. `filtrarEmprestimosAtrasados` seleciona os empréstimos ativos em atraso com `filter` (pura).
3. `map` transforma cada empréstimo em um item com dias de atraso e multa, usando `calcularDiasDeAtraso` e `calcularMulta` (puras).
4. `reduce` soma as multas dos itens e produz o total (pura).
5. `formatarRelatorioDeMultas` transforma o relatório em linhas de texto (pura) e o menu as imprime no terminal (impuro).

### Imutabilidade

- As consultas usam `filter`, `map` e `reduce`, que criam novas coleções em vez de alterar a original.
- As estatísticas acumulam com objetos novos a cada passo (`{ ...contagem, [chave]: valor }`).
- O relatório e as estatísticas são devolvidos congelados.
- A devolução não altera o empréstimo existente: `Emprestimo.comDevolucao` cria um novo objeto, e a `Biblioteca` troca a referência na sua coleção com `map`.

### Separação entre regras puras e efeitos colaterais

As funções em `src/funcional` não têm efeitos colaterais. As operações que mudam o estado (cadastros, empréstimos e devoluções) ficam concentradas nos métodos da classe `Biblioteca`, e a leitura do teclado e a escrita na tela ficam em `menu.js` e `demonstracao.js`.

## Testes

`npm test` executa 21 testes que cobrem:

- encapsulamento e imutabilidade das entidades;
- funções puras de datas, filtragem, atraso e multa;
- relatório de multas, incluindo a garantia de que os dados originais não mudam;
- estatísticas;
- equivalência entre as versões imperativa e funcional;
- regras da `Biblioteca`: disponibilidade, livro já emprestado, vários empréstimos por usuário, validação de datas, devolução e devolução repetida.
