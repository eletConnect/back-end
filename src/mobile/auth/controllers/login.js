const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.login = async (request, response) => {
    const { matricula, senha } = request.body;

    try {
        // Busca o aluno pelo número da matrícula
        const { data: aluno, error: alunoError } = await supabase
            .from('alunos')
            .select('*')
            .eq('matricula', matricula)
            .single();

        if (alunoError) {
            return response.status(500).send({ mensagem: 'Erro ao consultar o banco de dados' });
        }

        if (!aluno) {
            return response.status(400).send({ mensagem: 'Matrícula ou senha inválida' });
        }

        // Verifica a senha
        const senhaValida = await bcrypt.compare(senha, aluno.senha);
        if (!senhaValida) {
            return response.status(400).send({ mensagem: 'Matrícula ou senha inválida' });
        }

        // Busca o nome e a logo da instituição com base no ID ou CNPJ
        const { data: instituicao, error: instituicaoError } = await supabase
            .from('instituicao')
            .select('nome, logotipo')
            .eq('cnpj', aluno.instituicao) // ou você pode usar .eq('cnpj', aluno.instituicao) se usar CNPJ
            .single();

        if (instituicaoError) {
            return response.status(500).send({ mensagem: 'Erro ao buscar dados da instituição' });
        }

        // Armazena os dados do usuário na sessão, incluindo o nome e a logo da instituição
        request.session.user = {
            matricula: aluno.matricula,
            nome: aluno.nome,
            email: aluno.email,
            serie: aluno.serie,
            turma: aluno.turma,
            instituicao: aluno.instituicao,
            instituicaoNome: instituicao.nome,  // Nome da instituição
            instituicaoLogo: instituicao.logotipo,  // Logo da instituição
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
        return response.status(500).send({ mensagem: 'Erro ao realizar login' });
    }
};
