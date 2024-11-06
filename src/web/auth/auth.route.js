const express = require('express');
const router = express.Router();

// Importar os controladores
const { login } = require('./controllers/login');
const { register } = require('./controllers/register');
const { confirmRegistration } = require('./controllers/confirmRegistration');
const { forgotPassword } = require('./controllers/forgotPassword');
const { resetPassword } = require('./controllers/resetPassword');
const { changePassword } = require('./controllers/changePassword');
const { logout } = require('./controllers/logout');
const { updateProfile } = require('./controllers/updateProfile');
const { checkSession } = require('./controllers/checkSession');

// Definir as rotas
router.post('/login', login);
router.post('/register', register);
router.post('/confirm-registration', confirmRegistration);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);
router.post('/logout', logout);
router.post('/update-profile', updateProfile);
router.get('/check-session', checkSession);

module.exports = router;
