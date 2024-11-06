const express = require('express');
const router = express.Router();

// Importar os controladores
const listarAlunos = require('./controllers/listarAlunos').listarAlunos;
const consultarAluno = require('./controllers/consultarAluno').consultarAluno;
const cadastrarAluno = require('./controllers/cadastrarAluno').cadastrarAluno;
const cadastrarAlunoPlanilha = require('./controllers/cadastrarAlunoPlanilha').cadastrarAlunoPlanilha;
const editarAluno = require('./controllers/editarAluno').editarAluno;
const redefinirSenha = require('./controllers/redefinirSenha').redefinirSenha;
const excluirAluno = require('./controllers/excluirAluno').excluirAluno;
const excluirMultiplos = require('./controllers/excluirMultiplos').excluirMultiplos;
const verificarDados = require('./controllers/verificarDados').verificarDados;

// Definir as rotas
router.post('/listar-alunos', listarAlunos);
router.post('/consultar', consultarAluno);
router.post('/cadastrar', cadastrarAluno);
router.post('/cadastrar-planilha', cadastrarAlunoPlanilha);
router.post('/editar', editarAluno);
router.post('/redefinir-senha', redefinirSenha);
router.post('/excluir', excluirAluno);
router.post('/excluir-multiplos', excluirMultiplos);
router.post('/verificar-dados', verificarDados);

module.exports = router;
