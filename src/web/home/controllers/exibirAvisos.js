const supabase = require('../../../configs/supabase');

exports.exibirAvisos = async (request, response) => {
    const { instituicao } = request.body;
    try {
        const { data: avisos, error } = await supabase
            .from('avisos')
            .select('*')
            .eq('instituicao', instituicao) 
            .order('created_at', { ascending: false }); 

        if (error) {
            return response.status(500).json({ mensagem: `Erro ao consultar banco de dados: ${error.message}` });
        }

        return response.status(200).json(avisos);
    } catch (error) {
        return response.status(500).json({ mensagem: `Erro ao consultar banco de dados: ${error.message}` });
    }
};
