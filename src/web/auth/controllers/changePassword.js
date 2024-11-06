const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');

exports.changePassword = async (req, res) => {
    const { id, senhaAtual, novaSenha } = req.body;

    if (!id || !senhaAtual || !novaSenha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios. Por favor, preencha todos os dados.' });
    }

    if (novaSenha.length < 6) {
        return res.status(400).json({ mensagem: 'A nova senha deve ter pelo menos 6 caracteres.' });
    }

    try {
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('id, senha')
            .eq('id', id)
            .single();

        if (userError || !user) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado. Verifique suas informações e tente novamente.' });
        }

        const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
        if (!senhaValida) {
            return res.status(401).json({ mensagem: 'A senha atual informada está incorreta.' });
        }

        if (await bcrypt.compare(novaSenha, user.senha)) {
            return res.status(400).json({ mensagem: 'A nova senha não pode ser igual à senha anterior.' });
        }

        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        const { error: updateError } = await supabase
            .from('usuarios')
            .update({ senha: hashedPassword })
            .eq('id', id);

        if (updateError) {
            return res.status(500).json({ mensagem: 'Erro ao atualizar sua senha. Tente novamente mais tarde.' });
        }

        return res.status(200).json({ mensagem: 'Sua senha foi atualizada com sucesso!' });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro inesperado. Tente novamente mais tarde.' });
    }
};
