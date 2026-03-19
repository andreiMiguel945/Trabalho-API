const express = require('express');
const app = express();

app.use(express.json());
// Dados em memória
let produtos = [
    { id: 1, 
        nome: "Anne Frank", 
        preco: 50, 
        categoria: "História", 
        estoque: 30 

    },
    { id: 2, 
        nome: "Entendendo Algoritmos", 
        preco: 39, 
        categoria: "Informática", 
        estoque: 50 },
];

// GET /api/produtos - Listar com filtros, ordenação e paginação
app.get('/api/produtos', (req, res) => {
    const { categoria, preco_max, preco_min, ordem, direcao, pagina = 1, limite = 10 } = req.query;
    
    let resultado = produtos;
    
    // Filtros
    if (categoria) resultado = resultado.filter(p => p.categoria === categoria);
    if (preco_max) resultado = resultado.filter(p => p.preco <= parseFloat(preco_max));
    if (preco_min) resultado = resultado.filter(p => p.preco >= parseFloat(preco_min));
    
    // Ordenação
    if (ordem) {
        resultado = resultado.sort((a, b) => {
            if (ordem === 'preco') {
                return direcao === 'desc' ? b.preco - a.preco : a.preco - b.preco;
            }
            if (ordem === 'nome') {
                return direcao === 'desc' ? b.nome.localeCompare(a.nome) : a.nome.localeCompare(b.nome);
            }
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

// GET /api/produtos/:id - Buscar por ID
app.get('/api/produtos/:id', (req, res) => {
    const produto = produtos.find(p => p.id === parseInt(req.params.id));
    if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });
    res.json(produto);
});


// ESSENCIAL: Middleware JSON
let proximoId = 3; // Controla próximo ID

// POST /api/produtos - Criar novo produto
app.post('/api/produtos', (req, res) => {
    // 1. Pegar dados do body
    const { nome, preco, categoria } = req.body;
    
    // 2. Criar objeto do novo produto
    const novoProduto = {
        id: proximoId++,    // Gera ID e incrementa
        nome,
        preco,
        categoria
    };
    
    // 3. Adicionar ao array
    produtos.push(novoProduto);
    
    // 4. Retornar produto criado com status 201
    res.status(201).json(novoProduto);
});

app.listen(3000, () => console.log('🚀 API rodando na porta 3000'));