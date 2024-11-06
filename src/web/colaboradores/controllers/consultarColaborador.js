const supabase = require('../../../configs/supabase');

exports.consultarColaborador = async (request, response) => {
    const { matricula, instituicao } = request.body;

    if (!matricula || !instituicao) {
        return response.status(400).json({ mensagem: 'Matrícula e/ou instituição não informada' });
    }

    try {
        const { data: colaboradorData, error: colaboradorError } = await supabase
            .from('usuarios')       
            .select('matricula, nome, cargo, email, status, foto, instituicao, fazerLogin')
            .eq('matricula', matricula)
            .eq('instituicao', instituicao); 

        if (colaboradorError) {
            return response.status(500).json({ mensagem: 'AErro ao consultar o colaborador', detalhe: colaboradorError.message });
        }

        if (!colaboradorData || colaboradorData.length === 0) { 
            return response.status(404).json({ mensagem: 'Colaborador não encontrado' });
        }

        return response.status(200).json({ colaboradorData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao consultar o colaborador', detalhe: error.message });
    }
};
