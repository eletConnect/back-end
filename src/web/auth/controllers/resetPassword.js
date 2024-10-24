const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');
const { verifyToken } = require('../services/tokenService');

exports.resetPassword = async (request, response) => {
    const { senha, token } = request.body;

    const { status, message } = await verifyToken(token);
    if (status !== true) {
        return response.status(401).json({ mensagem: message });
    }

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id, senha')
            .eq('token', token)
            .single();

        if (!user) {
            return response.status(401).json({ mensagem: 'Token inválido ou expirado. Por favor, solicite uma nova redefinição de senha.' });
        }

        if (userERROR) {
            return response.status(500).json({ mensagem: 'Erro ao verificar o token fornecido. Tente novamente mais tarde.' });
        }

        if (senha.length < 6) {
            return response.status(400).json({ mensagem: 'A senha deve ter no mínimo 6 caracteres.' });
        }

        if (await bcrypt.compare(senha, user.senha)) {
            return response.status(400).json({ mensagem: 'A nova senha deve ser diferente da senha atual.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const { error } = await supabase
            .from('usuarios')
            .update({ senha: hashedPassword })
            .eq('id', user.id);

        if (error) {
            return response.status(500).json({ mensagem: 'Houve um erro ao tentar redefinir sua senha. Por favor, tente novamente mais tarde.' });
        }

        return response.status(200).json({ mensagem: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.' });
    } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        response.status(500).json({ mensagem: 'Ocorreu um erro inesperado ao tentar redefinir sua senha. Tente novamente mais tarde.' });
    }
};
