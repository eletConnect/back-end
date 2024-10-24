const { Resend } = require('resend');
const supabase = require('../../../configs/supabase');
const { createToken } = require('../services/tokenService');

const resend = new Resend(process.env.RESEND_API_KEY); // Sua chave API do Resend

exports.forgotPassword = async (request, response) => {
    const { email } = request.body;

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('id')
            .eq('email', email)
            .single();

        if (!user) {
            return response.status(404).json({ mensagem: 'E-mail não encontrado no sistema.' });
        }

        if (userERROR) {
            return response.status(500).json({ mensagem: 'Erro ao verificar o e-mail fornecido. Tente novamente mais tarde.' });
        }

        const token = createToken();
        if (!token) {
            return response.status(500).json({ mensagem: 'Erro ao gerar o token de recuperação de senha.' });
        }

        const { error: insertError } = await supabase
            .from('usuarios')
            .update({ token })
            .eq('id', user.id);

        if (insertError) {
            return response.status(500).json({ mensagem: 'Erro ao atualizar o token no sistema. Tente novamente mais tarde.' });
        }

        const resetPasswordLink = `http://localhost:5173/reset-password?tkn=${token}`;

        // Configura o conteúdo do e-mail
        const emailSubject = 'eletConnect - Redefinição de senha';
        const emailHtml = `
            <p>Olá,</p>
            <p>Recebemos uma solicitação para redefinir sua senha. Para continuar com o processo, clique no link abaixo:</p>
            <a href="${resetPasswordLink}">Redefinir minha senha</a>
            <p>Se você não solicitou essa alteração, por favor, ignore este e-mail.</p>
            <p>Atenciosamente,<br>A equipe do eletConnect</p>
        `;

        try {
            await resend.emails.send({
                from: '"eletConnect" <autenticacao@resend.dev>',
                to: [email],
                subject: emailSubject,
                html: emailHtml
            });

            return response.status(200).json({ mensagem: 'Um e-mail de redefinição de senha foi enviado para o seu endereço de e-mail.' });
        } catch (emailError) {
            console.error('Erro ao enviar e-mail:', emailError);
            return response.status(500).json({ mensagem: 'Erro ao enviar o e-mail de redefinição de senha. Tente novamente mais tarde.', detalhe: emailError.message });
        }

    } catch (error) {
        console.error('Erro ao processar a solicitação de redefinição de senha:', error);
        return response.status(500).json({ mensagem: 'Ocorreu um erro ao tentar processar sua solicitação de redefinição de senha. Tente novamente mais tarde.', detalhe: error.message });
    }
};
