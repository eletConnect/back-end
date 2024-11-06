exports.logout = async (req, res) => {
    try {
        req.session.destroy((error) => {
            if (error) {
                return res.status(500).json({ mensagem: 'Houve um problema ao encerrar sua sessão. Por favor, tente novamente mais tarde.' });
            }

            return res.status(200).json({ mensagem: 'Você saiu da sua conta com sucesso. Até breve!' });
        });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro inesperado ao tentar encerrar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};
