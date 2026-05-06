import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ProdutoRepository } from '../src/ProdutoRepository.js';

const produtosFixture = JSON.parse(
    readFileSync(new URL('./fixtures/produtos.json', import.meta.url), 'utf8')
);

describe('ProdutoRepository (SQLite em memória)', () => {
    let repo;

    beforeEach(() => {
        // ":memory:" cria um banco efêmero, descartado ao fim do teste
        repo = new ProdutoRepository(':memory:');
        for (const p of produtosFixture) {
            repo.criar({ nome: p.nome, preco: p.preco, estoque: p.estoque });
        }
    });

    it('listar: retorna todos os produtos semeados', () => {
        const todos = repo.listar();
        assert.equal(todos.length, produtosFixture.length);
        assert.equal(todos[0].nome, produtosFixture[0].nome);
    });

    it('listar: ordena por nome quando ordenadoPorNome=true', () => {
        const ordenados = repo.listar({ ordenadoPorNome: true });
        const nomes = ordenados.map((p) => p.nome);
        assert.deepEqual(nomes, [...nomes].sort((a, b) => a.localeCompare(b)));
    });

    it('listar: filtra por faixa de preço', () => {
        const filtrados = repo.listar({ precoMin: 50, precoMax: 100 });
        for (const p of filtrados) {
            assert.ok(p.preco >= 50 && p.preco <= 100);
        }
    });

    it('obterPorId: retorna o produto correto', () => {
        const produto = repo.obterPorId(1);
        assert.equal(produto.id, 1);
        assert.equal(produto.nome, produtosFixture[0].nome);
    });

    it('obterPorId: lança erro para id inexistente', () => {
        assert.throws(() => repo.obterPorId(9999), /não encontrado/i);
    });

    it('criar: gera id auto-incremento e persiste', () => {
        const novo = repo.criar({ nome: 'Boné', preco: 39.9, estoque: 20 });
        assert.ok(Number.isInteger(novo.id));
        assert.ok(novo.id > produtosFixture.length);
        const buscado = repo.obterPorId(novo.id);
        assert.equal(buscado.nome, 'Boné');
    });

    it('criar: lança erro com dados inválidos', () => {
        assert.throws(() => repo.criar({ nome: '', preco: -1, estoque: 0 }), /Produto/);
    });

    it('atualizar: modifica o produto e retorna a versão nova', () => {
        const atualizado = repo.atualizar(1, { nome: 'Camiseta P', preco: 25, estoque: 80 });
        assert.equal(atualizado.id, 1);
        assert.equal(atualizado.nome, 'Camiseta P');
        assert.equal(repo.obterPorId(1).preco, 25);
    });

    it('atualizar: lança erro para id inexistente', () => {
        assert.throws(
            () => repo.atualizar(9999, { nome: 'X', preco: 1, estoque: 1 }),
            /não encontrado/i
        );
    });

    it('remover: apaga o produto', () => {
        repo.remover(1);
        assert.throws(() => repo.obterPorId(1), /não encontrado/i);
    });

    it('remover: lança erro para id inexistente', () => {
        assert.throws(() => repo.remover(9999), /não encontrado/i);
    });

    it('valorEstoqueGeral: soma preco * estoque de todos', () => {
        const esperado = produtosFixture.reduce((s, p) => s + p.preco * p.estoque, 0);
        assert.equal(repo.valorEstoqueGeral(), esperado);
    });

    it('aplicarDesconto: reduz o preço de todos pelo percentual', () => {
        const antes = repo.listar().map((p) => p.preco);
        repo.aplicarDesconto(10);
        const depois = repo.listar().map((p) => p.preco);
        antes.forEach((preco, i) => {
            assert.ok(Math.abs(depois[i] - preco * 0.9) < 1e-9);
        });
    });

    it('aplicarDesconto: lança erro para percentual inválido', () => {
        assert.throws(() => repo.aplicarDesconto(150), /Percentual/);
        assert.throws(() => repo.aplicarDesconto(-5), /Percentual/);
    });
});
