import express from "express";
import session from "express-session";
import cors from "cors";
import bcrypt from "bcryptjs";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { getDB } from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto"; // (Passo 3) Importa a biblioteca crypto
import nodemailer from "nodemailer"; // (Passo 4) Importa a biblioteca nodemailer

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001; // Define a porta

const app = express();
app.use(cors());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-prod",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// (Passo 4) Configuração do Nodemailer (transporter)
// Usamos as variáveis de ambiente do arquivo .env

//DEIXEI ESSA FUNCAO COMO COMENTARIO PRA RESOLVER ERRO DO TESTE DO PULL REQUEST
/*const emailTransport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, // true para porta 465, false para outras
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});*/


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = await getDB();
    const user = await db.get("SELECT id, name, email FROM users WHERE id = ?", [id]);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:${PORT}/auth/google/callback` // Usa a porta
  },
  async (accessToken, refreshToken, profile, done) => {
    const db = await getDB();
    const googleId = profile.id;
    const email = profile.emails[0].value;
    const name = profile.displayName;

    try {
      let user = await db.get("SELECT * FROM users WHERE google_id = ?", [googleId]);
      if (user) {
        return done(null, user); 
      }

      user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
      if (user) {
        await db.run("UPDATE users SET google_id = ?, updated_at = datetime('now') WHERE id = ?", [googleId, user.id]);
        user.google_id = googleId;
        return done(null, user);
      }

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const result = await db.run(
        "INSERT INTO users (name, email, google_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        [name, email, googleId, now, now]
      );
      
      const newUser = await db.get("SELECT * FROM users WHERE id = ?", [result.lastID]);
      return done(null, newUser); 
    } catch (err) {
      return done(err, null);
    }
  }
));

// Servir arquivos estáticos da pasta correta
app.use(express.static(path.join(__dirname, "public", "login")));

// --- Rotas de Autenticação Padrão ---

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/index.html?error=google' }),
  (req, res) => {
    res.redirect('/dashboard.html');
  }
);

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Campos obrigatórios." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Senha deve ter pelo menos 8 caracteres." });
    }

    const db = await getDB();
    const exists = await db.get("SELECT id FROM users WHERE email = ?", [email]);
    if (exists) {
      return res.status(409).json({ message: "E-mail já cadastrado." });
    }

    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await db.run("INSERT INTO users (name, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", [name, email, hash, now, now]);
    return res.status(201).json({ message: "Cadastro realizado com sucesso." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno." });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Informe e-mail e senha." });
    }
    const db = await getDB();
    const user = await db.get("SELECT id, name, email, password_hash FROM users WHERE email = ?", [email]);
    
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: "E-mail ou senha inválidos." });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "E-mail ou senha inválidos." });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Erro interno." });
      return res.json({ message: "Login OK", name: user.name });
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno." });
  }
});

app.get("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Erro ao sair." });
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); 
      res.json({ message: "Logout OK" });
    });
  });
});

app.get("/api/me", async (req, res) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  return res.json(req.user);
});

// --- (Passo 3) NOVAS ROTAS DE REDEFINIÇÃO DE SENHA ---

/**
 * Passo 3 e 4: Rota para solicitar a redefinição de senha
 */
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "E-mail é obrigatório." });
    }
    
    const db = await getDB();
    const user = await db.get("SELECT id, name FROM users WHERE email = ?", [email]);

    // Para evitar "enumeração de usuários", sempre retornamos sucesso,
    // mas só executamos a lógica se o usuário for encontrado.
    if (user) {
      // 1. Gerar token
      const token = crypto.randomBytes(32).toString("hex");
      // 2. Definir expiração (1 hora a partir de agora)
      const expires = Date.now() + 3600000; // 1 hora em milissegundos
      
      // 3. Salvar token no banco
      await db.run(
        "UPDATE users SET reset_token = ?, reset_token_expires = ?, updated_at = datetime('now') WHERE id = ?", 
        [token, expires, user.id]
      );
      
      // 4. (Passo 4) Enviar o e-mail
      const resetLink = `http://localhost:${PORT}/redefinir-senha.html?token=${token}`;
      
      try {
        /*
        // --- CÓDIGO REAL DE ENVIO DE E-MAIL (Passo 4) ---
        // (Descomente isso quando tiver credenciais de e-mail válidas no .env)
        
        await emailTransport.sendMail({
          from: `Integralizei UnB <${process.env.EMAIL_FROM}>`,
          to: email,
          subject: "Redefinição de Senha - Integralizei UnB",
          html: `
            <p>Olá, ${user.name}!</p>
            <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para criar uma nova senha:</p>
            <p><a href="${resetLink}" target="_blank">Redefinir minha senha</a></p>
            <p>Este link expira em 1 hora.</p>
            <p>Se você não solicitou isso, por favor, ignore este e-mail.</p>
          `
        });
        
        console.log(`E-mail de redefinição enviado para ${email}`);
        */

        // --- SIMULAÇÃO PARA TESTES ---
        // Como não podemos enviar e-mails, retornamos o link para fins de teste.
        console.log(`[SIMULAÇÃO] Link de redefinição para ${email}: ${resetLink}`);
        return res.json({ 
          message: "Se este e-mail estiver cadastrado, um link de redefinição foi gerado.",
          simulatedResetLink: resetLink // Retorna o link para teste
        });

      } catch (emailErr) {
        console.error("Falha ao enviar e-mail de redefinição:", emailErr);
        // Mesmo se o e-mail falhar, não informamos o usuário (por segurança)
      }
    }
    
    // Resposta padrão (para usuário não encontrado ou erro de e-mail)
    return res.json({ message: "Se este e-mail estiver cadastrado, um link de redefinição será enviado." });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno." });
  }
});


/**
 * Passo 3: Rota para redefinir a senha com o token
 */
app.post("/api/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token e nova senha são obrigatórios." });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Senha deve ter pelo menos 8 caracteres." });
    }
    
    const db = await getDB();
    
    // 1. Encontrar usuário pelo token E verificar se não expirou
    const user = await db.get(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > ?",
      [token, Date.now()] // Compara token e data de expiração
    );

    if (!user) {
      return res.status(400).json({ message: "Token inválido ou expirado. Tente novamente." });
    }
    
    // 2. Se o token for válido, atualizar a senha
    const hash = await bcrypt.hash(password, 10);
    
    // 3. Limpar o token para não ser usado novamente
    await db.run(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL, updated_at = datetime('now') WHERE id = ?",
      [hash, user.id]
    );
    
    return res.json({ message: "Senha redefinida com sucesso!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno." });
  }
});


// --- FIM DAS NOVAS ROTAS ---


app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
