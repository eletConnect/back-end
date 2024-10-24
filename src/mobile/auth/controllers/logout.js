exports.logout = async (request, response) => {
    try {
        request.session.destroy((error) => {
            if (error) {
                return response.status(500).json({ mensagem: 'Ocorreu um erro ao finalizar sua sessão. Por favor, tente novamente mais tarde.' });
            }

            return response.status(200).json({ mensagem: 'Logout efetuado com sucesso!' });
        });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Ocorreu um problema ao tentar finalizar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};
