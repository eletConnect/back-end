const supabase = require('../../../configs/supabase');

exports.listarAlunosEletiva = async (request, response) => {
    const { codigo, instituicao } = request.body;

    // Verificação de dados incompletos
    if (!codigo || !instituicao) {
        return response.status(400).json({ mensagem: 'Código da eletiva e instituição são obrigatórios.' });
    }

    try {
        // Buscar todas as matrículas dos alunos associadas à eletiva
        const { data: alunoEletivaData, error: alunoEletivaError } = await supabase
            .from('aluno_eletiva')
            .select('matricula_aluno')
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao);

        if (alunoEletivaError) {
            console.error('Erro ao listar as matrículas dos alunos da eletiva:', alunoEletivaError);
            return response.status(500).json({ mensagem: 'Erro ao listar as matrículas dos alunos da eletiva', detalhe: alunoEletivaError.message });
        }

        // Se não houver alunos matriculados, retornar um array vazio
        if (!alunoEletivaData || alunoEletivaData.length === 0) {
            return response.status(200).json([]);
        }

        // Extrair as matrículas dos alunos
        const matriculas = alunoEletivaData.map(item => item.matricula_aluno);

        // Buscar os dados dos alunos usando as matrículas
        const { data: alunosData, error: alunosError } = await supabase
            .from('alunos')
            .select('*')
            .in('matricula', matriculas);

        if (alunosError) {
            console.error('Erro ao buscar os dados dos alunos:', alunosError);
            return response.status(500).json({ mensagem: 'Erro ao listar os alunos da eletiva', detalhe: alunosError.message });
        }

        // Retornar os dados dos alunos encontrados
        return response.status(200).json(alunosData);
    } catch (error) {
        console.error('Erro interno ao listar os alunos da eletiva:', error);
        return response.status(500).json({ mensagem: 'Erro interno ao listar os alunos da eletiva', detalhe: error.message });
    }
};
