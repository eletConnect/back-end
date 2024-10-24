const supabase = require('../../../configs/supabase');

exports.criarAviso = async (req, res) => {
  const { avisoParaSalvar, instituicao } = req.body;

  console.log('avisoParaSalvar', avisoParaSalvar);

  try {
    // Verifica se 'series' tem valores e une esses valores em uma string. Caso contrário, usa 'serie'
    const serieParaSalvar = avisoParaSalvar.series && avisoParaSalvar.series.length > 0 
      ? avisoParaSalvar.series.join(', ')  // Concatena múltiplas séries em uma string separada por vírgulas
      : avisoParaSalvar.serie || null;

    // Preparando os dados para inserção
    const novoAviso = {
      titulo: avisoParaSalvar.titulo,
      conteudo: avisoParaSalvar.conteudo,
      author: avisoParaSalvar.author,
      exclusivo: avisoParaSalvar.exclusivo,
      instituicao: instituicao,
      series: serieParaSalvar,  // Usar a série como uma string, concatenada se for múltiplas séries
      turma: avisoParaSalvar.turma || null,  // Definir turma se for passado
      cor: avisoParaSalvar.cor || 'primary',  // Adicionando a cor com um valor padrão 'primary'
    };

    // Inserindo no banco de dados
    const { data, error } = await supabase
      .from('avisos')
      .insert([novoAviso])
      .select();

    if (error) {
      return res.status(500).json({ mensagem: error.message });
    }

    return res.status(200).json(data[0]);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao salvar aviso.' });
  }
};
