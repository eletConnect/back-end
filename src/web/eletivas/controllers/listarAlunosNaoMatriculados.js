const supabase = require('../../../configs/supabase');

exports.listarAlunosNaoMatriculados = async (req, res) => {
  const { instituicao, codigoEletiva } = req.body;

  if (!instituicao || !codigoEletiva) {
    return res.status(400).json({ mensagem: 'Instituição ou código da eletiva não informados.' });
  }

  try {
    let alunos = [];
    let pagina = 0;
    const limite = 1000;
    let buscarMaisAlunos = true;

    // Buscar todos os alunos da instituição em blocos de 1000
    while (buscarMaisAlunos) {
      const { data: alunosData, error: alunosError } = await supabase
        .from('alunos')
        .select('matricula, nome, serie, turma')
        .eq('instituicao', instituicao)
        .range(pagina * limite, (pagina + 1) * limite - 1);

      if (alunosError) {
        return res.status(500).json({ mensagem: 'Erro ao buscar alunos da instituição.', detalhe: alunosError.message });
      }

      if (alunosData.length === 0 || alunosData.length < limite) {
        buscarMaisAlunos = false;
      }

      alunos = alunos.concat(alunosData);
      pagina++;
    }

    // Buscar todos os alunos matriculados na eletiva
    const { data: alunosMatriculados, error: matriculadosError } = await supabase
      .from('aluno_eletiva')
      .select('matricula_aluno')
      .eq('codigo_eletiva', codigoEletiva)
      .eq('instituicao', instituicao);

    if (matriculadosError) {
      return res.status(500).json({ mensagem: 'Erro ao buscar alunos matriculados na eletiva.', detalhe: matriculadosError.message });
    }

    // Extrair as matrículas dos alunos que já estão matriculados na eletiva
    const matriculasMatriculados = alunosMatriculados.map(aluno => aluno.matricula_aluno);

    // Filtrar os alunos que não estão matriculados na eletiva
    const alunosNaoMatriculados = alunos.filter(aluno => !matriculasMatriculados.includes(aluno.matricula));

    // Caso não haja alunos disponíveis
    if (alunosNaoMatriculados.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(alunosNaoMatriculados);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar alunos não matriculados na eletiva.', detalhe: error.message });
  }
};
