const supabase = require('../../../configs/supabase');

exports.listarEletivasAluno = async (request, response) => {
    const { matricula, instituicao } = request.body;

    if (!matricula || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: alunoData, error: alunoError } = await supabase
            .from('aluno_eletiva')
            .select('codigo_eletiva')
            .eq('matricula_aluno', matricula)
            .eq('instituicao', instituicao);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao listar as eletivas do aluno', detalhe: alunoError.message });
        }

        const codigos = alunoData.map(item => item.codigo_eletiva);

        const { data: eletivasData, error: eletivasError } = await supabase
            .from('eletivas')
            .select('*')
            .in('codigo', codigos);

        if (eletivasError) {
            return response.status(500).json({ mensagem: 'Erro ao listar as eletivas do aluno', detalhe: eletivasError.message });
        }

        return response.status(200).json(eletivasData);
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao listar as eletivas do aluno', detalhe: error.message });
    }
};