const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.redefinirSenha = async (request, response) => {
    const { matricula } = request.body;

    if (!matricula ) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        const senha = '07654321';
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const { data: alunoData, error: alunoError } = await supabase
            .from('alunos')
            .update({ senha: senhaCriptografada, senha_temporaria: true })
            .eq('matricula', matricula);

        if (alunoError) {
            return response.status(500).json({ mensagem: 'Erro ao redefinir a senha do aluno', detalhe: alunoError.message });
        }

        return response.status(200).json({ mensagem: 'Senha redefinida com sucesso', alunoData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao redefinir a senha do aluno', detalhe: error.message });
    }
};
