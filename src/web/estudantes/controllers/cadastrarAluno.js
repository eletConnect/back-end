const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.cadastrarAluno = async (request, response) => {
    const { matricula, nome, serie, turma, instituicao } = request.body;

    if (!matricula || !nome || !turma || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados inválidos. Todos os campos obrigatórios devem ser preenchidos.' });
    }

    try {
        // Verificar se a matrícula já existe
        const { data: alunoExistente, error: erroConsulta } = await supabase
            .from('alunos')
            .select('matricula')
            .eq('matricula', matricula)
            .eq('instituicao', instituicao)
            .single(); // Espera um único resultado

        // Se já existe um aluno com a mesma matrícula, retornar erro
        if (alunoExistente) {
            return response.status(409).json({ mensagem: 'Matrícula já cadastrada. Por favor, insira uma nova matrícula.' });
        }

        // Gerar a senha padrão e criptografá-la
        const senha = '076544321';
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        // Inserir o novo aluno
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
