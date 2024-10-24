const supabase = require('../../../configs/supabase');

exports.excluirAluno = async (request, response) => {
    const { matricula, instituicao } = request.body;

    if (!matricula || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos. Matrícula e instituição são obrigatórios.' });
    }

    try {
        // Verificar se o aluno existe
        const { data: alunoExistente, error: erroVerificacao } = await supabase
            .from('alunos')
            .select('matricula')
            .eq('matricula', matricula)
            .eq('instituicao', instituicao)
            .single();

        if (erroVerificacao) {
            return response.status(500).json({ mensagem: 'Erro ao verificar a existência do aluno', detalhe: erroVerificacao.message });
        }

        if (!alunoExistente) {
            return response.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        // Buscar todas as eletivas associadas ao aluno antes de excluí-lo
        const { data: eletivasAssociadas, error: erroEletivas } = await supabase
            .from('aluno_eletiva')
            .select('codigo_eletiva')
            .eq('matricula_aluno', matricula)
            .eq('instituicao', instituicao);

        if (erroEletivas) {
            return response.status(500).json({ mensagem: 'Erro ao buscar as eletivas associadas ao aluno', detalhe: erroEletivas.message });
        }

        if (!eletivasAssociadas || eletivasAssociadas.length === 0) {
            console.log('Nenhuma eletiva associada encontrada para o aluno:', matricula);
        } else {
            console.log('Eletivas associadas encontradas:', eletivasAssociadas);
        }

        // Desmatricular o aluno de todas as eletivas associadas
        for (const eletiva of eletivasAssociadas) {
            const { error: desmatriculaError } = await supabase
                .from('aluno_eletiva')
                .delete()
                .eq('matricula_aluno', matricula)
                .eq('codigo_eletiva', eletiva.codigo_eletiva)
                .eq('instituicao', instituicao);

            if (desmatriculaError) {
                console.error('Erro ao desmatricular o aluno da eletiva:', eletiva.codigo_eletiva, desmatriculaError);
                return response.status(500).json({ mensagem: `Erro ao desmatricular o aluno da eletiva ${eletiva.codigo_eletiva}`, detalhe: desmatriculaError.message });
            }

            // Atualizar o número de alunos cadastrados na eletiva
            const { data: eletivaData, error: erroEletiva } = await supabase
                .from('eletivas')
                .select('alunos_cadastrados')
                .eq('codigo', eletiva.codigo_eletiva)
                .eq('instituicao', instituicao)
                .single();

            if (erroEletiva) {
                console.error('Erro ao buscar a eletiva para atualizar número de alunos:', eletiva.codigo_eletiva, erroEletiva);
                return response.status(500).json({ mensagem: `Erro ao buscar a eletiva ${eletiva.codigo_eletiva}`, detalhe: erroEletiva.message });
            }

            const novosAlunosCadastrados = Math.max(eletivaData.alunos_cadastrados - 1, 0);

            const { error: updateError } = await supabase
                .from('eletivas')
                .update({ alunos_cadastrados: novosAlunosCadastrados })
                .eq('codigo', eletiva.codigo_eletiva)
                .eq('instituicao', instituicao);

            if (updateError) {
                console.error('Erro ao atualizar o número de alunos na eletiva:', eletiva.codigo_eletiva, updateError);
                return response.status(500).json({ mensagem: `Erro ao atualizar o número de alunos na eletiva ${eletiva.codigo_eletiva}`, detalhe: updateError.message });
            }
        }

        // Excluir o aluno da tabela 'alunos' após desmatriculá-lo das eletivas
        const { data: alunoExcluido, error: alunoError } = await supabase
            .from('alunos')
            .delete()
            .eq('matricula', matricula)
            .eq('instituicao', instituicao);

        if (alunoError) {
            console.error('Erro ao excluir o aluno:', alunoError);
            return response.status(500).json({ mensagem: 'Erro ao excluir o aluno', detalhe: alunoError.message });
        }

        return response.status(200).json({ mensagem: 'Aluno excluído com sucesso, incluindo a desmatrícula de todas as eletivas' });
    } catch (error) {
        console.error('Erro interno ao excluir o aluno:', error);
        return response.status(500).json({ mensagem: 'Erro interno ao excluir o aluno', detalhe: error.message });
    }
};
