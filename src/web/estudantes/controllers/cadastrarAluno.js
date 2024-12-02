const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.cadastrarAluno = async (request, response) => {
    const { matricula, nome, serie, turma, instituicao } = request.body;

    if (!matricula || !nome || !turma || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados inválidos. Todos os campos obrigatórios devem ser preenchidos.' });
    }

    try {
        const { data: alunoExistente, error: erroConsulta } = await supabase
            .from('alunos')
            .select('matricula')
            .eq('matricula', matricula)
            .eq('instituicao', instituicao)
            .single(); 

        if (alunoExistente) {
            return response.status(409).json({ mensagem: 'Matrícula já cadastrada. Por favor, insira uma nova matrícula.' });
        }

        const senha = '07654321';
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .insert([
                {
                    matricula,
                    nome,
                    serie,
                    turma,
                    senha: senhaCriptografada,
                    status: 'Ativo',
                    instituicao
                }
            ]);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao cadastrar o aluno', detalhe: alunoError.message });
        }

        return response.status(201).json({ mensagem: 'Aluno cadastrado com sucesso', dados: alunoData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao cadastrar o aluno', detalhe: error.message });
    }
};
