const { v4: uuidv4 } = require('uuid');

function createToken() {
    const agoraNoBrasil = new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    const agoraISOBrasil = new Date(agoraNoBrasil).toISOString();
    return `${uuidv4()}tt:${agoraISOBrasil}`;
}

async function verifyToken(token) {
    if (!token) {
        return { status: false, message: 'Nenhum token foi fornecido.' };
    }

    const partesToken = token.split('tt:');
    if (partesToken.length !== 2) {
        return { status: false, message: 'O token fornecido é inválido.' };
    }

    const expiracaoTokenISO = partesToken[1];
    const expiracaoToken = new Date(expiracaoTokenISO);

    const timeZone = 'America/Sao_Paulo';
    const agoraNoBrasil = new Date().toLocaleString('en-US', { timeZone });
    const agoraNoBrasilDate = new Date(agoraNoBrasil);

    expiracaoToken.setTime(expiracaoToken.getTime() + expiracaoToken.getTimezoneOffset() * 60000);

    const umHoraEmMillis = 60 * 60 * 1000;
    if (agoraNoBrasilDate > expiracaoToken.getTime() + umHoraEmMillis) {
        return { status: false, message: 'O token fornecido expirou ou não é mais válido.' };
    }

    return { status: true };
}

module.exports = { createToken, verifyToken };
