const express = require('express');
const router = express.Router();

// Importar os controladores
const verificarEscolaUSER = require('./controllers/verificarEscolaUSER').verificarEscolaUSER;
const verificarEscolaALUNO = require('./controllers/verificarEscolaALUNO').verificarEscolaALUNO;
const entrarEscolaCODE = require('./controllers/entrarEscolaCODE').entrarEscolaCODE;
const cadastrarEscola = require('./controllers/cadastrarEscola').cadastrarEscola;
const editarEscola = require('./controllers/editarEscola');

// Definir as rotas
router.post('/verificar', verificarEscolaUSER);
router.post('/verificar-mobile', verificarEscolaALUNO);
router.post('/entrar', entrarEscolaCODE);
router.post('/cadastrar', cadastrarEscola);
router.post('/editar', editarEscola.editarEscola);
 
module.exports = router;
