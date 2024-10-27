const { Resend } = require('resend');
const supabase = require('../../../configs/supabase');

const resend = new Resend(process.env.RESEND_API_KEY);

exports.enviarEmail = async (request, response) => {
    const { from_name, from_email, message } = request.body;

    try {
        // Envio do email usando Resend
        await resend.emails.send({
            from: 'eletivaconnect@gmail.com',  // Substitua pelo email do remetente
            to: from_email,
            subject: 'Mensagem de Contato',
            html: `<p>Nome: ${from_name}</p><p>Email: ${from_email}</p><p>Mensagem: ${message}</p>`,
        });

        // Caso o envio de email seja bem-sucedido, retornar uma resposta de sucesso
        response.status(200).json({ message: 'Email enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        response.status(500).json({ message: 'Erro ao enviar email. Tente novamente mais tarde.' });
    }
};
