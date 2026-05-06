import { Router } from 'express';

function tratarErro(res, err) {
    const msg = err?.message ?? 'Erro interno';
    if (/não encontrado/i.test(msg)) return res.status(404).json({ erro: msg });
    return res.status(400).json({ erro: msg });
}

/**
 * Cria um router CRUD de produtos a partir de um data source
 * que exponha: listar, obterPorId, criar, atualizar, remover,
 * valorEstoqueGeral e aplicarDesconto.
 */
export function criarRotasProdutos(dataSource) {
    const router = Router();

    router.get('/', async (req, res) => {
        try {
            const { ordenado, precoMin, precoMax } = req.query;
            res.json(await dataSource.listar({
                ordenadoPorNome: ordenado === 'true',
                precoMin: precoMin !== undefined ? Number(precoMin) : undefined,
                precoMax: precoMax !== undefined ? Number(precoMax) : undefined,
            }));
        } catch (err) { tratarErro(res, err); }
    });

    router.get('/desconto', (_req, res) => res.status(405).json({ erro: 'Use POST.' }));

    router.post('/desconto', async (req, res) => {
        try {
            res.json(await dataSource.aplicarDesconto(req.body?.percentual));
        } catch (err) { tratarErro(res, err); }
    });

    router.get('/:id', async (req, res) => {
        try {
            res.json(await dataSource.obterPorId(Number(req.params.id)));
        } catch (err) { tratarErro(res, err); }
    });

    router.post('/', async (req, res) => {
        try {
            res.status(201).json(await dataSource.criar(req.body));
        } catch (err) { tratarErro(res, err); }
    });

    router.put('/:id', async (req, res) => {
        try {
            res.json(await dataSource.atualizar(Number(req.params.id), req.body));
        } catch (err) { tratarErro(res, err); }
    });

    router.delete('/:id', async (req, res) => {
        try {
            await dataSource.remover(Number(req.params.id));
            res.status(204).send();
        } catch (err) { tratarErro(res, err); }
    });

    return router;
}
