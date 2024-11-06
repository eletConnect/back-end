const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');
const { verifyToken } = require('../services/tokenService');

exports.resetPassword = async (req, res) => {
    const { senha, token } = req.body;

    const { status, message } = await verifyToken(token);
    if (!status) {
        return res.status(401).json({ mensagem: message });
    }

    try {
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('id, senha')
            .eq('token', token)
            .single();

        if (userError || !user) {
            return res.status(401).json({ mensagem: 'Token inválido ou expirado. Por favor, solicite uma nova redefinição de senha.' });
        }

        if (!senha || senha.length < 6) {
            return res.status(400).json({ mensagem: 'A senha deve ter pelo menos 6 caracteres.' });
        }

        if (await bcrypt.compare(senha, user.senha)) {
            return res.status(400).json({ mensagem: 'A nova senha deve ser diferente da senha atual.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const { error: updateError } = await supabase
            .from('usuarios')
            .update({ senha: hashedPassword, token: null })
            .eq('id', user.id);

        if (updateError) {
            return res.status(500).json({ mensagem: 'Houve um erro ao redefinir sua senha. Tente novamente mais tarde.' });
        }

        return res.status(200).json({ mensagem: 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Ocorreu um erro inesperado ao tentar redefinir sua senha. Tente novamente mais tarde.' });
    }
};
