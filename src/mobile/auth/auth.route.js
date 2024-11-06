const express = require('express');
const router = express.Router();

// Importar os controladores
const login = require('./controllers/login').login;
const changePassword = require('./controllers/changePassword').changePassword;
const logout = require('./controllers/logout').logout;
const checkSession = require('./controllers/checkSession').checkSession;

// Definir as rotas
router.post('/login', login);
router.post('/change-password', changePassword);
router.post('/logout', logout);
router.get('/check-session', checkSession);

module.exports = router;
