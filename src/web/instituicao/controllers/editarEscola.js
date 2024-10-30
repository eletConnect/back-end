const supabase = require('../../../configs/supabase');

exports.editarEscola = async (request, response) => {
    const { cnpj, nome, cep, endereco, telefone, logotipo } = request.body;

    if (!cnpj || !nome || !cep || !endereco || !telefone || !logotipo) {
        return response.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const { error } = await supabase
            .from('instituicao')
            .update({ nome, cep, endereco, telefone, logotipo })
            .eq('cnpj', cnpj);

        if (error) {
            return response.status(500).json({ mensagem: 'Erro ao editar a instituição', detalhe: error.message });
        }

        return response.status(200).json({ mensagem: 'Instituição de ensino atualizada com sucesso!' });
    } catch (error) {
        console.error('[Instituição] editar:', error.message);
        return response.status(500).json({ mensagem: 'Erro ao editar instituição de ensino' });
    }
};
