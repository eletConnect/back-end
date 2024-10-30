const supabase = require('../../../configs/supabase');
const { verifyToken } = require('../services/tokenService');

exports.confirmRegistration = async (request, response) => {
    const { token } = request.body;

    const { status, message } = await verifyToken(token);
    if (status !== true) {
        return response.status(401).json({ mensagem: 'O token de verificação é inválido ou expirou.' });
    }

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('confirmed_at, id, status')
            .eq('token', token)
            .single();

        if (!user) {
            return response.status(401).json({ mensagem: 'Token inválido ou expirado. Verificação de e-mail não pode ser concluída.' });
        }

        if (user.confirmed_at) {
            return response.status(400).json({ mensagem: 'Sua conta já foi verificada anteriormente.' });
        }

        if (userERROR) {
            return response.status(500).json({ mensagem: 'Erro ao verificar o token. Tente novamente mais tarde.' });
        }

        const { error } = await supabase
            .from('usuarios')
            .update({
                confirmed_at: new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }),
                status: 'Ativo'
            })
            .eq('id', user.id);

        if (error) {
            return response.status(500).json({ mensagem: 'Erro ao atualizar a confirmação de e-mail e ativação da conta. Tente novamente mais tarde.' });
        }

        return response.status(200).json({ mensagem: 'E-mail verificado com sucesso! Sua conta foi ativada e está pronta para uso.' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Ocorreu um erro ao tentar validar sua conta. Tente novamente mais tarde.' });
    }
};
