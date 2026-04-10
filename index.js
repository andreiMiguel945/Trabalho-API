const express = require('express');
const app = express();

app.use(express.json());

// =====================
// DADOS EM MEMÓRIA
// =====================
let produtos = [
    { id: 1, nome: "Anne Frank", preco: 50, categoria: "História", estoque: 30 },
    { id: 2, nome: "Entendendo Algoritmos", preco: 39, categoria: "Informática", estoque: 50 }
];

let proximoId = 3;

// =====================
// GET - LISTAR PRODUTOS (com filtros e paginação)
// =====================
app.get('/api/produtos', (req, res) => {
    const { categoria, preco_max, preco_min, ordem, direcao, pagina = 1, limite = 10 } = req.query;

    let resultado = [...produtos];

    // Filtros
    if (categoria) resultado = resultado.filter(p => p.categoria === categoria);
    if (preco_max) resultado = resultado.filter(p => p.preco <= parseFloat(preco_max));
    if (preco_min) resultado = resultado.filter(p => p.preco >= parseFloat(preco_min));

    // Ordenação
    if (ordem) {
        resultado.sort((a, b) => {
            if (ordem === 'preco') {
                return direcao === 'desc' ? b.preco - a.preco : a.preco - b.preco;
            }
            if (ordem === 'nome') {
                return direcao === 'desc'
                    ? b.nome.localeCompare(a.nome)
                    : a.nome.localeCompare(b.nome);
            }
            return 0;
        });
    }

    // Paginação
    const paginaNum = parseInt(pagina);
    const limiteNum = parseInt(limite);
    const inicio = (paginaNum - 1) * limiteNum;

    const paginado = resultado.slice(inicio, inicio + limiteNum);

    res.json({
        dados: paginado,
        paginacao: {
            pagina_atual: paginaNum,
            itens_por_pagina: limiteNum,
            total_itens: resultado.length,
            total_paginas: Math.ceil(resultado.length / limiteNum)
        }
    });
});

// =====================
// GET - BUSCAR POR ID
// =====================
app.get('/api/produtos/:id', (req, res) => {
    const produto = produtos.find(p => p.id === parseInt(req.params.id));

    if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json(produto);
});

// =====================
// POST - CRIAR PRODUTO
// =====================
app.post('/api/produtos', (req, res) => {
    const { nome, preco, categoria, estoque } = req.body;

    // Validação
    if (!nome || !preco || !categoria) {
        return res.status(400).json({
            erro: "Campos obrigatórios: nome, preco, categoria"
        });
    }

    const novoProduto = {
        id: proximoId++,
        nome,
        preco,
        categoria,
        estoque: estoque || 0
    };

    produtos.push(novoProduto);

    res.status(201).json(novoProduto);
});

// =====================
// PUT - ATUALIZAR PRODUTO
// =====================
app.put('/api/produtos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const produto = produtos.find(p => p.id === id);

    if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
    }

    const { nome, preco, categoria, estoque } = req.body;

    // Validação
    if (!nome || !preco || !categoria) {
        return res.status(400).json({
            erro: "Campos obrigatórios: nome, preco, categoria"
        });
    }

    if (typeof preco !== 'number' || preco <= 0) {
        return res.status(400).json({
            erro: "Preço deve ser um número positivo"
        });
    }

    // Atualização
    produto.nome = nome;
    produto.preco = preco;
    produto.categoria = categoria;
    produto.estoque = estoque ?? produto.estoque;

    res.json(produto);
});

// =====================
// DELETE - REMOVER PRODUTO
// =====================
app.delete('/api/produtos/:id', (req, res) => {
    const index = produtos.findIndex(p => p.id === parseInt(req.params.id));

    if (index === -1) {
        return res.status(404).json({ erro: "Produto não encontrado" });
    }

    produtos.splice(index, 1);

    res.status(204).send();
});

// =====================
// SERVIDOR
// =====================
app.listen(3000, () => {
    console.log('🚀 API rodando em http://localhost:3000');
});