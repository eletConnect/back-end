const supabase = require('../../../configs/supabase');

exports.listarEletivas = async (require, response) => {
    const { instituicao } = require.body;
    try {
        const { data, error } = await supabase
            .from('eletivas')
            .select('*')
            .eq('instituicao', instituicao);

        if (error) {
            return response.status(400).json({ error: 'Erro ao listar eletivas!' });
        }

        return response.status(200).json({ eletivas: data });
    } catch (error) {
        return response.status(500).json({ error: 'Erro ao listar eletivas!' });
    }
}