const supabase = require('../../../configs/supabase');

exports.editarAviso = async (req, res) => {
  const { avisoParaSalvar, instituicao } = req.body;

  try {
    // Validação dos campos obrigatórios
    if (!avisoParaSalvar || !avisoParaSalvar.id || !instituicao) {
      return res.status(400).json({
        mensagem: 'Todos os campos obrigatórios devem ser preenchidos: aviso, ID e instituição.',
      });
    }

    // Preparação dos valores de 'series' para salvar
    let seriesParaSalvar = null;
    if (avisoParaSalvar.series?.length) {
      seriesParaSalvar = avisoParaSalvar.series.join(', '); // Une múltiplas séries em uma string
    } else if (avisoParaSalvar.serie) {
      seriesParaSalvar = avisoParaSalvar.serie; // Salva a série única se fornecida
    }

    // Atualiza o aviso no banco de dados
    const { data, error } = await supabase
      .from('avisos')
      .update({
        titulo: avisoParaSalvar.titulo,
        conteudo: avisoParaSalvar.conteudo,
        author: avisoParaSalvar.author,
        series: seriesParaSalvar,
        turma: avisoParaSalvar.turma || null,
        cor: avisoParaSalvar.cor || 'primary',
      })
      .eq('id', avisoParaSalvar.id)
      .eq('instituicao', instituicao)
      .select();

    // Tratamento de erro ao atualizar
    if (error) {
      return res.status(500).json({
        mensagem: 'Houve um problema ao atualizar o aviso. Tente novamente mais tarde.',
      });
    }

    // Retorna o aviso atualizado
    return res.status(200).json(data[0]);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Ocorreu um erro inesperado ao editar o aviso. Tente novamente mais tarde.',
    });
  }
};
