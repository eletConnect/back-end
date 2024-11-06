exports.checkSession = async (req, res) => {
    try {
        if (req.session?.user) {
            const { id, matricula, nome, email, foto, cargo, status, instituicao } = req.session.user;

            return res.status(200).json({
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
            return res.status(401).json({ mensagem: 'Nenhuma sessão ativa encontrada. Por favor, faça login novamente.' });
        }
    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro inesperado ao verificar sua sessão. Por favor, tente novamente mais tarde.' });
    }
};
