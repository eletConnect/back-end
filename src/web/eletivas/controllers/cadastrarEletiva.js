const supabase = require('../../../configs/supabase');
const { v4: uuidv4 } = require('uuid');

// Função para gerar um código único de 4 dígitos
function createCode() {
    const uuid = uuidv4();
    const numericPart = parseInt(uuid.replace(/-/g, '').slice(0, 8), 16);
    return String(numericPart % 10000).padStart(4, '0');
}

exports.cadastrarEletiva = async (request, response) => {
    const { instituicao, nome, tipo, dia, horario, professor, sala, total_alunos, serie, turma, exclusiva } = request.body;

    // Verificar campos obrigatórios
    if (!instituicao || !nome || !tipo || !professor || !total_alunos) {
        return response.status(400).json({ mensagem: 'Dados incompletos' });
    }

    const isExclusiva = exclusiva === true || exclusiva === 'true';

    // Verificar campos obrigatórios para eletivas exclusivas
    if (isExclusiva && (!serie || !turma)) {
        return response.status(400).json({ mensagem: 'Dados da série e turma são necessários para eletivas exclusivas' });
    }

    try {
        // Inserir a nova eletiva no Supabase
        const { data: eletivaData, error: eletivaError } = await supabase
            .from('eletivas')
            .insert([{
                codigo: createCode(),
                instituicao,
                nome,
                tipo,
                dia,
                sala,
                horario,
                professor,
                total_alunos,
                status: 'Ativa',
                exclusiva: isExclusiva,
                serie: isExclusiva ? serie : null,
                turma: isExclusiva ? turma : null
            }]);

        // Verificar se houve erro durante a inserção
        if (eletivaError) {
            return response.status(500).json({ mensagem: 'Erro ao cadastrar a eletiva', detalhe: eletivaError.message });
        }

        // Retornar sucesso
        return response.status(201).json({ mensagem: 'Eletiva cadastrada com sucesso', eletiva: eletivaData });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao cadastrar a eletiva', detalhe: error.message });
    }
};
