const supabase = require('../../../configs/supabase');

async function createCode() {
    let codigo;
    let verificarCodigo;

    do {
        codigo = Math.random().toString().substring(2, 10);

        const { data } = await supabase
            .from('instituicao')
            .select('codigo')
            .eq('codigo', codigo)
            .single();

        verificarCodigo = data;

    } while (verificarCodigo);

    return codigo;
}

exports.cadastrarEscola = async (request, response) => {
    const { userID, cnpj, nome, cep, endereco, telefone, logotipo } = request.body;

    if (!userID || !cnpj || !nome || !cep || !endereco || !telefone || !logotipo) {
        return response.status(400).json({ mensagem: 'Todos os campos são obrigatórios.' });
    }

    try {
        const { data: verificarCNPJ, error: verificarCNPJError } = await supabase
            .from('instituicao')
            .select('cnpj')
            .eq('cnpj', cnpj)
            .single();

        if (verificarCNPJError && verificarCNPJError.code !== 'PGRST116') {
            return response.status(500).json({ mensagem: 'Erro ao verificar o CNPJ', detalhe: verificarCNPJError.message });
        }

        if (verificarCNPJ) {
            return response.status(409).json({ mensagem: 'Este CNPJ já está associado a uma instituição.' });
        }

        const codigoAcesso = await createCode();
        if (!codigoAcesso) {
            return response.status(500).json({ mensagem: 'Erro ao gerar código de acesso' });
        }

        const { error: insertError } = await supabase
            .from('instituicao')
            .insert({ cnpj, nome, cep, endereco, telefone, logotipo, codigo: codigoAcesso });

        if (insertError) {
            return response.status(500).json({ mensagem: 'Erro ao cadastrar a instituição', detalhe: insertError.message });
        }

        const { error: addEscolaUserError } = await supabase
            .from('usuarios')
            .update({ instituicao: cnpj, cargo: 'Diretor' })
            .eq('id', userID);

        if (addEscolaUserError) {
            console.error('[Instituição] addEscolaUserError:', addEscolaUserError);
            return response.status(500).json({ mensagem: 'Erro ao vincular a instituição ao usuário', detalhe: addEscolaUserError.message });
        }

        return response.status(200).json({ mensagem: 'Instituição de ensino cadastrada com sucesso!', cnpj, nome, logotipo });
    } catch (error) {
        console.error('[Instituição] cadastrar:', error.message);
        return response.status(500).json({ mensagem: 'Erro ao cadastrar instituição de ensino', detalhe: error.message });
    }
};
