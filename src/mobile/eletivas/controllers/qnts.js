const supabase = require('../../../configs/supabase');

exports.qnts = async (req, res) => {
    const { matricula, instituicao } = req.body;

    try {
        // Buscar os códigos das eletivas nas quais o aluno está matriculado
        const { data: qnts, error: fetchError } = await supabase
            .from('alunos')
            .select('qnt_eletiva, qnt_trilha, qnt_projetoVida')
            .eq('matricula', matricula)
            .eq('instituicao', instituicao);

        if (fetchError) {
            return res.status(500).json({ error: 'Erro ao listar eletivas do aluno!' });
        }

        return res.status(200).json({ qnts });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao listar eletivas!' });
    }
}