const supabase = require('../../../configs/supabase');

exports.quantidades = async (request, response) => {
    const { instituicao } = request.body;

    if (!instituicao) {
        return response.status(400).json({ mensagem: 'Instituição não informada' });
    }

    try {
        const { data: alunos, error: alunosError } = await supabase
            .from('alunos')
            .select('matricula, serie, turma, qnt_eletiva, qnt_trilha, qnt_projetoVida')
            .eq('instituicao', instituicao)
            .eq('status', 'Ativo'); 

        if (alunosError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar os alunos', detalhe: alunosError.message });
        }

        const quantidadeAlunos1Ano = alunos.filter(aluno => aluno.serie === '1º ano').length;
        const quantidadeAlunos2Ano = alunos.filter(aluno => aluno.serie === '2º ano').length;
        const quantidadeAlunos3Ano = alunos.filter(aluno => aluno.serie === '3º ano').length;

        const quantidadeMatriculados1Ano = alunos.filter(aluno => aluno.serie === '1º ano' && (aluno.qnt_eletiva > 0 || aluno.qnt_trilha > 0 || aluno.qnt_projetoVida > 0)).length;
        const quantidadeNaoMatriculados1Ano = quantidadeAlunos1Ano - quantidadeMatriculados1Ano;

        const quantidadeMatriculados2Ano = alunos.filter(aluno => aluno.serie === '2º ano' && (aluno.qnt_eletiva > 0 || aluno.qnt_trilha > 0 || aluno.qnt_projetoVida > 0)).length;
        const quantidadeNaoMatriculados2Ano = quantidadeAlunos2Ano - quantidadeMatriculados2Ano;

        const quantidadeMatriculados3Ano = alunos.filter(aluno => aluno.serie === '3º ano' && (aluno.qnt_eletiva > 0 || aluno.qnt_trilha > 0 || aluno.qnt_projetoVida > 0)).length;
        const quantidadeNaoMatriculados3Ano = quantidadeAlunos3Ano - quantidadeMatriculados3Ano;

        const turmasSet = new Set(alunos.map(aluno => aluno.turma)); 
        const quantidadeTotalTurmas = turmasSet.size;

        const { data: eletivas, error: eletivasError } = await supabase
            .from('eletivas')
            .select('tipo')
            .eq('instituicao', instituicao)

        if (eletivasError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar as eletivas', detalhe: eletivasError.message });
        }

        const quantidadeEletivas = eletivas.filter(eletiva => eletiva.tipo === 'Eletiva').length;
        const quantidadeProjetosVida = eletivas.filter(eletiva => eletiva.tipo === 'Projeto de Vida').length;
        const quantidadeTrilhas = eletivas.filter(eletiva => eletiva.tipo === 'Trilha').length;

        const { data: colaboradores, error: colaboradoresError } = await supabase
            .from('usuarios')
            .select('matricula')
            .eq('instituicao', instituicao);

        if (colaboradoresError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar os colaboradores', detalhe: colaboradoresError.message });
        }

        const totalColaboradores = colaboradores.length;

        return response.status(200).json({
            quantidadeAlunos1Ano,
            quantidadeMatriculados1Ano,
            quantidadeNaoMatriculados1Ano,
            quantidadeAlunos2Ano,
            quantidadeMatriculados2Ano,
            quantidadeNaoMatriculados2Ano,
            quantidadeAlunos3Ano,
            quantidadeMatriculados3Ano,
            quantidadeNaoMatriculados3Ano,
            quantidadeEletivas,
            quantidadeProjetosVida,
            quantidadeTrilhas,
            quantidadeTotalTurmas,
            totalAlunos: alunos.length,
            totalColaboradores
        });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao processar a requisição', detalhe: error.message });
    }
};
