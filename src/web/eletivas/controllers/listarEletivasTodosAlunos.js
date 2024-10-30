const supabase = require('../../../configs/supabase');

exports.listarEletivasTodosAlunos = async (req, res) => {
  const { instituicao } = req.body;

  if (!instituicao) {
    return res.status(400).json({ mensagem: 'Instituição não informada.' });
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
        console.log('Erro ao buscar alunos:', alunosError.message);
        buscarMaisAlunos = false;
        break;
      }

      if (alunosData.length === 0 || alunosData.length < limite) {
        buscarMaisAlunos = false;
      }

      alunos = alunos.concat(alunosData);
      pagina++;
    }

    if (alunos.length === 0) {
      return res.status(404).json({ mensagem: 'Nenhum aluno encontrado para a instituição informada.' });
    }

    // Buscar todas as eletivas associadas aos alunos
    let alunoEletivas = [];
    pagina = 0;
    let buscarMaisEletivas = true;

    while (buscarMaisEletivas) {
      const { data: eletivasData, error: eletivasError } = await supabase
        .from('aluno_eletiva')
        .select('matricula_aluno, codigo_eletiva')
        .eq('instituicao', instituicao)
        .range(pagina * limite, (pagina + 1) * limite - 1);

      if (eletivasError) {
        return res.status(500).json({ mensagem: 'Erro ao buscar eletivas dos alunos.', detalhe: eletivasError.message });
      }

      if (eletivasData.length === 0 || eletivasData.length < limite) {
        buscarMaisEletivas = false;
      }
      alunoEletivas = alunoEletivas.concat(eletivasData);
      pagina++;
    }

    // Verificar se existem eletivas para processar
    if (alunoEletivas.length === 0) {
      return res.status(200).json(alunos.map(aluno => ({ ...aluno, eletivas: [] })));
    }

    // Coletar os códigos de eletivas únicos
    const codigosEletivas = [...new Set(alunoEletivas.map(item => item.codigo_eletiva))];

    const { data: eletivas, error: detalhesEletivasError } = await supabase
      .from('eletivas')
      .select('*')
      .in('codigo', codigosEletivas);

    if (detalhesEletivasError) {
      return res.status(500).json({ mensagem: 'Erro ao buscar detalhes das eletivas.', detalhe: detalhesEletivasError.message });
    }

    // Organizar as eletivas por aluno
    const eletivasPorAluno = alunoEletivas.reduce((acc, { matricula_aluno, codigo_eletiva }) => {
      const eletiva = eletivas.find(e => e.codigo === codigo_eletiva);
      if (eletiva) {
        acc[matricula_aluno] = acc[matricula_aluno] || [];
        acc[matricula_aluno].push(eletiva);
      }
      return acc;
    }, {});

    // Mesclar as informações de alunos com suas respectivas eletivas
    const alunosComEletivas = alunos.map(aluno => ({
      ...aluno,
      eletivas: eletivasPorAluno[aluno.matricula] || []  // Se o aluno não tem eletiva, retorna uma lista vazia
    }));

    return res.status(200).json(alunosComEletivas);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar alunos com eletivas.', detalhe: error.message });
  }
};
