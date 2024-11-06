require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const supabase = require('./src/configs/supabase');

const app = express();

// Configuração para confiar no proxy mais próximo
app.set('trust proxy', 1);

// Configuração de CORS com suporte a credenciais para o frontend
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));

// Limitação de taxa de requisições por IP para evitar abusos
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // Limite de 1000 requisições por IP
    standardHeaders: true,
    legacyHeaders: false,
}));

// Configurações de segurança usando Helmet
app.use(helmet());

// Configuração para parsing de JSON e URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Funções auxiliares para manipulação de sessões no Supabase
const saveSession = async (sessionId, sessionData, maxAge = 24 * 60 * 60 * 1000) => {
    const expiresAt = new Date(Date.now() + maxAge).toISOString();
    const { error } = await supabase
        .from('sessions')
        .upsert({
            id: sessionId,
            session_data: sessionData,
            expires_at: expiresAt
        });
    if (error) {
        console.error(`Erro ao salvar a sessão: ${error.message}`);
        throw error;
    }
    return sessionId;
};

const getSession = async (sessionId) => {
    const { data, error } = await supabase
        .from('sessions')
        .select('session_data')
        .eq('id', sessionId)
        .single();
    if (error && error.code !== 'PGRST116') {
        console.error(`Erro ao buscar a sessão: ${error.message}`);
        return null;
    }
    return data ? data.session_data : null;
};

const deleteSession = async (sessionId) => {
    const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);
    if (error) {
        console.error(`Erro ao remover a sessão: ${error.message}`);
        throw error;
    }
};

// Store personalizada para sessões usando Supabase
class SupabaseSessionStore extends session.Store {
    async get(sid, callback) {
        try {
            const sessionData = await getSession(sid);
            callback(null, sessionData);
        } catch (error) {
            callback(error);
        }
    }

    async set(sid, sessionData, callback) {
        try {
            await saveSession(sid, sessionData);
            callback(null);
        } catch (error) {
            callback(error);
        }
    }

    async destroy(sid, callback) {
        try {
            await deleteSession(sid);
            callback(null);
        } catch (error) {
            callback(error);
        }
    }
}

// Configuração do `express-session` com a Store personalizada
app.use(session({
    store: new SupabaseSessionStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
    }
}));

// Rota de status para verificar o funcionamento do servidor
app.get('/status', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Servidor está funcionando corretamente'
    });
});

// Rotas principais da API
app.use(require('./src/routes'));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({
        error: {
            message: 'Erro interno do servidor',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// Inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.info(`Servidor online na porta: ${PORT}`);
});
