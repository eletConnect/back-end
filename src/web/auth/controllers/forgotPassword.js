const Mailjet = require('node-mailjet');
const supabase = require('../../../configs/supabase');
const { createToken } = require('../services/tokenService');

const mailjetClient = Mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY);

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .single();

        if (userError || !user) {
            return res.status(404).json({ mensagem: 'O e-mail fornecido não está registrado em nosso sistema.' });
        }

        const token = createToken();
        if (!token) {
            return res.status(500).json({ mensagem: 'Falha ao gerar o token de redefinição. Por favor, tente novamente.' });
        }

        const { error: updateError } = await supabase
            .from('usuarios')
            .update({ token })
            .eq('id', user.id);

        if (updateError) {
            return res.status(500).json({ mensagem: 'Erro ao atualizar o token no sistema. Tente novamente mais tarde.' });
        }

        const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?tkn=${token}`;

        const emailSubject = 'eletConnect - Solicitação de Redefinição de Senha';
        const emailHtml = `
            <p>Prezado(a) usuário(a),</p>
            <p>Recebemos uma solicitação para redefinir sua senha. Para continuar, clique no link abaixo:</p>
            <a href="${resetPasswordLink}">Redefinir Senha</a>
            <p>Se você não fez essa solicitação, desconsidere este e-mail.</p>
            <p>Atenciosamente,<br>Equipe eletConnect</p>
        `;

        try {
            const emailRequest = mailjetClient.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: 'eletivaconnect@gmail.com',
                            Name: 'eletConnect',
                        },
                        To: [
                            {
                                Email: email,
                                Name: 'Usuário',
                            },
                        ],
                        Subject: emailSubject,
                        HTMLPart: emailHtml,
                    },
                ],
            });

            await emailRequest;
            return res.status(200).json({ mensagem: 'Um e-mail de redefinição de senha foi enviado. Verifique sua caixa de entrada.' });
        } catch (emailError) {
            return res.status(500).json({ mensagem: 'Não foi possível enviar o e-mail de redefinição. Por favor, tente novamente mais tarde.' });
        }

    } catch (error) {
        return res.status(500).json({ mensagem: 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.' });
    }
};
