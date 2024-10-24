const supabase = require('../../../configs/supabase');

exports.editarColaborador = async (request, response) => {
    const { matriculaAntiga, matricula, nome, cargo, email, status, foto, fazerLogin } = request.body;

    if (!matriculaAntiga || !nome || !cargo || !status) {
        return response.status(400).json({ mensagem: 'Dados inválidos' });
    }

    try {
        if (matricula !== matriculaAntiga) {
            const { data: matriculaExistente, error: errorVerificacao } = await supabase
                .from('usuarios')
                .select('matricula')
                .eq('matricula', matricula)
                .neq('matricula', matriculaAntiga)
                .single();

            if (errorVerificacao) { 
                return response.status(500).json({ mensagem: 'Erro ao verificar matrícula', detalhe: errorVerificacao.message });
            }

            if (matriculaExistente) {
                return response.status(400).json({ mensagem: 'A nova matrícula já está em uso por outro colaborador' });
            }
        }

        const { data: colaboradorData, error: colaboradorError } = await supabase
            .from('usuarios')
            .update({
                matricula,  
                nome,
                cargo,
                email,
                status,
                foto,
                fazerLogin 
            })
            .eq('matricula', matriculaAntiga);

        if (colaboradorError) {
            return response.status(500).json({ mensagem: 'Erro ao editar o colaborador', detalhe: colaboradorError.message });
        }

        return response.status(200).json({ colaboradorData, novaMatricula: matricula });
    } catch (error) {
        return response.status(500).json({ mensagem: 'Erro ao editar o colaborador', detalhe: error.message });
    }
};
