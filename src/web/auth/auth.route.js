const express = require('express');
const router = express.Router();

// Importar os controladores
const login = require('./controllers/login').login;
const register = require('./controllers/register').register;
const confirmRegistration = require('./controllers/confirmRegistration').confirmRegistration;
const forgotPassword = require('./controllers/forgotPassword').forgotPassword;
const resetPassword = require('./controllers/resetPassword').resetPassword;
const changePassword = require('./controllers/changePassword').changePassword;
const logout = require('./controllers/logout').logout;
const updateProfile = require('./controllers/updateProfile').updateProfile;
const checkSession = require('./controllers/checkSession').checkSession;

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
