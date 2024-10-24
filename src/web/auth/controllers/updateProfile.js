const supabase = require('../../../configs/supabase');

exports.updateProfile = async (request, response) => {
    const { id, nome, email, avatar } = request.body;

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', id)
            .single();

        if (!user) {
            return response.status(404).json({ mensagem: 'O usuário solicitado não foi encontrado. Verifique suas credenciais e tente novamente.' });
        }

        if (userERROR) {
            return response.status(500).json({ mensagem: 'Houve um problema ao validar o usuário fornecido. Tente novamente mais tarde.' });
        }

        const { error } = await supabase
            .from('usuarios')
            .update({ nome, email, avatar })
            .eq('id', id);

        if (error) {
            return response.status(500).json({ mensagem: 'Houve um erro ao tentar atualizar seu perfil. Por favor, tente novamente mais tarde.' });
        }

        return response.status(200).json({ mensagem: 'Seu perfil foi atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        response.status(500).json({ mensagem: 'Ocorreu um erro inesperado ao tentar atualizar seu perfil. Por favor, tente novamente mais tarde.' });
    }
};
