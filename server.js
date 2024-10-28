require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { Pool } = require('pg');
const pgSession = require('connect-pg-simple')(session);

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do Pool de Conexão com o Supabase
// Configuração do Pool de Conexão com o Supabase
const pgPool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false, // Ignora a verificação de certificados para evitar problemas de SSL
  }
});

// Configuração do CORS para aceitar solicitações do frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true, // Permite o envio de cookies e credenciais
}));

// Limites de taxa e configurações de segurança
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 }));

// Configuração de sessão usando PostgreSQL (Supabase) como armazenamento
app.use(session({
  store: new pgSession({
    pool: pgPool,                // Usa o pool de conexão com o Supabase
    tableName: 'session',        // Tabela onde as sessões serão armazenadas
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // True em produção para HTTPS
    httpOnly: true, 
    sameSite: 'None', // Necessário para cookies cross-origin
    maxAge: 24 * 60 * 60 * 1000 // Expira em 1 dia
  }
}));

// Rota de status
app.get('/status', (req, res) => res.json({ status: 'OK', message: 'Servidor está funcionando corretamente' }));

// Exemplo de rota para evitar múltiplas respostas
app.get('/exemplo', (req, res) => {
    try {
        if (someCondition) {
            return res.json({ message: 'Resposta 1' }); // Use return para evitar múltiplas respostas
        }
        res.json({ message: 'Resposta 2' });
    } catch (error) {
        console.error('Erro na rota /exemplo:', error);
        res.status(500).json({ error: 'Erro interno na rota' });
    }
});

// Rotas principais da API
app.use(require('./src/routes'));

// Middleware para tratar erros com menos detalhes em produção
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err); // Encaminha para o próximo manipulador de erros se já tiver enviado a resposta
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
