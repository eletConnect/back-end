const supabase = require('../../../configs/supabase');
const { desmatricularAluno } = require('./desmatricularAluno');

exports.excluirMultiplas = async (request, response) => {
    const { eletivas, instituicao } = request.body;

    if (!Array.isArray(eletivas) || eletivas.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Dados incompletos. Certifique-se de fornecer as eletivas e a instituição.' });
    }

    const codigos = eletivas.map(eletiva => eletiva.codigo);
    const tipos = eletivas.map(eletiva => eletiva.tipo);

    if (codigos.length === 0 || tipos.length === 0) {
        return response.status(400).json({ mensagem: 'Cada eletiva deve ter código e tipo definidos.' });
    }

    try {
        const { data: alunosData, error: alunosError } = await supabase
            .from('aluno_eletiva')
            .select('matricula_aluno, codigo_eletiva')
            .in('codigo_eletiva', codigos)
            .eq('instituicao', instituicao);

        if (alunosError) {
            return response.status(500).json({ mensagem: 'Erro ao buscar alunos matriculados', detalhe: alunosError.message });
        }

        if (alunosData && alunosData.length > 0) {
            const desmatriculaRequests = alunosData.map(aluno => {
                const eletiva = eletivas.find(e => e.codigo === aluno.codigo_eletiva);
                const desmatriculaRequest = {
                    body: {
                        matricula: aluno.matricula_aluno,
                        codigo: aluno.codigo_eletiva,
                        tipo: eletiva.tipo,
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

                return desmatricularAluno(desmatriculaRequest, desmatriculaResponse);
            });

            try {
                await Promise.all(desmatriculaRequests);
            } catch (desmatriculaError) {
                return response.status(500).json({ mensagem: `Erro ao desmatricular alunos das eletivas`, detalhe: desmatriculaError.message });
            }
        }

        const { error: eletivaError } = await supabase
            .from('eletivas')
            .delete()
            .in('codigo', codigos)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir as eletivas', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletivas excluídas com sucesso' });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao excluir as eletivas', detalhe: error.message });
    }
};
