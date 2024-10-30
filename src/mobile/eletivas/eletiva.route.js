const express = require('express');
const router = express.Router();

// Importar os controladores
const listarEletivas = require('./controllers/listarEletivas').listarEletivas;
const minhasEletivas = require('./controllers/minhasEletivas').minhasEletivas;
const qnts = require('./controllers/qnts').qnts;

// Definir as rotas
router.post('/listar', listarEletivas);
router.post('/minhas-eletivas', minhasEletivas);
router.post('/qnts', qnts);

// Exportar o router para ser usado na aplicação
module.exports = router;
