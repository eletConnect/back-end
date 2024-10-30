exports.checkSession = async (request, response) => {
    try {
        if (request.session && request.session.user) {
            return response.status(200).json(request.session.user);
        } else {
            return response.status(401).json({ mensagem: 'Nenhuma sessão ativa foi encontrada. Por favor, faça login para continuar.' });
        }
    } catch (error) {
        return response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar verificar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};
