const express = require('express');
const router = express.Router();

// Importar os controladores
const quantidades = require('./controllers/quantidades').quantidades;
const exibirAvisos = require('./controllers/exibirAvisos').exibirAvisos
const criarAviso = require('./controllers/criarAviso').criarAviso;
const editarAviso = require('./controllers/editarAviso').editarAviso;
const excluirAviso = require('./controllers/excluirAviso').excluirAviso;

// Definir as rotas
router.post('/qnt', quantidades);
router.post('/exibir-avisos', exibirAvisos);
router.post('/criar-aviso', criarAviso);    
router.post('/editar-aviso', editarAviso);
router.post('/excluir-aviso', excluirAviso);
 
module.exports = router;
