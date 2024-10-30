const supabase = require('../../../configs/supabase');

exports.excluirMultiplos = async (request, response) => {
    const { matriculas, instituicao } = request.body;

    if (!matriculas || !Array.isArray(matriculas) || matriculas.length === 0 || !instituicao) {
        return response.status(400).json({ mensagem: 'Matrículas e instituição são obrigatórias' });
    }

    try {
        const { error: colaboradorError } = await supabase
            .from('usuarios')
            .delete()
            .in('matricula', matriculas) 
            .eq('instituicao', instituicao);

        if (colaboradorError) {
            return response.status(500).json({ mensagem: 'Erro ao excluir os colaboradores', detalhe: colaboradorError.message });
        }

        return response.status(200).json({
            mensagem: 'Colaboradores excluídos com sucesso'
        });

    } catch (error) {
        return response.status(500).json({
            mensagem: 'Erro inesperado ao excluir os colaboradores',
            detalhe: error.message
        });
    }
};
