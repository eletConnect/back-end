const supabase = require('../../../configs/supabase');
const Mailjet = require('node-mailjet');

// Configuração do Mailjet com as chaves de API
const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY,
    process.env.MAILJET_SECRET_KEY
);

exports.enviarEmail = async (request, response) => {
    const { from_name, from_email, message } = request.body;

    try {
        // Envio do email usando Mailjet
        const request = await mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: 'eletivaconnect@gmail.com', // Substitua pelo email do remetente
                            Name: 'Eletiva Connect'
                        },
                        To: [
                            {
                                Email: from_email,
                                Name: from_name
                            }
                        ],
                        Subject: 'Mensagem de Contato',
                        HTMLPart: `<p>Nome: ${from_name}</p><p>Email: ${from_email}</p><p>Mensagem: ${message}</p>`
                    }
                ]
            });

        // Caso o envio de email seja bem-sucedido, retornar uma resposta de sucesso
        console.log('Email enviado com sucesso:', request.body);
        response.status(200).json({ message: 'Email enviado com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        response.status(500).json({ message: 'Erro ao enviar email. Tente novamente mais tarde.' });
    }
};
