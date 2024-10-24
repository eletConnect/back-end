const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');

exports.changePassword = async (request, response) => {
    const { id, senhaAtual, novaSenha } = request.body;

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id, senha')
            .eq('id', id)
            .single();

        if (!user || !(await bcrypt.compare(senhaAtual, user.senha))) {
            return response.status(401).json({ mensagem: 'A senha atual informada não corresponde à senha associada à sua conta.' });
        }

        if (await bcrypt.compare(novaSenha, user.senha)) {
            return response.status(401).json({ mensagem: 'A nova senha não pode ser igual à senha anterior.' });
        }

        if (senhaAtual.length < 6 || novaSenha.length < 6) {
            return response.status(401).json({ mensagem: 'A senha fornecida é muito curta. Por favor, insira uma senha com pelo menos 6 caracteres.' });
        }

        const hashedPassword = await bcrypt.hash(novaSenha, 10);
        const { error } = await supabase
            .from('usuarios')
            .update({ senha: hashedPassword })
            .eq('id', id);

        if (error) {
            return response.status(500).json({ mensagem: 'Houve um erro ao atualizar sua senha. Por favor, tente novamente mais tarde.' });
        }

        return response.status(200).json({ mensagem: 'Sua senha foi atualizada com sucesso!' });
    } catch (error) {
        response.status(500).json({ mensagem: 'Ocorreu um erro ao tentar atualizar sua senha. Por favor, tente novamente mais tarde.' });
    }
};
