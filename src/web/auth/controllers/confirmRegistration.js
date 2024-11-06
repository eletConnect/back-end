const supabase = require('../../../configs/supabase');
const { verifyToken } = require('../services/tokenService');

exports.confirmRegistration = async (req, res) => {
    const { token } = req.body;

    const { status } = await verifyToken(token);
    if (!status) {
        return res.status(401).json({ mensagem: 'O token de verificação é inválido ou expirou.' });
    }

    try {
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('confirmed_at, id, status')
            .eq('token', token)
            .single();

        if (userError || !user) {
            return res.status(401).json({ mensagem: 'Token inválido ou expirado. Não foi possível concluir a verificação de e-mail.' });
        }

        // Verifica se a conta já foi confirmada
        if (user.confirmed_at) {
            return res.status(400).json({ mensagem: 'Sua conta já foi verificada anteriormente.' });
        }

        // Atualiza a confirmação do usuário e o status para "Ativo"
        const { error: updateError } = await supabase
            .from('usuarios')
            .update({
                confirmed_at: new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
                status: 'Ativo'
            })
            .eq('id', user.id);

        if (updateError) {
            return res.status(500).json({ mensagem: 'Erro ao ativar a conta. Por favor, tente novamente mais tarde.' });
        }

        return res.status(200).json({ mensagem: 'E-mail verificado com sucesso! Sua conta foi ativada e está pronta para uso.' });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro inesperado ao validar sua conta. Por favor, tente novamente mais tarde.' });
    }
};
