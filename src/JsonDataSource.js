import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { Produto, ProdutoService } from './GestaoProdutos.js';

/**
 * DataSource baseado em arquivo JSON.
 * Se o arquivo de dados não existir, semeia a partir de `caminhoSeed`.
 * Mantém os dados em memória via ProdutoService e persiste em `caminhoJson`
 * a cada modificação.
 */
export class JsonDataSource {
    constructor(caminhoJson) {
        this.caminhoJson = caminhoJson;
        this.service = new ProdutoService();
    }

    async carregar(caminhoSeed) {
        let conteudo;
        if (existsSync(this.caminhoJson)) {
            conteudo = await readFile(this.caminhoJson, 'utf-8');
        } else {
            conteudo = await readFile(caminhoSeed ?? this.caminhoJson, 'utf-8');
            await writeFile(this.caminhoJson, conteudo, 'utf-8');
        }
        const dados = JSON.parse(conteudo);
        this.service = new ProdutoService([...dados]);
    }

    async salvar() {
        await writeFile(
            this.caminhoJson,
            JSON.stringify(this.service.obterTodosProdutos(), null, 4),
            'utf-8'
        );
    }

    proximoId() {
        return this.service.obterTodosProdutos()
            .reduce((max, p) => Math.max(max, p.id), 0) + 1;
    }

    listar({ ordenadoPorNome = false, precoMin, precoMax } = {}) {
        if (precoMin !== undefined && precoMax !== undefined) {
            return this.service.filtrarPorFaixaDePreco(precoMin, precoMax);
        }
        if (ordenadoPorNome) return this.service.listarOrdenadosPorNome();
        return this.service.obterTodosProdutos();
    }

    obterPorId(id) {
        return this.service.obterPorId(id);
    }

    async criar({ nome, preco, estoque }) {
        const novo = new Produto(this.proximoId(), nome, preco, estoque);
        this.service.adicionarProduto(novo);
        await this.salvar();
        return novo;
    }

    async atualizar(id, { nome, preco, estoque }) {
        const produto = this.service.obterPorId(id);
        const indice = this.service.obterTodosProdutos().indexOf(produto);
        const atualizado = new Produto(id, nome, preco, estoque);
        this.service.atualizarProduto(indice, atualizado);
        await this.salvar();
        return atualizado;
    }

    async remover(id) {
        const produto = this.service.obterPorId(id);
        const indice = this.service.obterTodosProdutos().indexOf(produto);
        this.service.removerProduto(indice);
        await this.salvar();
    }

    valorEstoqueGeral() {
        return this.service.calcularValorEstoqueGeral();
    }

    async aplicarDesconto(percentual) {
        this.service.aplicarDesconto(percentual);
        await this.salvar();
        return this.service.obterTodosProdutos();
    }
}
