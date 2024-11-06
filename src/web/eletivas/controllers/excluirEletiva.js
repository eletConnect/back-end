const supabase = require('../../../configs/supabase');
const { desmatricularAluno } = require('./desmatricularAluno');

exports.excluirEletiva = async (request, response) => {
    const { codigo, instituicao, tipo } = request.body;

    if (!codigo || !instituicao || !tipo) {
        return response.status(400).json({ mensagem: 'Dados incompletos. Certifique-se de fornecer o código, instituição e tipo.' });
    }

    try {
        const { data: alunosData, error: alunosError } = await supabase
            .from('aluno_eletiva')
            .select('matricula_aluno')
            .eq('codigo_eletiva', codigo)
            .eq('instituicao', instituicao);

        if (alunosError) {
            return response.status(500).json({ mensagem: 'Erro ao buscar alunos matriculados', detalhe: alunosError.message });
        }

        const desmatricularComRetry = async (aluno, retries = 3) => {
            for (let tentativa = 1; tentativa <= retries; tentativa++) {
                try {
                    if (tentativa === 2) {
                        console.log(`Tentativa ${tentativa} de desmatrícula para o aluno com matrícula ${aluno.matricula_aluno}.`);
                    }

                    const desmatriculaRequest = {
                        body: {
                            matricula: aluno.matricula_aluno,
                            codigo,
                            tipo,
                            instituicao,
                        }
                    };

                    const desmatriculaResponse = {
                        status: (statusCode) => ({
                            json: (jsonData) => {
                                if (statusCode >= 400) { 
                                    throw new Error(jsonData.mensagem || 'Erro desconhecido na desmatrícula');
                                }
                            }
                        })
                    };

                    await desmatricularAluno(desmatriculaRequest, desmatriculaResponse);
                    return { sucesso: true };
                } catch (desmatriculaError) {
                    if (tentativa === retries) {
                        return { sucesso: false, erro: desmatriculaError.message };
                    }
                }
            }
        };

        let falhas = [];

        if (alunosData && alunosData.length > 0) {
            for (const aluno of alunosData) {
                const resultado = await desmatricularComRetry(aluno);
                if (!resultado.sucesso) {
                    falhas.push({ matricula: aluno.matricula_aluno, erro: resultado.erro });
                }
            }
        }

        const { error: eletivaError } = await supabase
            .from('eletivas')
            .delete()
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir a eletiva', detalhe: eletivaError.message });
        }

        if (falhas.length > 0) {
            return response.status(200).json({ mensagem: 'Eletiva excluída, mas houve falhas ao desmatricular alguns alunos', falhas });
        }

        return response.status(200).json({ mensagem: 'Eletiva excluída com sucesso e todos os alunos foram desmatriculados' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro interno ao excluir a eletiva', detalhe: error.message });
    }
};
