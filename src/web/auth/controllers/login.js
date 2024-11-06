const supabase = require('../../../configs/supabase');
const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({
                mensagem: 'As credenciais fornecidas estão incorretas. Por favor, verifique e tente novamente.'
            });
        }

        if (!user.fazerLogin) {
            return res.status(403).json({
                mensagem: 'Você não está autorizado a acessar este sistema. Entre em contato com o administrador para mais informações.'
            });
        }

        const senhaValida = await bcrypt.compare(senha, user.senha);
        if (!senhaValida) {
            return res.status(401).json({
                mensagem: 'As credenciais fornecidas estão incorretas. Por favor, verifique e tente novamente.'
            });
        }

        if (!user.confirmed_at) {
            return res.status(406).json({
                mensagem: 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada e confirme sua conta.'
            });
        }

        if (user.status === 'Aguardando') {
            return res.status(403).json({
                mensagem: 'Sua conta está aguardando confirmação. Verifique seu e-mail para ativá-la.'
            });
        }

        if (user.status === 'Inativo') {
            return res.status(403).json({
                mensagem: 'Sua conta está inativa. Entre em contato com o administrador para mais detalhes.'
            });
        }

        // Cria a sessão para o usuário
        req.session.user = {
            id: user.id,
            matricula: user.matricula,
            nome: user.nome,
            email,
            status: user.status,
            cargo: user.cargo,
            foto: user.foto,
            instituicao: user.instituicao
        };

        return res.status(200).json({
            mensagem: 'Login efetuado com sucesso! Bem-vindo de volta.'
        });

    } catch (error) {
        return res.status(500).json({
            mensagem: 'Ocorreu um erro inesperado ao tentar fazer login. Por favor, tente novamente mais tarde.'
        });
    }
};
