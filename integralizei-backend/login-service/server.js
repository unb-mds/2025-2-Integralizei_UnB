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
import crypto from "crypto"; 
//import nodemailer from "nodemailer"; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001; 

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

/* // Configuração do Nodemailer (mantida comentada conforme seu arquivo original)
const emailTransport = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT == 465, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
*/

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = await getDB();
    // POSTGRES: Usa $1 em vez de ? e db.query
    const res = await db.query("SELECT id, name, email FROM users WHERE id = $1", [id]);
    done(null, res.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:${PORT}/auth/google/callback` 
  },
  async (accessToken, refreshToken, profile, done) => {
    const db = await getDB();
    const googleId = profile.id;
    const email = profile.emails[0].value;
    const name = profile.displayName;

    try {
      // POSTGRES: Placeholder $1
      let res = await db.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
      let user = res.rows[0];

      if (user) {
        return done(null, user); 
      }

      // POSTGRES: Placeholder $1
      res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      user = res.rows[0];

      if (user) {
        // POSTGRES: datetime('now') vira NOW(), placeholders $1, $2
        await db.query("UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2", [googleId, user.id]);
        user.google_id = googleId;
        return done(null, user);
      }

      // POSTGRES: Inserção retornando os dados (RETURNING *)
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      res = await db.query(
        "INSERT INTO users (name, email, google_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [name, email, googleId, now, now]
      );
      
      const newUser = res.rows[0];
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
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=google' }),
  (req, res) => {
    res.redirect('http://localhost:3000/dados');
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
    // POSTGRES: Placeholder $1
    const resExist = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (resExist.rows.length > 0) {
      return res.status(409).json({ message: "E-mail já cadastrado." });
    }

    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // POSTGRES: Placeholders $1...$5
    await db.query(
      "INSERT INTO users (name, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)", 
      [name, email, hash, now, now]
    );
    
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
    // POSTGRES: Placeholder $1 e acesso a rows[0]
    const result = await db.query("SELECT id, name, email, password_hash FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    
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

// --- NOVAS ROTAS DE REDEFINIÇÃO DE SENHA (Atualizadas para Postgres) ---

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "E-mail é obrigatório." });
    }
    
    const db = await getDB();
    // POSTGRES: Placeholder $1
    const result = await db.query("SELECT id, name FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = Date.now() + 3600000; 
      
      // POSTGRES: NOW(), $1, $2, $3
      await db.query(
        "UPDATE users SET reset_token = $1, reset_token_expires = $2, updated_at = NOW() WHERE id = $3", 
        [token, expires, user.id]
      );
      
      const resetLink = `http://localhost:${PORT}/redefinir-senha.html?token=${token}`;
      
      // (Código de e-mail comentado mantido)
      console.log(`[SIMULAÇÃO] Link de redefinição para ${email}: ${resetLink}`);
      return res.json({ 
        message: "Se este e-mail estiver cadastrado, um link de redefinição foi gerado.",
        simulatedResetLink: resetLink 
      });
    }
    
    return res.json({ message: "Se este e-mail estiver cadastrado, um link de redefinição será enviado." });
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno." });
  }
});

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
    
    // POSTGRES: $1, $2
    const result = await db.query(
      "SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > $2",
      [token, Date.now()]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: "Token inválido ou expirado. Tente novamente." });
    }
    
    const hash = await bcrypt.hash(password, 10);
    
    // POSTGRES: $1, $2
    await db.query(
      "UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = $2",
      [hash, user.id]
    );
    
    return res.json({ message: "Senha redefinida com sucesso!" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erro interno." });
  }
});

app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));