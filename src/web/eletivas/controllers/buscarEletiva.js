const supabase = require('../../../configs/supabase');

exports.buscarEletiva = async (request, response) => {
    const { codigo, instituicao } = request.body;

    if (!codigo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .select('*')
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao buscar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json(eletivaData);
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao buscar a eletiva', detalhe: error.message });
    }
};