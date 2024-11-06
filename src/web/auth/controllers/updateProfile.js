const supabase = require('../../../configs/supabase');

exports.updateProfile = async (req, res) => {
    const { id, nome, email, avatar } = req.body;

    if (!id || !nome || !email) {
        return res.status(400).json({ mensagem: 'Todos os campos obrigatórios (id, nome e email) devem ser preenchidos.' });
    }

    try {
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', id)
            .single();

        if (userError || !user) {
            return res.status(404).json({ mensagem: 'Usuário não encontrado. Verifique suas credenciais e tente novamente.' });
        }

        const { error: updateError } = await supabase
            .from('usuarios')
            .update({ nome, email, avatar })
            .eq('id', id);

        if (updateError) {
            return res.status(500).json({ mensagem: 'Erro ao atualizar o perfil. Tente novamente mais tarde.' });
        }

        return res.status(200).json({ mensagem: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        res.status(500).json({ mensagem: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' });
    }
};
