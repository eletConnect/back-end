const supabase = require('../../../configs/supabase');

exports.excluirAviso = async (req, res) => {
  const { id, instituicao } = req.body;

  try {
    // Atualiza o campo 'deleted_at' com a data e hora atual para marcar a exclusão lógica
    const { data, error } = await supabase
      .from('avisos')
      .update({ deleted_at: new Date().toISOString() })  // Certifica-se de que está usando um formato de data padrão
      .eq('id', id)
      .eq('instituicao', instituicao)
      .select();

    if (error) {
      return res.status(500).json({ mensagem: error.message });
    }

    if (data.length === 0) {
      return res.status(404).json({ mensagem: 'Aviso não encontrado ou já excluído.' });
    }

    return res.status(200).json({ mensagem: 'Aviso excluído com sucesso!', aviso: data[0] });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao excluir aviso.' });
  }
};
