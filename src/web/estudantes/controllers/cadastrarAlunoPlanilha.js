const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.cadastrarAlunoPlanilha = async (request, response) => {
    const { dados, instituicao } = request.body;

    if (!dados || dados.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados inválidos ou instituição não informada. Verifique e tente novamente.' });
    }

    try {
        // Verificar matrículas já cadastradas
        const matriculasRecebidas = dados.map(aluno => aluno.matricula);

        const { data: alunosExistentes, error: erroConsulta } = await supabase
            .from('alunos')
            .select('matricula')
            .in('matricula', matriculasRecebidas)
            .eq('instituicao', instituicao);

        if (erroConsulta) {
            throw new Error(`Erro ao consultar banco de dados: ${erroConsulta.message}`);
        }

        const matriculasExistentes = alunosExistentes.map(aluno => aluno.matricula);

        // Identificar os alunos que têm matrículas duplicadas e os que têm séries inválidas
        const erros = {};
        const seriesValidas = ['1º ano', '2º ano', '3º ano']; // Definir séries válidas
        dados.forEach((aluno, index) => {
            if (matriculasExistentes.includes(aluno.matricula)) {
                erros[index] = { matricula: `Matrícula ${aluno.matricula} já cadastrada.` };
            } else if (!seriesValidas.includes(aluno.serie)) {
                erros[index] = { serie: `Série ${aluno.serie} inválida. Somente 1º ano, 2º ano e 3º ano são permitidos.` };
            }
        });

        if (Object.keys(erros).length > 0) {
            return response.status(400).json({
                mensagem: 'Alguns dados estão incorretos.',
                erros
            });
        }

        // Criptografar senha padrão
        const senhaPadrao = '076544321';
        const senhaCriptografada = await bcrypt.hash(senhaPadrao, 10);

        // Preparar os alunos sem erro para cadastro
        const alunosSemErro = dados.map(aluno => ({
            ...aluno,
            senha: senhaCriptografada,
            status: 'Ativo',
            instituicao
        }));

        // Inserir alunos no banco de dados
        const { error: erroInsercao } = await supabase
            .from('alunos')
            .insert(alunosSemErro);

        if (erroInsercao) {
            return response.status(500).json({ mensagem: 'Erro ao inserir alunos.', detalhe: erroInsercao.message });
        }

        return response.status(201).json({ mensagem: 'Alunos cadastrados com sucesso!' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao processar o cadastro.', detalhe: error.message });
    }
};
