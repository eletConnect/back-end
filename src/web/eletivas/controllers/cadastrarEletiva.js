const { v4: uuidv4 } = require('uuid');
const supabase = require('../../../configs/supabase');

exports.cadastrarEletiva = async (request, response) => {
    const {
        instituicao,
        nome,
        tipo,
        dia,
        horario,
        professor,
        sala,
        totalAlunos,
        isExclusiva, 
        series, 
        serie, 
        turma, 
        status
    } = request.body;

    try {
        if (!instituicao || !nome || !tipo || !dia || !horario || !professor || !sala || !totalAlunos || !status) {
            return response.status(400).json({ mensagem: 'Todos os campos obrigatórios devem ser preenchidos.' });
        }

        if (isExclusiva) {
            if ((!series || series.length === 0) && (!serie || !turma)) {
                return response.status(400).json({ mensagem: 'Os dados de exclusividade devem ser fornecidos (séries ou série e turma).' });
            }
        }

        const codigo = uuidv4();

        const { data, error } = await supabase
            .from('eletivas')
            .insert([
                {
                    codigo,
                    instituicao,
                    nome,
                    tipo,
                    dia,
                    horario,
                    professor,
                    sala,
                    total_alunos: totalAlunos,
                    status,
                    exclusiva: isExclusiva,
                    series: isExclusiva && series ? series : null,
                    serie: isExclusiva && serie ? serie : null,
                    turma: isExclusiva && turma ? turma : null,
                }
            ]);

        if (error) {
            console.error('Erro ao inserir no banco de dados:', error);
            return response.status(500).json({ mensagem: 'Erro ao cadastrar a eletiva.', detalhes: error.message });
        }

        return response.status(201).json({ mensagem: 'Eletiva cadastrada com sucesso!', data });
    } catch (erro) {
        console.error('Erro no servidor:', erro);
        return response.status(500).json({ mensagem: 'Erro interno do servidor.', detalhes: erro.message });
    }
};
