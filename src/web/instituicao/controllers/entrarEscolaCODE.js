const supabase = require('../../../configs/supabase');

exports.entrarEscolaCODE = async (request, response) => {
    const { id, codigo } = request.body;

    if (!codigo || !id) {
        return response.status(400).json({ mensagem: 'Código de acesso ou ID do usuário não informado' });
    }

    try {
        const { data, error } = await supabase
            .from('instituicao')
            .select('cnpj, nome, logotipo')
            .eq('codigo', codigo)
            .single();

        if (error) {
            return response.status(500).json({ mensagem: 'Erro ao verificar o código de acesso', detalhe: error.message });
        }

        if (!data) {
            return response.status(404).json({ mensagem: 'Código de acesso inválido' });
        }

        const { error: addEscolaUserError } = await supabase
            .from('usuarios')
            .update({ instituicao: data.cnpj, cargo: 'Colaborador' })
            .eq('id', id);

        if (addEscolaUserError) {
            return response.status(500).json({ mensagem: 'Erro ao vincular a instituição ao usuário', detalhe: addEscolaUserError.message });
        }

        return response.status(200).json({ mensagem: 'Entrada na instituição realizada com sucesso', instituicao: data });
    } catch (error) {
        console.error('[Instituição] entrar:', error);
        return response.status(500).json({ mensagem: 'Erro ao entrar na instituição' });
    }
};
