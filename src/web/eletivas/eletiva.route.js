const express = require('express');
const router = express.Router();

// Importar os controladores
const listarEletivas = require('./controllers/listarEletivas').listarEletivas;
const cadastrarEletiva = require('./controllers/cadastrarEletiva').cadastrarEletiva;
const editarEletiva = require('./controllers/editarEletiva').editarEletiva;
const excluirEletiva = require('./controllers/excluirEletiva').excluirEletiva;
const excluirMultiplas = require('./controllers/excluirMultiplas').excluirMultiplas;
const buscarEletiva = require('./controllers/buscarEletiva').buscarEletiva;
const listarAlunosEletiva = require('./controllers/listarAlunosEletiva').listarAlunosEletiva;
const matricularAluno = require('./controllers/matricularAluno').matricularAluno;
const matricularMultiplosAlunos = require('./controllers/matricularMultiplos').matricularMultiplosAlunos;
const desmatricularAluno = require('./controllers/desmatricularAluno').desmatricularAluno;
const listarEletivasAluno = require('./controllers/listarEletivasAluno').listarEletivasAluno;
const definirPeriodo = require('./controllers/definirPeriodo').definirPeriodo;
const obterPeriodo = require('./controllers/obterPeriodo').obterPeriodo;
const listarEletivasTodosAlunos = require('./controllers/listarEletivasTodosAlunos').listarEletivasTodosAlunos;
const listarAlunosNaoMatriculados = require('./controllers/listarAlunosNaoMatriculados').listarAlunosNaoMatriculados

// Definir as rotas
router.post('/listar', listarEletivas);
router.post('/cadastrar', cadastrarEletiva);
router.post('/editar', editarEletiva);
router.post('/excluir', excluirEletiva);
router.post('/excluir-multiplas', excluirMultiplas);
router.post('/buscar', buscarEletiva);
router.post('/listar-alunos-eletiva', listarAlunosEletiva);
router.post('/matricular-aluno', matricularAluno);
router.post('/matricular-multiplos', matricularMultiplosAlunos);
router.post('/desmatricular-aluno', desmatricularAluno);
router.post('/listar-eletivas-aluno', listarEletivasAluno);
router.post('/definir-periodo', definirPeriodo);
router.post('/obter-periodo', obterPeriodo);
router.post('/listar-todos-alunos', listarEletivasTodosAlunos);
router.post('/listar-alunos-nao-matriculados', listarAlunosNaoMatriculados);

module.exports = router;
