const Mailjet = require('node-mailjet');
const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');
const { createToken } = require('../services/tokenService');

const mailjetClient = Mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);

exports.register = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios. Por favor, preencha nome, e-mail e senha.' });
    }

    try {
        const { data: existingUsers, error: checkError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email);

        if (checkError) {
            return res.status(500).json({ mensagem: 'Ocorreu um erro ao processar o cadastro. Tente novamente mais tarde.' });
        }

        if (existingUsers && existingUsers.length > 0) {
            return res.status(400).json({ mensagem: 'O e-mail informado já está em uso. Por favor, use outro e-mail.' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const token = createToken();
        const matricula = createToken();

        const confirmationLink = `${process.env.FRONTEND_URL}/confirm-registration?tkn=${token}`;
        const emailSubject = 'eletConnect - Confirmação de Cadastro';
        const emailHtml = `
            <p>Olá, ${nome}!</p>
            <p>Para ativar sua conta, clique no link abaixo:</p>
            <a href="${confirmationLink}" target="_blank">Ativar Conta</a>
            <p>Se você não realizou este cadastro, ignore esta mensagem.</p>
            <p>Atenciosamente,<br>Equipe eletConnect</p>
        `;

        try {
            await mailjetClient.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: 'eletivaconnect@gmail.com',
                            Name: 'eletConnect',
                        },
                        To: [
                            {
                                Email: email,
                                Name: nome,
                            },
                        ],
                        Subject: emailSubject,
                        HTMLPart: emailHtml,
                    },
                ],
            });

            const { data: newUser, error: insertError } = await supabase
                .from('usuarios')
                .insert([{
                    nome,
                    email,
                    senha: hashedPassword,
                    status: 'Aguardando',
                    token,
                    matricula,
                    confirmed_at: null,
                    fazerLogin: true,
                    cargo: 'First',
                }]);

            if (insertError) {
                return res.status(500).json({ mensagem: 'Erro ao concluir o cadastro. Tente novamente mais tarde.' });
            }

            return res.status(201).json({ mensagem: 'Cadastro realizado com sucesso! Um e-mail de confirmação foi enviado para você.' });

        } catch (emailError) {
            return res.status(500).json({ mensagem: 'Não foi possível enviar o e-mail de confirmação. Por favor, tente novamente mais tarde.' });
        }

    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' });
    }
};
