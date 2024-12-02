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

const router = express.Router();

// Configuração das rotas web
router.use('/auth', authRoute); 
router.use('/instituicao', instituicaoRoute); 
router.use('/estudantes', alunoRoute); 
router.use('/eletivas', eletivaRoute); 
router.use('/colaboradores', colaboradorRoute); 
router.use('/home', homeRoute); 

// Configuração das rotas mobile
router.use('/m/auth', m_authRoute); 
router.use('/m/eletivas', m_eletivaRoute); 
router.use('/m/avisos', m_avisosRoute);

module.exports = router;
