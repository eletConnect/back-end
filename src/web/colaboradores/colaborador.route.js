const express = require('express');
const router = express.Router();

// Importar os controladores
const listarColaboradores = require('./controllers/listarColaboradores').listarColaboradores;
const cadastrarColaborador = require('./controllers/cadastrarColaborador').cadastrarColaborador;
const editarColaborador = require('./controllers/editarColaborador').editarColaborador;
const consultarColaborador = require('./controllers/consultarColaborador').consultarColaborador;
const excluirColaborador = require('./controllers/excluirColaborador').excluirColaborador;
const excluirMultiplos = require('./controllers/excluirMultiplos').excluirMultiplos;

// Definir as rotas
router.post('/listar', listarColaboradores);
router.post('/cadastrar', cadastrarColaborador);
router.post('/editar', editarColaborador);
router.post('/consultar', consultarColaborador);
router.post('/excluir', excluirColaborador);
router.post('/excluir-multiplos', excluirMultiplos);

module.exports = router;
