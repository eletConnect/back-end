const supabase = require('../../../configs/supabase');

exports.editarAviso = async (req, res) => {
    const { avisoParaSalvar, instituicao } = req.body;

    try {
        // Verifica se 'series' tem valores e une esses valores em uma string. Caso contrário, usa 'serie'
        const seriesParaSalvar = avisoParaSalvar.series && avisoParaSalvar.series.length > 0 
            ? avisoParaSalvar.series.join(', ')  // Concatena múltiplas séries em uma string separada por vírgulas
            : avisoParaSalvar.serie || null;  // Se 'serie' for definida, usamos ela

        // Atualiza o aviso no banco de dados com os novos valores
        const { data, error } = await supabase
            .from('avisos')
            .update({
                titulo: avisoParaSalvar.titulo,
                conteudo: avisoParaSalvar.conteudo,
                author: avisoParaSalvar.author,
                series: seriesParaSalvar,  // Atualiza a série ou séries
                turma: avisoParaSalvar.turma || null,  // Atualiza a turma, se fornecida
                cor: avisoParaSalvar.cor || 'primary'  // Atualiza a cor, se fornecida, com valor padrão 'primary'
            })
            .eq('id', avisoParaSalvar.id)
            .eq('instituicao', instituicao)
            .select();

        if (error) {
            return res.status(500).json({ mensagem: error.message });
        }

        return res.status(200).json(data[0]);  // Retorna o primeiro item atualizado
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao editar aviso.' });
    }
};
