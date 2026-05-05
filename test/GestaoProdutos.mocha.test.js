import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it, beforeEach } from 'mocha';
import { ProdutoService, Produto } from '../src/GestaoProdutos.js';

const produtosFixture = JSON.parse(readFileSync(new URL('./fixtures/produtos.json', import.meta.url), 'utf8'));

describe('gestaoProdutos (Mocha)', () => {
	let servico;

	beforeEach(() => {
		const produtos = produtosFixture.map((p) => new Produto(p.id, p.nome, p.preco, p.estoque));
		servico = new ProdutoService(produtos);
	});

	it('obterNomeDoProduto: retorna o nome correto por indice', () => {
		assert.equal(servico.obterNomeDoProduto(0), 'Camiseta');
	});

	it('obterPrecoDoProduto: retorna o preco correto por indice', () => {
		assert.equal(servico.obterPrecoDoProduto(1), 79.99);
	});

	it('obterEstoqueDoProduto: retorna o estoque correto por indice', () => {
		assert.equal(servico.obterEstoqueDoProduto(2), 30);
	});

	it('obterPorIndice: retorna o produto completo', () => {
		const produto = servico.obterPorIndice(0);

		assert.equal(produto.id, 1);
		assert.equal(produto.nome, 'Camiseta');
		assert.equal(produto.preco, 29.99);
		assert.equal(produto.estoque, 100);
	});

	it('obterPorId: retorna o produto correto', () => {
		const produto = servico.obterPorId(2);

		assert.equal(produto.nome, 'Calça Jeans');
		assert.equal(produto.preco, 79.99);
		assert.equal(produto.estoque, 50);
	});

	it('obterTodosProdutos: retorna lista inicial de 3 produtos', () => {
		const produtos = servico.obterTodosProdutos();

		assert.equal(produtos.length, 3);
	});

	it('adicionarProduto: adiciona um novo produto valido', () => {
		servico.adicionarProduto({
			id: 4,
			nome: 'Boné',
			preco: 49.9,
			estoque: 20
		});

		assert.equal(servico.obterTodosProdutos().length, 4);
		assert.equal(servico.obterPorId(4).nome, 'Boné');
	});

	it('adicionarProduto: lanca erro para ID duplicado', () => {
		assert.throws(() => servico.adicionarProduto({
			 id: 1, nome: 'Duplicado', preco: 10, estoque: 1 
			}), /já existe/);
	});

	it('atualizarProduto: substitui o produto no indice informado', () => {
		servico.atualizarProduto(0, {
			id: 10,
			nome: 'Regata',
			preco: 39.99,
			estoque: 80
		});

		const atualizado = servico.obterPorIndice(0);
		assert.equal(atualizado.id, 10);
		assert.equal(atualizado.nome, 'Regata');
		assert.equal(atualizado.preco, 39.99);
		assert.equal(atualizado.estoque, 80);
	});

	it('removerProduto: remove o item no indice informado', () => {
		servico.removerProduto(1);

		assert.equal(servico.obterTodosProdutos().length, 2);
		assert.equal(servico.obterPorIndice(1).nome, 'Tênis');
	});

	it('funcoes por indice: lancam erro para indice invalido', () => {
		assert.throws(() => servico.obterNomeDoProduto(-1), /Índice inválido/);
		assert.throws(() => servico.obterPrecoDoProduto(10), /Índice inválido/);
		assert.throws(() => servico.obterEstoqueDoProduto(1.5), /Índice inválido/);
		assert.throws(() => servico.obterPorIndice('0'), /Índice inválido/);
		assert.throws(() => servico.atualizarProduto(99, { id: 1, nome: 'X', preco: 1, estoque: 1 }), /Índice inválido/);
		assert.throws(() => servico.removerProduto(-2), /Índice inválido/);
	});

	it('obterPorId: lanca erro para id invalido e inexistente', () => {
		assert.throws(() => servico.obterPorId(0), /ID inválido/);
		assert.throws(() => servico.obterPorId(-1), /ID inválido/);
		assert.throws(() => servico.obterPorId(1.2), /ID inválido/);
		assert.throws(() => servico.obterPorId(999), /não encontrado/);
	});

	it('adicionarProduto: lanca erro para produto invalido', () => {
		assert.throws(() => servico.adicionarProduto(null), /objeto válido/);
		assert.throws(() => servico.adicionarProduto({ id: 4, nome: '', preco: 10, estoque: 1 }), /nome válido/);
		assert.throws(() => servico.adicionarProduto({ id: 4, nome: 'Teste', preco: -1, estoque: 1 }), /preço válido/);
		assert.throws(() => servico.adicionarProduto({ id: 4, nome: 'Teste', preco: 1, estoque: -1 }), /estoque válido/);
	});

	it('atualizarProduto: lanca erro quando dados do produto sao invalidos', () => {
		assert.throws(() => servico.atualizarProduto(0, null), /objeto válido/);
		assert.throws(() => servico.atualizarProduto(0, { id: 9, nome: '', preco: 10, estoque: 1 }), /nome válido/);
		assert.throws(() => servico.atualizarProduto(0, { id: 9, nome: 'X', preco: -10, estoque: 1 }), /preço válido/);
		assert.throws(() => servico.atualizarProduto(0, { id: 9, nome: 'X', preco: 10, estoque: -1 }), /estoque válido/);
	});
});
