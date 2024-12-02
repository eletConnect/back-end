const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.login = async (request, response) => {
    const { matricula, senha } = request.body;

    try {
        const { data: aluno, error: alunoError } = await supabase
            .from('alunos')
            .select('*')
            .eq('matricula', matricula)
            .single();

        if (alunoError || !aluno) {
            return response.status(400).send({ mensagem: 'Matrícula ou senha inválida' });
        }

        const senhaValida = await bcrypt.compare(senha, aluno.senha);
        if (!senhaValida) {
            return response.status(400).send({ mensagem: 'Matrícula ou senha inválida' });
        }

        const { data: instituicao, error: instituicaoError } = await supabase
            .from('instituicao')
            .select('nome, logotipo')
            .eq('cnpj', aluno.instituicao)
            .single();

        if (instituicaoError || !instituicao) {
            return response.status(500).send({ mensagem: 'Erro ao buscar dados da instituição' });
        }

        request.session.user = {
            matricula: aluno.matricula,
            nome: aluno.nome,
            email: aluno.email,
            serie: aluno.serie,
            turma: aluno.turma,
            instituicao: aluno.instituicao,
            instituicaoNome: instituicao.nome,
            instituicaoLogo: instituicao.logotipo,
            foto: aluno.foto,
            status: aluno.status,
            qnt_eletiva: aluno.qnt_eletiva,
            qnt_trilha: aluno.qnt_trilha,
            qnt_projetoVida: aluno.qnt_projetoVida,
            senha_temporaria: aluno.senha_temporaria,
            cargo: aluno.cargo,
        };

        return response.status(200).send({ mensagem: 'Login realizado com sucesso' });
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        return response.status(500).send({ mensagem: 'Erro ao realizar login' });
    }
};
