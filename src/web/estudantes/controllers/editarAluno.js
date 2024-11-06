const supabase = require('../../../configs/supabase');

exports.editarAluno = async (request, response) => {
    const { matriculaAntiga, matriculaNova, nome, serie, turma, email, status } = request.body;

    // Verificar se os dados necessários estão presentes
    if (!matriculaAntiga || !matriculaNova || !nome || !turma || !status ) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        // Verificar se a nova matrícula já está em uso por outro aluno
        const { data: matriculaExistente, error: errorVerificacao } = await supabase
            .from('alunos')
            .select('matricula')
            .eq('matricula', matriculaNova)
            .neq('matricula', matriculaAntiga)
            .maybeSingle(); // Alterado para `maybeSingle()`

        // Verificar se houve erro ao consultar o banco de dados
        if (errorVerificacao) {
 
            return response.status(500).json({ mensagem: 'Erro ao verificar matrícula', detalhe: errorVerificacao.message });
        }

        // Se a matrícula já estiver em uso, retornar erro
        if (matriculaExistente) {
            return response.status(400).json({ mensagem: 'A nova matrícula já está em uso por outro aluno' });
        }

        // Atualizar o registro do aluno
        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .update({ matricula: matriculaNova, nome, serie, turma, email, status })
            .eq('matricula', matriculaAntiga);

        // Verificar se houve erro na atualização
        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao editar o aluno', detalhe: alunoError.message });
        }

        // Retornar sucesso
        return response.status(200).json({ alunoData, novaMatricula: matriculaNova });
    } catch (error) {
 
        return response.status(500).json({ mensagem: 'Erro ao editar o aluno', detalhe: error.message });
    }
};
