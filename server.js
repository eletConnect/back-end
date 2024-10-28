require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid'); // Importa a função para gerar UUIDs

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração para confiar apenas no primeiro proxy (o mais próximo)
app.set('trust proxy', 1);

// Configuração do cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do CORS para aceitar solicitações do frontend local e remoto
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true,
}));

// Limite de taxa de requisições (Rate Limiting) com configuração por IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: false
}));

// Configurações de segurança
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet());

// Funções para manipular sessões no Supabase com UUIDs
async function saveSession(sessionData, maxAge = 24 * 60 * 60 * 1000) {
    const sessionId = uuidv4(); // Gera um UUID para o ID da sessão
    const expiresAt = new Date(Date.now() + maxAge).toISOString();

    const { error } = await supabase
        .from('sessions')
        .insert({
            id: sessionId,               // Armazena o UUID como ID
            session_data: sessionData,
            expires_at: expiresAt
        });

    if (error) {
        console.error('Erro ao salvar a sessão:', error);
        throw error;
    }
    return sessionId; // Retorna o UUID para ser usado como ID da sessão
}

async function getSession(sessionId) {
    const { data, error } = await supabase
        .from('sessions')
        .select('session_data')
        .eq('id', sessionId) // Usa o UUID como ID da sessão
        .single();

    if (error || !data) {
        console.error('Erro ao buscar a sessão ou sessão não encontrada:', error);
        return null;
    }
    return data.session_data;
}

async function deleteSession(sessionId) {
    const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

    if (error) {
        console.error('Erro ao remover a sessão:', error);
        throw error;
    }
}

// Store personalizada para Supabase
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
            const sessionId = await saveSession(sessionData);
            callback(null, sessionId);
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

// Configuração do `express-session` usando a Store personalizada
app.use(session({
    store: new SupabaseSessionStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    genid: () => uuidv4(), // Gera UUIDs para cada nova sessão
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Rota de status
app.get('/status', (req, res) => res.json({ status: 'OK', message: 'Servidor está funcionando corretamente' }));

// Rotas principais da API
app.use(require('./src/routes'));

// Middleware para tratar erros com menos detalhes em produção
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({ 
        error: { 
            message: 'Erro interno do servidor', 
            ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}) 
        } 
    });
});

// Inicia o servidor na porta definida
app.listen(PORT, () => {
    console.warn(`Servidor rodando na porta ${PORT}`);
});
