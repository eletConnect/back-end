const supabase = require('../../../configs/supabase');

exports.verificarDados = async (request, response) => {
    const { dados, instituicao } = request.body;

    try {
        // Verificar se os dados estão presentes e se são um array
        if (!Array.isArray(dados) || dados.length === 0) {
            return response.status(400).json({ mensagem: 'Dados inválidos ou vazios.' });
        }

        if (!instituicao) {
            return response.status(400).json({ mensagem: 'Instituição não informada.' });
        }

        const matriculasRecebidas = dados.map((aluno) => aluno.matricula);

        let alunosExistentes = [];
        let pagina = 0;
        const limite = 1000;
        let buscarMais = true;

        while (buscarMais) {
            const { data, error } = await supabase
                .from('alunos')
                .select('matricula')
                .in('matricula', matriculasRecebidas)
                .eq('instituicao', instituicao)
                .range(pagina * limite, (pagina + 1) * limite - 1);

            if (error) {
                return response.status(500).json({ mensagem: `Erro ao consultar banco de dados: ${error.message}` });
            }

            if (!Array.isArray(data)) {
                return response.status(500).json({ mensagem: 'Os dados retornados do Supabase não estão no formato esperado.' });
            }

            if (data.length === 0 || data.length < limite) {
                buscarMais = false; 
            }

            alunosExistentes = alunosExistentes.concat(data);
            pagina++; 
        }

        const matriculasExistentes = alunosExistentes.map((aluno) => aluno.matricula);
        const erros = {};


        dados.forEach((row, index) => {
            const matricula = row['matricula']?.toString().trim();
            if (matriculasExistentes.includes(matricula)) {
                erros[index] = { matricula: `Matrícula "${matricula}" já está registrada na instituição.` };
            }

            const serie = row['serie']?.toString().trim();
            if (!['1º ano', '2º ano', '3º ano'].includes(serie)) {
                erros[index] = {
                    ...erros[index],
                    serie: `Série "${serie}" é inválida. Deve ser '1º ano', '2º ano' ou '3º ano'.`,
                };
            }
        });

        if (Object.keys(erros).length > 0) {
            return response.status(200).json({ erros }); 
        }

        return response.status(200).json({ erros: {} }); 
    } catch (error) {
        return response.status(500).json({ mensagem: `Erro ao verificar dados: ${error.message}` });
    }
};
