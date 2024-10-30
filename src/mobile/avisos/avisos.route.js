const express = require('express');
const router = express.Router();

// Importar os controladores
const exibirAvisos = require('./controllers/exibirAvisos').exibirAvisos;

// Definir as rotas
router.post('/exibir-avisos', exibirAvisos);

// Exportar o router para ser usado na aplicação
module.exports = router;
