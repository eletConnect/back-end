const supabase = require('../../../configs/supabase');

exports.editarEletiva = async (request, response) => {
    const { codigo, instituicao, nome, descricao, tipo, professor, dia, horario, sala, total_alunos, status, serie, turma, exclusiva } = request.body;

    // Log para depuração
    console.log(request.body);

    // Verificar se todos os campos obrigatórios estão presentes
    if (!codigo || !instituicao || !nome || !tipo || !professor || !dia || !horario || !sala || !total_alunos || !status) {
        return response.status(400).json({ mensagem: 'Dados incompletos. Verifique todos os campos obrigatórios.' });
    }

    // Verificar se os dados de série e turma são fornecidos para eletivas exclusivas
    if (exclusiva && (!serie || !turma)) {
        return response.status(400).json({ mensagem: 'Dados da série e turma são necessários para eletivas exclusivas.' });
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
                serie: exclusiva ? serie : null,  // Definir série e turma apenas para eletivas exclusivas
                turma: exclusiva ? turma : null   // Se não for exclusiva, manter nulo
            })
            .eq('codigo', codigo)
            .eq('instituicao', instituicao);

        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao editar a eletiva', detalhe: eletivaError.message });
        }

        return response.status(200).json({ mensagem: 'Eletiva editada com sucesso', eletiva: eletivaData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro no servidor', detalhe: error.message });
    }
};
