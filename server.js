require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const RedisStore = require('connect-redis')(session);
const { createClient } = require('redis');
const fs = require('fs');

const app = express();

const PORT = process.env.PORT || 3001;

// Configuração do Redis com URL do Render ou local
const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

// Configuração do CORS para aceitar solicitações do frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Configurações de segurança e limites de taxa
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 1000 })); // Limite reduzido para produção

// Configuração de sessão usando Redis como armazenamento
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // `secure: true` para HTTPS em produção
}));

// Verifica se o diretório estático existe antes de servir
const clientPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  app.get('*', (req, res) => res.sendFile(path.join(clientPath, 'index.html')));
} else {
  console.warn("O diretório 'client/dist' não foi encontrado. Certifique-se de que o build do frontend está disponível.");
}

// Rota de status para verificar funcionamento
app.get('/status', (req, res) => res.json({ status: 'OK', message: 'Servidor está funcionando corretamente' }));

// Rotas principais da API
app.use(require('./src/routes'));

// Middleware para tratar erros com menos detalhes em produção
app.use((err, req, res, next) => {
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
