const supabase = require('../../../configs/supabase');

exports.excluirAviso = async (req, res) => {
  const { id, instituicao } = req.body;

  try {
    // Exclui o aviso do banco de dados
    const { data, error } = await supabase
      .from('avisos')
      .delete() // Realiza a exclusão real
      .eq('id', id)
      .eq('instituicao', instituicao)
      .select();

    // Verificação de erro ao excluir
    if (error) {
      return res.status(500).json({ mensagem: 'Houve um problema ao excluir o aviso. Tente novamente mais tarde.' });
    }

    // Verifica se o aviso foi encontrado e excluído
    if (data.length === 0) {
      return res.status(404).json({ mensagem: 'Aviso não encontrado ou já excluído.' });
    }


    // Retorna uma resposta de sucesso
    return res.status(200).json({ mensagem: 'Aviso excluído com sucesso!', aviso: data[0] });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Ocorreu um erro inesperado ao excluir o aviso.' });
  }
};
