const supabase = require('../../../configs/supabase');

exports.consultarAluno = async (request, response) => {
    const { matricula } = request.body;

    if (!matricula) {
        return response.status(400).json({ mensagem: 'Matrícula não informada' });
    }

    try {
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .select('matricula, nome, serie, turma, email, status, foto, instituicao')
            .eq('matricula', matricula);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao consultar o aluno', detalhe: alunoError.message });
        }

        if (!alunoData) {
            return response.status(404).json({ mensagem: 'Aluno não encontrado' });
        }

        return response.status(200).json({ alunoData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao consultar o aluno', detalhe: error.message });
    }
};
