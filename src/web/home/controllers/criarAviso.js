const supabase = require('../../../configs/supabase');

exports.criarAviso = async (req, res) => {
  const { avisoParaSalvar, instituicao } = req.body;

  try {
    // Validação básica dos campos obrigatórios
    if (!avisoParaSalvar.titulo || !avisoParaSalvar.conteudo || !avisoParaSalvar.author || !instituicao) {
      return res.status(400).json({ mensagem: 'Título, conteúdo, autor e instituição são campos obrigatórios.' });
    }

    // Preparando os dados para inserção
    const novoAviso = {
      titulo: avisoParaSalvar.titulo,
      conteudo: avisoParaSalvar.conteudo,
      author: avisoParaSalvar.author,
      exclusivo: avisoParaSalvar.exclusivo !== undefined ? avisoParaSalvar.exclusivo : false, // Valor padrão false
      instituicao: instituicao,
      cor: avisoParaSalvar.cor || 'primary', // Adicionando a cor com um valor padrão 'primary'
    };

    // Se 'exclusivo' for true, adicionar 'serie', 'series' e 'turma'
    if (avisoParaSalvar.exclusivo) {
      const serieParaSalvar = avisoParaSalvar.series && avisoParaSalvar.series.length > 0
        ? avisoParaSalvar.series.join(', ')  // Concatena múltiplas séries em uma string separada por vírgulas
        : avisoParaSalvar.serie || null;

      novoAviso.series = serieParaSalvar;
      novoAviso.turma = avisoParaSalvar.turma || null;
    }

    // Inserindo no banco de dados
    const { data, error } = await supabase
      .from('avisos')
      .insert([novoAviso])
      .select();

    if (error) {
      console.error('Erro ao inserir aviso no banco de dados:', error);
      return res.status(500).json({ mensagem: 'Erro ao salvar aviso no banco de dados. Por favor, tente novamente.' });
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    console.error('Erro inesperado ao salvar aviso:', error);
    return res.status(500).json({ mensagem: 'Ocorreu um erro inesperado ao salvar o aviso. Por favor, tente novamente mais tarde.' });
  }
};
