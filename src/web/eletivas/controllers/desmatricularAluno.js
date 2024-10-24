const supabase = require('../../../configs/supabase');

exports.desmatricularAluno = async (request, response) => {
    const { matricula, codigo, tipo, instituicao } = request.body;

    // Verificar se os dados obrigatórios foram fornecidos
    if (!matricula || !codigo || !tipo || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos. Verifique os campos e tente novamente.' });
    }

    try {
        // Buscar a eletiva associada ao aluno
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .select('alunos_cadastrados')
            .eq('codigo', codigo)
            .eq('instituicao', instituicao)
            .single();

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao buscar dados da eletiva', detalhe: eletivaError.message });
        }

        if (!eletivaData) {
            return response.status(404).json({ mensagem: 'Eletiva não encontrada' });
        }

        let { alunos_cadastrados } = eletivaData;

        // Verificar se o aluno está matriculado na eletiva
        const { data: associacaoData, error: associacaoError } = await supabase
            .from('aluno_eletiva')
            .select('*')
            .eq('matricula_aluno', matricula)
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao)
            .single();

        if (associacaoError && associacaoError.code !== 'PGRST116') {
            return response.status(500).json({ mensagem: 'Erro ao verificar associação do aluno à eletiva', detalhe: associacaoError.message });
        }

        if (!associacaoData) {
            return response.status(404).json({ mensagem: 'Aluno não está matriculado nesta eletiva' });
        }

        // Desmatricular o aluno da eletiva (remover da tabela aluno_eletiva)
        const { error: desmatriculaError } = await supabase
            .from('aluno_eletiva')
            .delete()
            .eq('matricula_aluno', matricula)
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao);

        if (desmatriculaError) {
            return response.status(500).json({ mensagem: 'Erro ao desmatricular o aluno da eletiva', detalhe: desmatriculaError.message });
        }

        // Atualizar o contador de alunos na eletiva
        if (alunos_cadastrados > 0) {
            const { error: updateError } = await supabase
                .from('eletivas')
                .update({ alunos_cadastrados: alunos_cadastrados - 1 })
                .eq('codigo', codigo)
                .eq('instituicao', instituicao);

            if (updateError) {
                return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de alunos na eletiva', detalhe: updateError.message });
            }
        }

        // Atualizar o contador de eletivas, trilhas ou projetos do aluno
        let tipoEletivaField = '';
        switch (tipo) {
            case 'Eletiva':
                tipoEletivaField = 'qnt_eletiva';
                break;
            case 'Trilha':
                tipoEletivaField = 'qnt_trilha';
                break;
            case 'Projeto de Vida':
                tipoEletivaField = 'qnt_projetoVida';
                break;
            default:
                return response.status(400).json({ mensagem: 'Tipo de eletiva desconhecido' });
        }

        // Buscar a quantidade atual de eletivas do aluno
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .select(tipoEletivaField)
            .eq('matricula', matricula)
            .eq('instituicao', instituicao)
            .single();

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar o aluno', detalhe: alunoError.message });
        }

        // Atualizar o contador de eletivas do aluno
        const novaQuantidade = Math.max((alunoData[tipoEletivaField] || 0) - 1, 0);

        const { error: alunoUpdateError } = await supabase
            .from('alunos')
            .update({ [tipoEletivaField]: novaQuantidade })
            .eq('matricula', matricula)
            .eq('instituicao', instituicao);

        if (alunoUpdateError) {
            return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de eletivas do aluno', detalhe: alunoUpdateError.message });
        }

        // Resposta de sucesso
        return response.status(200).json({ mensagem: 'Aluno desmatriculado da eletiva com sucesso' });
    } catch (error) {
        // Captura de erros não tratados
        return response.status(500).json({ mensagem: 'Erro interno ao desmatricular o aluno da eletiva', detalhe: error.message });
    }
};
