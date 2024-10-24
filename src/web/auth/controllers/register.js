const { Resend } = require('resend');
const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');
const { createToken } = require('../services/tokenService');

const resend = new Resend(process.env.RESEND_API_KEY); // Sua chave API do Resend

exports.register = async (request, response) => {
    const { nome, email, senha } = request.body;

    if (!nome || !email || !senha) {
        return response.status(400).json({ mensagem: 'Por favor, preencha todos os campos obrigatórios.' });
    }

    try {
        console.log(`Verificando se o e-mail já está registrado: ${email}`);

        const { data: existingUsers, error: checkError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email);

        if (checkError) {
            console.error('Erro ao verificar e-mail no banco de dados:', checkError);
            return response.status(500).json({ mensagem: 'Houve um erro ao processar seu cadastro. Por favor, tente novamente mais tarde.' });
        }

        if (existingUsers && existingUsers.length > 0) {
            return response.status(400).json({ mensagem: 'O endereço de e-mail fornecido já está em uso. Tente outro e-mail.' });
        }

        console.log('E-mail disponível, criando senha criptografada.');

        const hashedPassword = await bcrypt.hash(senha, 10);
        const token = createToken({ email });

        // URL de confirmação com o token
        const confirmationLink = `http://localhost:5173/confirm-registration?tkn=${token}`;
        const emailSubject = 'Autenticação - Confirmação de Cadastro';
        const emailHtml = `
          <p>Olá, ${nome}!</p>
          <p>Para ativar sua conta, por favor clique no link abaixo:</p>
          <a href="${confirmationLink}" target="_blank">Ativar Conta</a>
          <p>Se você não realizou este cadastro, desconsidere esta mensagem.</p>
          <p>Atenciosamente,<br>Equipe eletConnect</p>
        `;

        console.log('Enviando e-mail de confirmação.');

        try {
            await resend.emails.send({
                from: '"eletConnect" <autenticacao@resend.dev>', // Altere para o e-mail de remetente desejado
                to: email,
                subject: emailSubject,
                html: emailHtml
            });

            console.log('E-mail de confirmação enviado com sucesso.');

            console.log('Registrando novo usuário no banco de dados.');
            const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert([{
                    nome,
                    email,
                    senha: hashedPassword,
                    status: 'Aguardando',
                    token,
                    matricula: "", 
                    confirmed_at: null,
                    fazerLogin: true,
                    cargo: "First",
                }]);

            if (insertError) {
                console.error('Erro ao registrar o usuário no banco de dados:', insertError);
                return response.status(500).json({ mensagem: 'Houve um erro ao concluir o cadastro. Por favor, tente novamente mais tarde.' });
            }

            return response.status(201).json({ mensagem: 'Cadastro realizado com sucesso! Um e-mail de confirmação foi enviado para o endereço fornecido.' });

        } catch (emailError) {
            console.error('Erro ao enviar o e-mail de confirmação:', emailError);
            return response.status(500).json({ mensagem: 'Não foi possível enviar o e-mail de confirmação. Por favor, tente novamente mais tarde.' });
        }

    } catch (error) {
        console.error('Erro geral ao registrar usuário:', error);
        return response.status(500).json({ mensagem: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' });
    }
};
