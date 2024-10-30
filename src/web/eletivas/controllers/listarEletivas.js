const supabase = require('../../../configs/supabase');

exports.listarEletivas = async (request, response) => {
    const { instituicao } = request.body;

    if (!instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivasData, error: eletivasError } = await supabase
            .from('eletivas')
            .select('*')
            .eq('instituicao', instituicao);

        if (eletivasError) {
            return response.status(500).json({ mensagem: 'Erro ao listar as eletivas', detalhe: eletivasError.message });
        }

        return response.status(200).json(eletivasData);
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao listar as eletivas', detalhe: error.message });
    }
};