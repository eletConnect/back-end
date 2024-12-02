const supabase = require('../../../configs/supabase');

exports.editarEletiva = async (request, response) => {
    const {
        codigo,
        instituicao,
        nome,
        descricao,
        tipo,
        professor,
        dia,
        horario,
        sala,
        total_alunos,
        status,
        exclusiva,
        exclusividade,
        series,
        serie,
        turma 
    } = request.body;

    if (!codigo || !instituicao || !nome || !tipo || !professor || !dia || !horario || !sala || !total_alunos || !status) {
        return response.status(400).json({ mensagem: 'Dados incompletos. Verifique todos os campos obrigatórios.' });
    }

    if (exclusiva) {
        if (exclusividade === 'serie' && (!series || series.length === 0)) {
            return response.status(400).json({ mensagem: 'Selecione ao menos uma série para a exclusividade por série.' });
        }
        if (exclusividade === 'turma' && (!serie || !turma)) {
            return response.status(400).json({ mensagem: 'A série e a turma devem ser fornecidas para a exclusividade por turma.' });
        }
    }

    try {
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .update({
                nome,
                descricao,
                tipo,
                professor,
                dia,
                horario,
                total_alunos,
                sala,
                status,
                exclusiva,
                exclusividade,
                series: exclusividade === 'serie' ? series : [],
                serie: exclusividade === 'turma' ? serie : null,
                turma: exclusividade === 'turma' ? turma : null
            })
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            console.error('Erro ao editar a eletiva:', eletivaError);
            return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva editada com sucesso', eletiva: eletivaData });
    } catch (error) {
        console.error('Erro no servidor:', error);
        return response.status(500).json({ mensagem: 'Erro no servidor', detalhe: error.message });
    }
};
