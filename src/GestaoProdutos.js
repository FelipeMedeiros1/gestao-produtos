export class Produto {
    constructor(id, nome, preco, estoque) {
        this.id = id;
        this.nome = nome;
        this.preco = preco;
        this.estoque = estoque;
    }

    static validar(produto) {
        if (!produto || typeof produto !== 'object') {
            throw new Error('Produto deve ser um objeto válido.');
        }
        if (!produto.nome || typeof produto.nome !== 'string' || produto.nome.trim() === '') {
            throw new Error('Produto deve possuir um nome válido (string não vazia).');
        }
        if (typeof produto.preco !== 'number' || produto.preco < 0) {
            throw new Error('Produto deve possuir um preço válido (número não negativo).');
        }
        if (typeof produto.estoque !== 'number' || produto.estoque < 0) {
            throw new Error('Produto deve possuir um estoque válido (número não negativo).');
        }
    }
}

export class ProdutoService {
    constructor(produtos = []) {
        this.produtos = produtos;
    }

    validarIndice(indice) {
        if (!Number.isInteger(indice) || indice < 0 || indice >= this.produtos.length) {
            throw new Error(`Índice inválido: ${indice}. Deve estar entre 0 e ${this.produtos.length - 1}.`);
        }
    }

    validarId(id) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error(`ID inválido: ${id}. Deve ser um número inteiro positivo.`);
        }
    }

    obterNomeDoProduto(indice) {
        this.validarIndice(indice);
        return this.produtos.at(indice).nome;
    }

    obterPrecoDoProduto(indice) {
        this.validarIndice(indice);
        return this.produtos.at(indice).preco;
    }

    obterEstoqueDoProduto(indice) {
        this.validarIndice(indice);
        return this.produtos.at(indice).estoque;
    }

    obterPorIndice(indice) {
        this.validarIndice(indice);
        return this.produtos.at(indice);
    }

    obterPorId(id) {
        this.validarId(id);
        const produto = this.produtos.find(produto => produto.id === id);
        if (!produto) {
            throw new Error(`Produto com ID ${id} não encontrado.`);
        }
        return produto;
    }

    obterTodosProdutos() {
        return this.produtos;
    }

    adicionarProduto(produto) {
        Produto.validar(produto);
        if (this.produtos.some(p => p.id === produto.id)) {
            throw new Error(`Produto com ID ${produto.id} já existe.`);
        }
        this.produtos.push(produto);
    }

    atualizarProduto(indice, produtoAtualizado) {
        this.validarIndice(indice);
        Produto.validar(produtoAtualizado);
        this.produtos[indice] = produtoAtualizado;
    }

    removerProduto(indice) {
        this.validarIndice(indice);
        this.produtos.splice(indice, 1);
    }
}

const produtos = [
    new Produto(1, 'Camiseta', 29.99, 100),
    new Produto(2, 'Calça Jeans', 79.99, 50),
    new Produto(3, 'Tênis', 149.99, 30)
];

const produtoService = new ProdutoService(produtos);

export default produtoService;

export const obterNomeDoProduto = (indice) => produtoService.obterNomeDoProduto(indice);
export const obterPrecoDoProduto = (indice) => produtoService.obterPrecoDoProduto(indice);
export const obterEstoqueDoProduto = (indice) => produtoService.obterEstoqueDoProduto(indice);
export const obterPorIndice = (indice) => produtoService.obterPorIndice(indice);
export const obterPorId = (id) => produtoService.obterPorId(id);
export const obterTodosProdutos = () => produtoService.obterTodosProdutos();
export const adicionarProduto = (produto) => produtoService.adicionarProduto(produto);
export const atualizarProduto = (indice, produtoAtualizado) => produtoService.atualizarProduto(indice, produtoAtualizado);
export const removerProduto = (indice) => produtoService.removerProduto(indice);


