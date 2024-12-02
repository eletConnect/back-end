const supabase = require('../../../configs/supabase');

exports.editarAluno = async (request, response) => {
    const { matriculaAntiga, matriculaNova, nome, serie, turma, email, status } = request.body;

    if (!matriculaAntiga || !matriculaNova || !nome || !turma || !status ) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        const { data: matriculaExistente, error: errorVerificacao } = await supabase
            .from('alunos')
            .select('matricula')
            .eq('matricula', matriculaNova)
            .neq('matricula', matriculaAntiga)
            .maybeSingle(); 

        if (errorVerificacao) {
 
            return response.status(500).json({ mensagem: 'Erro ao verificar matrícula', detalhe: errorVerificacao.message });
        }

        if (matriculaExistente) {
            return response.status(400).json({ mensagem: 'A nova matrícula já está em uso por outro aluno' });
        }

        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .update({ matricula: matriculaNova, nome, serie, turma, email, status })
            .eq('matricula', matriculaAntiga);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao editar o aluno', detalhe: alunoError.message });
        }

        return response.status(200).json({ alunoData, novaMatricula: matriculaNova });
    } catch (error) {
 
        return response.status(500).json({ mensagem: 'Erro ao editar o aluno', detalhe: error.message });
    }
};
