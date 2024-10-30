const express = require('express');

// Importação das rotas dos módulos web
const authRoute = require('./web/auth/auth.route');
const instituicaoRoute = require('./web/instituicao/instituicao.route');
const alunoRoute = require('./web/estudantes/aluno.route');
const eletivaRoute = require('./web/eletivas/eletiva.route');
const colaboradorRoute = require('./web/colaboradores/colaborador.route');
const homeRoute = require('./web/home/home.route');

// Importação das rotas dos módulos mobile
const m_authRoute = require('./mobile/auth/auth.route');
const m_eletivaRoute = require('./mobile/eletivas/eletiva.route');
const m_avisosRoute = require('./mobile/avisos/avisos.route');

// Criação do objeto de rotas
const router = express.Router();

// Configuração das rotas web
router.use('/auth', authRoute); // Rotas de autenticação
router.use('/instituicao', instituicaoRoute); // Rotas relacionadas a instituições
router.use('/estudantes', alunoRoute); // Rotas relacionadas a alunos
router.use('/eletivas', eletivaRoute); // Rotas relacionadas a eletivas
router.use('/colaboradores', colaboradorRoute); // Rotas relacionadas a colaboradores
router.use('/home', homeRoute); // Rotas da página inicial

// Configuração das rotas mobile
router.use('/m/auth', m_authRoute); // Rotas de autenticação
router.use('/m/eletivas', m_eletivaRoute); // Rotas relacionadas a eletivas
router.use('/m/avisos', m_avisosRoute); // Rotas relacionadas a avisos

module.exports = router;
