const supabase = require('../../../configs/supabase');

exports.matricularMultiplosAlunos = async (request, response) => {
    const { matriculas, codigo, tipo, instituicao } = request.body;

    if (!matriculas || !Array.isArray(matriculas) || matriculas.length === 0 || !codigo || !tipo || !instituicao) {
        console.error('Dados incompletos:', { matriculas, codigo, tipo, instituicao });
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .select('alunos_cadastrados, total_alunos')
            .eq('codigo', codigo)
            .eq('instituicao', instituicao)
            .single();

        if (eletivaError || !eletivaData) {
            console.error('Erro ao buscar dados da eletiva:', eletivaError);
            const mensagem = eletivaError ? eletivaError.message : 'Eletiva não encontrada';
            return response.status(eletivaError ? 500 : 404).json({ mensagem: 'Erro ao buscar dados da eletiva', detalhe: mensagem });
        }

        let alunosCadastrados = parseInt(eletivaData.alunos_cadastrados, 10);
        const totalAlunos = parseInt(eletivaData.total_alunos, 10);

        if (isNaN(alunosCadastrados) || isNaN(totalAlunos)) {
            return response.status(500).json({ mensagem: 'Valores inválidos para o total de alunos ou alunos cadastrados' });
        }

        if (alunosCadastrados + matriculas.length > totalAlunos) {
            return response.status(400).json({ mensagem: `Número máximo de alunos atingido para esta eletiva. Capacidade restante: ${totalAlunos - alunosCadastrados}` });
        }

        const { data: alunosData, error: alunosError } = await supabase
            .from('alunos')
            .select('matricula, qnt_eletiva, qnt_trilha, qnt_projetoVida')
            .in('matricula', matriculas)
            .eq('instituicao', instituicao);

        if (alunosError || !alunosData) {
            console.error('Erro ao buscar dados dos alunos:', alunosError);
            const mensagem = alunosError ? alunosError.message : 'Alunos não encontrados';
            return response.status(alunosError ? 500 : 404).json({ mensagem: 'Erro ao buscar dados dos alunos', detalhe: mensagem });
        }

        const { data: associacoesData, error: associacoesError } = await supabase
            .from('aluno_eletiva')
            .select('matricula_aluno')
            .in('matricula_aluno', matriculas)
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao);

        if (associacoesError) {
            console.error('Erro ao buscar associações dos alunos à eletiva:', associacoesError);
            return response.status(500).json({ mensagem: 'Erro ao buscar associações dos alunos à eletiva', detalhe: associacoesError.message });
        }

        const alunosAssociados = associacoesData ? associacoesData.map(associacao => associacao.matricula_aluno) : [];
        const matriculasNaoAssociadas = matriculas.filter(matricula => !alunosAssociados.includes(matricula));

        const associacoesNovas = matriculasNaoAssociadas.map(matricula => ({
            matricula_aluno: matricula,
            codigo_eletiva: codigo,
            instituicao
        }));

        const { error: associacaoError2 } = await supabase
            .from('aluno_eletiva')
            .insert(associacoesNovas);

        if (associacaoError2) {
            console.error('Erro ao associar os alunos à eletiva:', associacaoError2);
            return response.status(500).json({ mensagem: 'Erro ao associar os alunos à eletiva', detalhe: associacaoError2.message });
        }

        alunosCadastrados += matriculasNaoAssociadas.length;

        const { error: updateError } = await supabase
            .from('eletivas')
            .update({ alunos_cadastrados: alunosCadastrados })
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (updateError) {
            console.error('Erro ao atualizar quantidade de alunos cadastrados:', updateError);
            return response.status(500).json({ mensagem: 'Erro ao atualizar o contador de alunos cadastrados na eletiva', detalhe: updateError.message });
        }

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
                console.error('Tipo de eletiva desconhecido:', tipo);
                return response.status(400).json({ mensagem: 'Tipo de eletiva desconhecido' });
        }

        for (const aluno of alunosData) {
            if (matriculasNaoAssociadas.includes(aluno.matricula)) {
                const { error: alunoUpdateError } = await supabase
                    .from('alunos')
                    .update({ [tipoEletivaField]: parseInt(aluno[tipoEletivaField] || 0, 10) + 1 })
                    .eq('matricula', aluno.matricula)
                    .eq('instituicao', instituicao);

                if (alunoUpdateError) {
                    console.error(`Erro ao atualizar contador do aluno ${aluno.matricula}:`, alunoUpdateError);
                }
            }
        }

        console.log('Alunos matriculados com sucesso:', matriculasNaoAssociadas);
        return response.status(201).json({ mensagem: 'Alunos associados à eletiva com sucesso', matriculas: matriculasNaoAssociadas });

    } catch (error) {
        console.error('Erro interno ao associar os alunos à eletiva:', error);
        return response.status(500).json({ mensagem: 'Erro interno ao associar os alunos à eletiva', detalhe: error.message });
    }
};
