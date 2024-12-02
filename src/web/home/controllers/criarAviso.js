const supabase = require('../../../configs/supabase');

exports.criarAviso = async (req, res) => {
  const { avisoParaSalvar, instituicao } = req.body;

  try {
    if (!avisoParaSalvar.titulo || !avisoParaSalvar.conteudo || !avisoParaSalvar.author || !instituicao) {
      return res.status(400).json({
        mensagem: 'Por favor, preencha todos os campos obrigatórios: título, conteúdo, autor e instituição.',
      });
    }

    const novoAviso = {
      titulo: avisoParaSalvar.titulo,
      conteudo: avisoParaSalvar.conteudo,
      author: avisoParaSalvar.author,
      instituicao,
      exclusivo: avisoParaSalvar.exclusivo ?? false,
      cor: avisoParaSalvar.cor || 'primary',
      series: null,
      serie: null,
      turma: null,
    };

    if (avisoParaSalvar.exclusivo) {
      if (avisoParaSalvar.exclusividade === 'serie') {
        novoAviso.series = avisoParaSalvar.series?.length
          ? avisoParaSalvar.series.join(', ') 
          : null;
      } else if (avisoParaSalvar.exclusividade === 'turma') {
        novoAviso.serie = avisoParaSalvar.serie || null;
        novoAviso.turma = avisoParaSalvar.turma || null;
      }
    }

    console.log('Inserindo aviso:', novoAviso);

    const { data, error } = await supabase.from('avisos').insert([novoAviso]).select();

    if (error) {
      console.error('Erro ao inserir aviso:', error.message, error.details, error.hint);
      return res.status(500).json({
        mensagem: 'Houve um problema ao salvar o aviso. Por favor, tente novamente mais tarde.',
      });
    }

    return res.status(201).json(data[0]);
  } catch (error) {
    return res.status(500).json({
      mensagem: 'Ocorreu um erro inesperado ao tentar salvar o aviso. Por favor, tente novamente mais tarde.',
    });
  }
};
