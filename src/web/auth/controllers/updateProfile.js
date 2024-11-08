const supabase = require('../../../configs/supabase');

exports.updateProfile = async (req, res) => {
    const { id, nome, email, avatar } = req.body;
    console.log('Dados recebidos para atualização:', { id, nome, email, avatar });

    if (!id || !nome || !email) {
        return res.status(400).json({ mensagem: 'Todos os campos obrigatórios (id, nome e email) devem ser preenchidos.' });
    }

    try {
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', id)
            .single();

        if (userError) {
            console.error('Erro ao buscar usuário:', userError);
            return res.status(404).json({ mensagem: 'Usuário não encontrado. Verifique suas credenciais e tente novamente.' });
        }

        if (!user) {
            console.warn('Usuário não encontrado.');
            return res.status(404).json({ mensagem: 'Usuário não encontrado. Verifique suas credenciais e tente novamente.' });
        }

        console.log('URL da foto antes da atualização:', avatar);

        const { error: updateError } = await supabase
            .from('usuarios')
            .update({ nome, email, ...(avatar && { foto: avatar }) }) // Corrigido para atualizar a coluna 'foto'
            .eq('id', id);

        if (updateError) {
            console.error('Erro ao atualizar o perfil:', updateError);
            return res.status(500).json({ mensagem: 'Erro ao atualizar o perfil. Tente novamente mais tarde.' });
        }

        console.log('Perfil atualizado com sucesso.');
        return res.status(200).json({ mensagem: 'Perfil atualizado com sucesso!' });
    } catch (error) {
        console.error('Erro inesperado no servidor:', error);
        return res.status(500).json({ mensagem: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' });
    }
};
