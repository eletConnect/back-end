const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');
const { createToken } = require('../../auth/services/tokenService');
const { Resend } = require('resend');
const crypto = require('crypto');

const resend = new Resend(process.env.RESEND_API_KEY); // Sua chave API do Resend

function gerarSenhaAleatoria() {
    return crypto.randomBytes(8).toString('hex'); 
}

exports.cadastrarColaborador = async (request, response) => {
    const { nome, email, matricula, cargo, instituicao, fazerLogin } = request.body;

    try {
        // Verifica se o e-mail já está registrado
        const { data: verificarEmail, error: verificarEmailError } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email)
            .eq('instituicao', instituicao);

        if (verificarEmail && verificarEmail.length > 0) {
            return response.status(401).json({ mensagem: 'Este e-mail já está registrado.' });
        }

        if (verificarEmailError) {
            return response.status(500).json({ mensagem: 'Erro ao verificar o e-mail fornecido.' });
        }

        // Verifica se a matrícula já está registrada
        const { data: verificarMatricula, error: verificarMatriculaError } = await supabase
            .from('usuarios')
            .select('matricula')
            .eq('matricula', matricula)
            .eq('instituicao', instituicao);

        if (verificarMatricula && verificarMatricula.length > 0) {
            return response.status(401).json({ mensagem: 'Esta matrícula já está registrada.' });
        }

        if (verificarMatriculaError) {
            return response.status(500).json({ mensagem: 'Erro ao verificar a matrícula fornecida.' });
        }

        // Gera a senha aleatória e criptografa
        const senhaGerada = gerarSenhaAleatoria();
        const senhaCriptografada = await bcrypt.hash(senhaGerada, 10);

        // Gera o token de ativação
        const token = createToken();
        if (!token) {
            return response.status(500).json({ mensagem: 'Erro ao gerar o token.' });
        }

        // Insere o novo colaborador no banco de dados
        const { error: insertError } = await supabase
            .from('usuarios')
            .insert([{ nome, email, matricula, senha: senhaCriptografada, cargo, instituicao, token, status: 'Aguardando', fazerLogin }]);

        if (insertError) {
            return response.status(500).json({ mensagem: 'Erro ao salvar os dados do colaborador.' });
        }

        // Conteúdo do e-mail com as credenciais e o link de ativação
        const emailSubject = 'Colaboradores - Ative sua conta';
        const emailHtml = `
            <p>Olá ${nome},</p>
            <p>Sua conta foi criada com sucesso!</p>
            <p>Aqui estão suas credenciais de acesso:</p>
            <ul>
                <li>Usuário: ${email}</li>
                <li>Senha: ${senhaGerada}</li>
            </ul>
            <p>Para ativar sua conta, clique no link abaixo:</p>
            <a href="http://localhost:5173/confirm-registration?tkn=${token}">Ativar Conta</a>
            <p>Após ativar a conta, você poderá fazer login no sistema.</p>
        `;

        // Envia o e-mail de ativação usando o Resend
        try {
            await resend.emails.send({
                from: '"eletConnect" <autentication@resend.dev>', // Altere para o e-mail de remetente desejado
                to: [email],
                subject: emailSubject,
                html: emailHtml
            });

            console.log('E-mail de ativação enviado com sucesso.');
            return response.status(200).json({ mensagem: 'Colaborador cadastrado com sucesso! Verifique seu e-mail para ativar a conta.' });
        } catch (emailError) {
            console.error('Erro ao enviar e-mail:', emailError);
            return response.status(500).json({ mensagem: 'Erro ao enviar o e-mail de ativação.', detalhe: emailError.message });
        }

    } catch (error) {
        console.error('Erro ao cadastrar colaborador:', error);
        return response.status(500).json({ mensagem: 'Erro ao tentar cadastrar o colaborador.' });
    }
};
