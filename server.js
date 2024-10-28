require('dotenv').config();
const express = require('express');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3001;

const obterEnderecoIPLocal = () => {
  const interfaces = os.networkInterfaces();
  for (const nomeInterface of Object.keys(interfaces)) {
    for (const iface of interfaces[nomeInterface]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

const IPLocal = obterEnderecoIPLocal();

app.use(cors({
  origin: [`http://localhost:5173`, `http://${IPLocal}:5173`, `http://localhost:5174`, `http://${IPLocal}:5174`],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 10000 }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo-padrao',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
}));

const clientPath = path.join(__dirname, 'client', 'dist');
if (require('fs').existsSync(clientPath)) {
  app.use(express.static(clientPath));
  app.get('*', (req, res) => res.sendFile(path.join(clientPath, 'index.html')));
} else {
  console.warn("O diretório 'client/dist' não foi encontrado.");
}

app.get('/status', (req, res) => res.json({ status: 'OK', message: 'Servidor está funcionando corretamente' }));
app.use(require('./src/routes'));

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: { message: err.message, ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}) } });
});

app.listen(PORT, HOST, () => {
  console.warn(`Servidor rodando em http://${IPLocal}:${PORT} (ou http://localhost:${PORT})`);
});
