const express = require('express');
const router = express.Router();
const escolaController = require("./instituicao.controller");

router.post('/verificar', escolaController.verificarEscolaUSER);
router.post('/entrar', escolaController.entrarEscolaCODE);

router.post('/cadastrar', escolaController.cadastrarEscola);
router.put('/alterar', escolaController.editarEscola);
 
module.exports = router;
