const supabase = require('../../../configs/supabase');

exports.verificarEscolaALUNO = async (request, response) => {
    const { matricula } = request.body;

    try {
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .select('instituicao')
            .eq('matricula', matricula)
            .single();

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao verificar o aluno', detalhe: alunoError.message });
        }

        if (!alunoData) {
            return response.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        if (!alunoData.instituicao) {
            return response.status(200).json({ alunoData });
        }

        const { data: instituicaoData, error: instituicaoError } = await supabase
            .from('instituicao')
            .select('cnpj, nome, cep, endereco, telefone, logotipo')
            .eq('cnpj', alunoData.instituicao)
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
