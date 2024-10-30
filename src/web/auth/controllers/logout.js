exports.logout = async (request, response) => {
    try {
        request.session.destroy((error) => {
            if (error) {
                return response.status(500).json({
                    mensagem: 'Houve um problema ao encerrar sua sessão. Por favor, tente novamente mais tarde.'
                });
            }

            return response.status(200).json({
                mensagem: 'Você saiu da sua conta com sucesso. Até breve!'
            });
        });
    } catch (error) {
        console.error('Erro ao finalizar a sessão:', error);
        return response.status(500).json({
            mensagem: 'Ocorreu um erro inesperado ao tentar encerrar sua sessão. Por favor, tente novamente mais tarde.'
        });
    }
};
