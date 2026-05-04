import test from 'node:test';
import assert from 'node:assert/strict';

async function carregarModulo() {
	return import(`../src/GestaoProdutos.js?cacheBust=${Date.now()}-${Math.random()}`);
}

test('obterNomeDoProduto: retorna o nome correto por indice', async () => {
	const { obterNomeDoProduto } = await carregarModulo();
	assert.equal(obterNomeDoProduto(0), 'Camiseta');
});

test('obterPrecoDoProduto: retorna o preco correto por indice', async () => {
	const { obterPrecoDoProduto } = await carregarModulo();
	assert.equal(obterPrecoDoProduto(1), 79.99);
});

test('obterEstoqueDoProduto: retorna o estoque correto por indice', async () => {
	const { obterEstoqueDoProduto } = await carregarModulo();
	assert.equal(obterEstoqueDoProduto(2), 30);
});

test('obterPorIndice: retorna o produto completo', async () => {
	const { obterPorIndice } = await carregarModulo();
	const produto = obterPorIndice(0);

	assert.equal(produto.id, 1);
	assert.equal(produto.nome, 'Camiseta');
	assert.equal(produto.preco, 29.99);
	assert.equal(produto.estoque, 100);
});

test('obterPorId: retorna o produto correto', async () => {
	const { obterPorId } = await carregarModulo();
	const produto = obterPorId(2);

	assert.equal(produto.nome, 'Calça Jeans');
	assert.equal(produto.preco, 79.99);
	assert.equal(produto.estoque, 50);
});

test('obterTodosProdutos: retorna lista inicial de 3 produtos', async () => {
	const { obterTodosProdutos } = await carregarModulo();
	const produtos = obterTodosProdutos();

	assert.equal(produtos.length, 3);
});

test('adicionarProduto: adiciona um novo produto valido', async () => {
	const { adicionarProduto, obterTodosProdutos, obterPorId } = await carregarModulo();

	adicionarProduto({
		id: 4,
		nome: 'Boné',
		preco: 49.9,
		estoque: 20
	});

	assert.equal(obterTodosProdutos().length, 4);
	assert.equal(obterPorId(4).nome, 'Boné');
});

test('atualizarProduto: substitui o produto no indice informado', async () => {
	const { atualizarProduto, obterPorIndice } = await carregarModulo();

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

test('removerProduto: remove o item no indice informado', async () => {
	const { removerProduto, obterTodosProdutos, obterPorIndice } = await carregarModulo();

	removerProduto(1);

	assert.equal(obterTodosProdutos().length, 2);
	assert.equal(obterPorIndice(1).nome, 'Tênis');
});

test('funcoes por indice: lancam erro para indice invalido', async () => {
	const {
		obterNomeDoProduto,
		obterPrecoDoProduto,
		obterEstoqueDoProduto,
		obterPorIndice,
		atualizarProduto,
		removerProduto
	} = await carregarModulo();

	assert.throws(() => obterNomeDoProduto(-1), /Índice inválido/);
	assert.throws(() => obterPrecoDoProduto(10), /Índice inválido/);
	assert.throws(() => obterEstoqueDoProduto(1.5), /Índice inválido/);
	assert.throws(() => obterPorIndice('0'), /Índice inválido/);
	assert.throws(
		() => atualizarProduto(99, { id: 1, nome: 'X', preco: 1, estoque: 1 }),
		/Índice inválido/
	);
	assert.throws(() => removerProduto(-2), /Índice inválido/);
});

test('obterPorId: lanca erro para id invalido e inexistente', async () => {
	const { obterPorId } = await carregarModulo();

	assert.throws(() => obterPorId(0), /ID inválido/);
	assert.throws(() => obterPorId(-5), /ID inválido/);
	assert.throws(() => obterPorId(1.2), /ID inválido/);
	assert.throws(() => obterPorId(999), /não encontrado/);
});

test('adicionarProduto: lanca erro para produto invalido', async () => {
	const { adicionarProduto } = await carregarModulo();

	assert.throws(() => adicionarProduto(null), /objeto válido/);
	assert.throws(
		() => adicionarProduto({ id: 4, nome: '', preco: 10, estoque: 1 }),
		/nome válido/
	);
	assert.throws(
		() => adicionarProduto({ id: 4, nome: 'Teste', preco: -1, estoque: 1 }),
		/preço válido/
	);
	assert.throws(
		() => adicionarProduto({ id: 4, nome: 'Teste', preco: 1, estoque: -1 }),
		/estoque válido/
	);
});

test('adicionarProduto: lanca erro para ID duplicado', async () => {
	const { adicionarProduto } = await carregarModulo();
	assert.throws(
		() => adicionarProduto({ id: 1, nome: 'Duplicado', preco: 10, estoque: 1 }),
		/já existe/
	);
});

test('atualizarProduto lanca erro quando dados do produto sao invalidos', async () => {
	const { atualizarProduto } = await carregarModulo();

	assert.throws(() => atualizarProduto(0, null), /objeto válido/);
	assert.throws(
		() => atualizarProduto(0, { id: 9, nome: '', preco: 10, estoque: 1 }),
		/nome válido/
	);
	assert.throws(
		() => atualizarProduto(0, { id: 9, nome: 'X', preco: -10, estoque: 1 }),
		/preço válido/
	);
	assert.throws(
		() => atualizarProduto(0, { id: 9, nome: 'X', preco: 10, estoque: -1 }),
		/estoque válido/
	);
});
