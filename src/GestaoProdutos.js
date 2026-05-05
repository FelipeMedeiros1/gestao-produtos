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

    validarPercentual(percentual) {
        if (typeof percentual !== 'number' || percentual < 0 || percentual > 100) {
            throw new Error('Percentual deve ser um número entre 0 e 100.');
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

    obterPorNome(nome) {
        return this.produtos.find(p => p.nome === nome);
    }

    listarOrdenadosPorNome() {
        return [...this.produtos].sort((a, b) => a.nome.localeCompare(b.nome));
    }

    filtrarPorFaixaDePreco(precoMin, precoMax) {
        if (typeof precoMin !== 'number' || typeof precoMax !== 'number' || precoMin > precoMax) {
            throw new Error('Faixa de preço inválida.');
        }
        return this.produtos.filter(p => p.preco >= precoMin && p.preco <= precoMax);
    }

    calcularValorEstoque(indice) {
        this.validarIndice(indice);
        const p = this.produtos[indice];
        return p.preco * p.estoque;
    }

    calcularValorEstoqueGeral() {
        return this.produtos.reduce((total, p) => total + p.preco * p.estoque, 0);
    }

    aplicarDesconto(percentual, filtro = () => true) {
        this.validarPercentual(percentual);
        const fator = 1 - percentual / 100;
        this.produtos.forEach(p => {
            if (filtro(p)) p.preco *= fator;
        });
    }
}

