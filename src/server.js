import express from 'express';
import { fileURLToPath } from 'node:url';
import { ProdutoRepository } from './ProdutoRepository.js';
import { JsonDataSource } from './JsonDataSource.js';
import { criarRotasProdutos } from './rotasProdutos.js';

const app = express();
app.use(express.json());

// --- Data source 1: SQLite (persistente) ---
const dbPath = fileURLToPath(new URL('../produtos.db', import.meta.url));
const fixturesPath = fileURLToPath(new URL('../test/fixtures/produtos.json', import.meta.url));
const repo = new ProdutoRepository(dbPath);
await repo.semearSeVazio(fixturesPath);

// --- Data source 2: JSON (lê e grava em data/produtos.json) ---
const jsonPath = fileURLToPath(new URL('../data/produtos.json', import.meta.url));
const jsonDs = new JsonDataSource(jsonPath);
await jsonDs.carregar(fixturesPath);

// Monta dois conjuntos de rotas com o mesmo CRUD, em prefixos diferentes
app.use('/produtos', criarRotasProdutos(repo));        // -> SQLite
app.use('/produtos-json', criarRotasProdutos(jsonDs)); // -> JSON

// Endpoints de estoque (um por fonte)
app.get('/estoque/total', (_req, res) => {
    res.json({ total: repo.valorEstoqueGeral() });
});
app.get('/estoque-json/total', (_req, res) => {
    res.json({ total: jsonDs.valorEstoqueGeral() });
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
    console.log(' - SQLite: /produtos, /estoque/total');
    console.log(' - JSON:   /produtos-json, /estoque-json/total');
});
