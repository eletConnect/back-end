const supabase = require('../../../configs/supabase');

exports.obterPeriodo = async (request, response) => {
    const { instituicao } = request.body;

    if (!instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data, error } = await supabase
            .from('instituicao')
            .select('data_fim')
            .eq('cnpj', instituicao)
            .single();

        if (error) {
            throw error;
        }

        return response.status(200).json({ dataEncerramento: data.data_fim });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao obter o período de inscrições.', detalhe: error.message });
    }
};
