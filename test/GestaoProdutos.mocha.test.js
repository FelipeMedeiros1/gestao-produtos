import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'mocha';

describe('gestaoProdutos (Mocha)', () => {
	let obterNomeDoProduto, obterPrecoDoProduto, obterEstoqueDoProduto, 
	    obterPorIndice, obterPorId, obterTodosProdutos, 
	    adicionarProduto, atualizarProduto, removerProduto;

	beforeEach(async () => {
		// Recarrega o módulo a cada teste para isolar o estado
		const modulo = await import(`../src/GestaoProdutos.js?t=${Date.now()}`);
		obterNomeDoProduto = modulo.obterNomeDoProduto;
		obterPrecoDoProduto = modulo.obterPrecoDoProduto;
		obterEstoqueDoProduto = modulo.obterEstoqueDoProduto;
		obterPorIndice = modulo.obterPorIndice;
		obterPorId = modulo.obterPorId;
		obterTodosProdutos = modulo.obterTodosProdutos;
		adicionarProduto = modulo.adicionarProduto;
		atualizarProduto = modulo.atualizarProduto;
		removerProduto = modulo.removerProduto;
	});

	it('obterNomeDoProduto: retorna o nome correto por indice', () => {
		assert.equal(obterNomeDoProduto(0), 'Camiseta');
	});

	it('obterPrecoDoProduto: retorna o preco correto por indice', () => {
		assert.equal(obterPrecoDoProduto(1), 79.99);
	});

	it('obterEstoqueDoProduto: retorna o estoque correto por indice', () => {
		assert.equal(obterEstoqueDoProduto(2), 30);
	});

	it('obterPorIndice: retorna o produto completo', () => {
		const produto = obterPorIndice(0);

		assert.equal(produto.id, 1);
		assert.equal(produto.nome, 'Camiseta');
		assert.equal(produto.preco, 29.99);
		assert.equal(produto.estoque, 100);
	});

	it('obterPorId: retorna o produto correto', () => {
		const produto = obterPorId(2);

		assert.equal(produto.nome, 'Calça Jeans');
		assert.equal(produto.preco, 79.99);
		assert.equal(produto.estoque, 50);
	});

	it('obterTodosProdutos: retorna lista inicial de 3 produtos', () => {
		const produtos = obterTodosProdutos();

		assert.equal(produtos.length, 3);
	});

	it('adicionarProduto: adiciona um novo produto valido', () => {
		adicionarProduto({
			id: 4,
			nome: 'Boné',
			preco: 49.9,
			estoque: 20
		});

		assert.equal(obterTodosProdutos().length, 4);
		assert.equal(obterPorId(4).nome, 'Boné');
	});

	it('adicionarProduto: lanca erro para ID duplicado', () => {
		assert.throws(
			() => adicionarProduto({ id: 1, nome: 'Duplicado', preco: 10, estoque: 1 }),
			/já existe/
		);
	});

	it('atualizarProduto: substitui o produto no indice informado', () => {
		atualizarProduto(0, {
			id: 10,
			nome: 'Regata',
			preco: 39.99,
			estoque: 80
		});

		const atualizado = obterPorIndice(0);
		assert.equal(atualizado.id, 10);
		assert.equal(atualizado.nome, 'Regata');
		assert.equal(atualizado.preco, 39.99);
		assert.equal(atualizado.estoque, 80);
	});

	it('removerProduto: remove o item no indice informado', () => {
		removerProduto(1);

		assert.equal(obterTodosProdutos().length, 2);
		assert.equal(obterPorIndice(1).nome, 'Tênis');
	});

	it('funcoes por indice: lancam erro para indice invalido', () => {
		assert.throws(() => obterNomeDoProduto(-1), /Índice inválido/);
		assert.throws(() => obterPrecoDoProduto(10), /Índice inválido/);
		assert.throws(() => obterEstoqueDoProduto(1.5), /Índice inválido/);
		assert.throws(() => obterPorIndice('0'), /Índice inválido/);
		assert.throws(() => atualizarProduto(99, { id: 1, nome: 'X', preco: 1, estoque: 1 }),/Índice inválido/);
		assert.throws(() => removerProduto(-2), /Índice inválido/);
	});

	it('obterPorId: lanca erro para id invalido e inexistente', () => {
		assert.throws(() => obterPorId(0), /ID inválido/);
		assert.throws(() => obterPorId(-5), /ID inválido/);
		assert.throws(() => obterPorId(1.2), /ID inválido/);
		assert.throws(() => obterPorId(999), /não encontrado/);
	});

	it('adicionarProduto: lanca erro para produto invalido', () => {
		assert.throws(() => adicionarProduto(null), /objeto válido/);
		assert.throws(() => adicionarProduto({ id: 4, nome: '', preco: 10, estoque: 1 }),/nome válido/);
		assert.throws(() => adicionarProduto({ id: 4, nome: 'Teste', preco: -1, estoque: 1 }),/preço válido/);
		assert.throws(() => adicionarProduto({ id: 4, nome: 'Teste', preco: 1, estoque: -1 }),/estoque válido/);
	});

	it('atualizarProduto: lanca erro quando dados do produto sao invalidos', () => {
		assert.throws(() => atualizarProduto(0, null), /objeto válido/);
		assert.throws(() => atualizarProduto(0, { id: 9, nome: '', preco: 10, estoque: 1 }),/nome válido/);
		assert.throws(() => atualizarProduto(0, { id: 9, nome: 'X', preco: -10, estoque: 1 }),/preço válido/);
		assert.throws(() => atualizarProduto(0, { id: 9, nome: 'X', preco: 10, estoque: -1 }),/estoque válido/);
	});
});