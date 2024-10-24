const supabase = require('../../../configs/supabase');

exports.definirPeriodo = async (request, response) => {
    const { instituicao, dataInicio, dataFim } = request.body;

    if (!instituicao || !dataFim) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const dataInicioTexto = new Date(dataInicio).toISOString();
        const dataFimTexto = new Date(dataFim).toISOString(); 

        const { data, error } = await supabase
            .from('instituicao')
            .update({
                data_inicio: dataInicioTexto,
                data_fim: dataFimTexto
            })
            .eq('cnpj', instituicao);

        if (error) {
            throw error;
        }

        return response.status(200).json({ mensagem: 'Período de inscrições definido com sucesso!' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao definir o período de inscrições.', detalhe: error.message });
    }
};
