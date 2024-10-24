const bcrypt = require('bcrypt');
const supabase = require('../../../configs/supabase');

exports.login = async (request, response) => {
    const { email, senha } = request.body;

    try {
        const { data: user, error: userERROR } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (userERROR) {
            return response.status(500).json({
                mensagem: 'Houve um problema ao tentar fazer login. Por favor, tente novamente mais tarde.'
            });
        }

        if (!user) {
            return response.status(401).json({
                mensagem: 'As credenciais fornecidas estão incorretas. Por favor, verifique e tente novamente.'
            });
        }

        if (!user.fazerLogin) {
            return response.status(403).json({
                mensagem: 'Você não está autorizado a acessar este sistema. Entre em contato com o administrador para mais informações.'
            });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return response.status(401).json({
                mensagem: 'As credenciais fornecidas estão incorretas. Por favor, verifique e tente novamente.'
            });
        }

        if (!user.confirmed_at) {
            return response.status(406).json({
                mensagem: 'Seu e-mail ainda não foi confirmado. Por favor, verifique sua caixa de entrada e confirme sua conta.'
            });
        }

        if (user.status === 'Aguardando') {
            return response.status(403).json({
                mensagem: 'Sua conta está aguardando confirmação. Verifique seu e-mail para ativar sua conta.'
            });
        }

        if (user.status === 'Inativo') {
            return response.status(403).json({
                mensagem: 'Sua conta está inativa. Entre em contato com o administrador para mais detalhes.'
            });
        }

        // Cria a sessão para o usuário
        request.session.user = {
            id: user.id,
            matricula: user.matricula,
            nome: user.nome,
            email,
            status: user.status,
            cargo: user.cargo,
            foto: user.foto,
            instituicao: user.instituicao
        };

        return response.status(200).json({
            mensagem: 'Login efetuado com sucesso! Bem-vindo de volta.'
        });

    } catch (error) {
        console.error('Erro ao tentar fazer login:', error);
        return response.status(500).json({
            mensagem: 'Ocorreu um erro inesperado ao tentar fazer login. Por favor, tente novamente mais tarde.'
        });
    }
};
