const supabase = require('../../../configs/supabase');

exports.minhasEletivas = async (req, res) => {
    const { matricula, instituicao } = req.body;

    try {
        const { data: eletivas, error: fetchError } = await supabase
            .from('aluno_eletiva')
            .select('codigo_eletiva')
            .eq('matricula_aluno', matricula)
            .eq('instituicao', instituicao);

        if (fetchError) {
            return res.status(500).json({ error: 'Erro ao listar eletivas do aluno!' });
        }

        const codigosEletivas = eletivas.map(eletiva => eletiva.codigo_eletiva);

        const { data, error } = await supabase
            .from('eletivas')
            .select('*')
            .in('codigo', codigosEletivas);

        if (error) {
            return res.status(400).json({ error: 'Erro ao listar eletivas!' });
        }

        return res.status(200).json({ eletivas: data });
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao listar eletivas!' });
    }
}