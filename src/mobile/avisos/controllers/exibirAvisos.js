const supabase = require('../../../configs/supabase');

exports.exibirAvisos = async (req, res) => {
    const { instituicao, serie, turma } = req.body;

    try {
        let { data: avisos, error } = await supabase
            .from('avisos')
            .select('*')
            .eq('instituicao', instituicao)
            .is('deleted_at', null); 

        if (error) {
            return res.status(500).json({ mensagem: error.message });
        }

        const avisosFiltrados = avisos.filter((aviso) => {
            if (!aviso.exclusivo || aviso.exclusivo === 'false') {
                return true;
            }

            const avisoSeries = aviso.series ? aviso.series.split(',').map(s => s.trim()) : [];
            const matchSerie = avisoSeries.length > 0 ? avisoSeries.includes(serie) : false;
            const matchTurma = aviso.turma ? aviso.turma.trim() === turma.trim() : false;

            if (matchSerie && !aviso.turma) {
                return true;
            }

            if (matchTurma && !aviso.series) {
                return true;
            }

            return matchSerie && matchTurma;
        });

        return res.status(200).json({ avisos: avisosFiltrados });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao listar avisos.' });
    }
};
