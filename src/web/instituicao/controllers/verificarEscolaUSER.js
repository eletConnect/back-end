const supabase = require('../../../configs/supabase');

exports.verificarEscolaUSER = async (request, response) => {
    const { id } = request.body;

    try {
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('instituicao')
            .eq('id', id)
            .single();

        if (userError) {
            return response.status(500).json({ mensagem: 'Erro ao verificar o usuário', detalhe: userError.message });
        }

        if (!userData) {
            return response.status(404).json({ mensagem: 'Usuário não encontrado' });
        }

        if (!userData.instituicao) {
            return response.status(200).json({ userData });
        }

        const { data: instituicaoData, error: instituicaoError } = await supabase
            .from('instituicao')
            .select('cnpj, nome, cep, endereco, telefone, logotipo')
            .eq('cnpj', userData.instituicao)
            .single();

        if (instituicaoError) {
            return response.status(500).json({ mensagem: 'Erro ao verificar a instituição', detalhe: instituicaoError.message });
        }

        if (!instituicaoData) {
            return response.status(404).json({ mensagem: 'Instituição não encontrada' });
        }

        return response.status(200).json(instituicaoData);
    } catch (error) {
        console.error('[Instituição]:', error);
        return response.status(500).json({ mensagem: 'Erro ao verificar instituição' });
    }
};
