require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração do cliente Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

// Configuração de sessão usando o Supabase como armazenamento
app.use(session({
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

// Configurações e funções da API usando o cliente Supabase

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

// Rotas principais da API usando o cliente Supabase diretamente nas operações de dados
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

// Exporta o cliente Supabase para uso em outras partes do projeto
module.exports = supabase;
