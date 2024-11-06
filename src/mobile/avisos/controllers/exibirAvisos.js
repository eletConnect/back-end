const supabase = require('../../../configs/supabase');

exports.exibirAvisos = async (req, res) => {
    const { instituicao, serie, turma } = req.body;

    try {
        // Busca todos os avisos da instituição que não foram deletados
        let { data: avisos, error } = await supabase
            .from('avisos')
            .select('*')
            .eq('instituicao', instituicao)
            .is('deleted_at', null); // Exibe apenas avisos não deletados

        if (error) {
            return res.status(500).json({ mensagem: error.message });
        }

        // Filtragem adicional por série e turma
        const avisosFiltrados = avisos.filter((aviso) => {
            // Se o aviso não for exclusivo, exibe para todos
            if (!aviso.exclusivo || aviso.exclusivo === 'false') {
                return true;
            }

            // Verificação de série e turma
            const avisoSeries = aviso.series ? aviso.series.split(',').map(s => s.trim()) : [];
            const matchSerie = avisoSeries.length > 0 ? avisoSeries.includes(serie) : false;
            const matchTurma = aviso.turma ? aviso.turma.trim() === turma.trim() : false;

            // Se for exclusivo para série, exibe apenas para a série correspondente
            if (matchSerie && !aviso.turma) {
                return true;
            }

            // Se for exclusivo para turma, exibe apenas para a turma correspondente
            if (matchTurma && !aviso.series) {
                return true;
            }

            // Caso o aviso tenha tanto série quanto turma, ambos devem coincidir
            return matchSerie && matchTurma;
        });

        // Retorna os avisos filtrados como um array
        return res.status(200).json({ avisos: avisosFiltrados });
    } catch (error) {
        return res.status(500).json({ mensagem: 'Erro ao listar avisos.' });
    }
};
