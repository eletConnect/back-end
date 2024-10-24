exports.checkSession = async (request, response) => {
    try {
        if (request.session && request.session.user) {
            const { id, matricula, nome, email, foto, cargo, status, instituicao } = request.session.user;

            return response.status(200).json({
                id,
                matricula,
                nome,
                email,
                foto,
                cargo,
                status,
                instituicao
            });
        } else {
            return response.status(401).json({ mensagem: 'Nenhuma sessão ativa encontrada. Por favor, faça login novamente.' });
        }
    } catch (error) {
        return response.status(500).json({ mensagem: 'Ocorreu um erro ao verificar a sua sessão. Por favor, tente novamente mais tarde.' });
    }
};
