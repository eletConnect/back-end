const supabase = require('../../../configs/supabase');

exports.excluirMultiplos = async (request, response) => {
    const { matriculas, instituicao } = request.body; 

    if (!matriculas || !Array.isArray(matriculas) || matriculas.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Matrículas e instituição são obrigatórias e matrículas devem ser um array não vazio' });
    }

    try {
        const { data: alunosExcluidos, error: exclusaoError } = await supabase
            .from('alunos')
            .delete()
            .in('matricula', matriculas) 
            .eq('instituicao', instituicao);

        if (exclusaoError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir os alunos', detalhe: exclusaoError.message });
        }

        return response.status(200).json({
            mensagem: 'Alunos excluídos com sucesso',
            alunosExcluidos
        });
    } catch (error) {
        return response.status(500).json({
            mensagem: 'Erro inesperado ao excluir os alunos',
            detalhe: error.message
        });
    }
};
