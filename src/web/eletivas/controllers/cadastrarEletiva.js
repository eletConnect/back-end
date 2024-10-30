
exports.cadastrarEletiva = async (request, response) => {
    const cadastrarEletiva = async (e) => {
        e.preventDefault();
        setEnviando(true);
    
        // Verificar o estado antes de enviar
        console.log('Eletiva:', eletiva);
    
        try {
            const resposta = await axios.post('/eletivas/cadastrar', {
                instituicao: usuario.instituicao,
                nome: eletiva.nome,
                tipo: eletiva.tipo,
                dia: eletiva.dia,
                horario: eletiva.horario,
                professor: eletiva.professor,
                sala: eletiva.sala,
                total_alunos: eletiva.totalAlunos, // Altera o nome do campo para `total_alunos`
                exclusiva: eletiva.isExclusiva, // Altera o nome do campo para `exclusiva`
                serie: eletiva.isExclusiva ? eletiva.serie : null,
                turma: eletiva.isExclusiva ? eletiva.turma : null,
            });
    
            if (resposta.status === 201) {
                sessionStorage.setItem('mensagemSucesso', resposta.data.mensagem);
                window.location.reload();
            }
        } catch (erro) {
            console.error('Erro na requisição:', erro.response); // Log completo da resposta do backend
            showToast('danger', erro.response?.data.mensagem || 'Erro ao cadastrar a eletiva');
        } finally {
            setEnviando(false);
        }
    };
};
