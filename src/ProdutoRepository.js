import Database from 'better-sqlite3';
import { readFile } from 'node:fs/promises';
import { Produto } from './GestaoProdutos.js';

export class ProdutoRepository {
    constructor(caminhoDb = 'produtos.db') {
        this.db = new Database(caminhoDb);
        this.db.pragma('journal_mode = WAL');
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS produtos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                preco REAL NOT NULL,
                estoque INTEGER NOT NULL
            )
        `);
    }

    async semearSeVazio(caminhoFixtures) {
        const total = this.db.prepare('SELECT COUNT(*) AS c FROM produtos').get().c;
        if (total > 0) return;
        const dados = JSON.parse(await readFile(caminhoFixtures, 'utf-8'));
        const insert = this.db.prepare(
            'INSERT INTO produtos (id, nome, preco, estoque) VALUES (?, ?, ?, ?)'
        );
        const tx = this.db.transaction((produtos) => {
            for (const p of produtos) insert.run(p.id, p.nome, p.preco, p.estoque);
        });
        tx(dados);
    }

    listar({ ordenadoPorNome = false, precoMin, precoMax } = {}) {
        let sql = 'SELECT * FROM produtos';
        const params = [];
        if (precoMin !== undefined && precoMax !== undefined) {
            sql += ' WHERE preco BETWEEN ? AND ?';
            params.push(precoMin, precoMax);
        }
        if (ordenadoPorNome) sql += ' ORDER BY nome COLLATE NOCASE';
        return this.db.prepare(sql).all(...params);
    }

    obterPorId(id) {
        const produto = this.db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
        if (!produto) throw new Error(`Produto com ID ${id} não encontrado.`);
        return produto;
    }

    criar({ nome, preco, estoque }) {
        Produto.validar({ nome, preco, estoque });
        const info = this.db
            .prepare('INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)')
            .run(nome, preco, estoque);
        return this.obterPorId(info.lastInsertRowid);
    }

    atualizar(id, { nome, preco, estoque }) {
        Produto.validar({ nome, preco, estoque });
        const info = this.db
            .prepare('UPDATE produtos SET nome = ?, preco = ?, estoque = ? WHERE id = ?')
            .run(nome, preco, estoque, id);
        if (info.changes === 0) throw new Error(`Produto com ID ${id} não encontrado.`);
        return this.obterPorId(id);
    }

    remover(id) {
        const info = this.db.prepare('DELETE FROM produtos WHERE id = ?').run(id);
        if (info.changes === 0) throw new Error(`Produto com ID ${id} não encontrado.`);
    }

    valorEstoqueGeral() {
        const row = this.db
            .prepare('SELECT COALESCE(SUM(preco * estoque), 0) AS total FROM produtos')
            .get();
        return row.total;
    }

    aplicarDesconto(percentual) {
        if (typeof percentual !== 'number' || percentual < 0 || percentual > 100) {
            throw new Error('Percentual deve ser um número entre 0 e 100.');
        }
        const fator = 1 - percentual / 100;
        this.db.prepare('UPDATE produtos SET preco = preco * ?').run(fator);
        return this.listar();
    }
}
