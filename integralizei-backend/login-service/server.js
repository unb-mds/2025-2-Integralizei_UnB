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
import rateLimit from "express-rate-limit"; 

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3001; 

const app = express();

app.set('trust proxy', 1);


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.use(cors({
  origin: "http://localhost:3000", 
  credentials: true, 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  standardHeaders: true, 
  legacyHeaders: false,
  message: { message: "Muitas tentativas. Tente novamente em 15 minutos." }
});

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Muitas requisições."
});
app.use("/api/", globalLimiter);

app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-prod",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    maxAge: 1000 * 60 * 60 * 24 
  }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const db = await getDB();
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
      let res = await db.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
      let user = res.rows[0];

      if (user) {
        return done(null, user); 
      }

      res = await db.query("SELECT * FROM users WHERE email = $1", [email]);
      user = res.rows[0];

      if (user) {
        await db.query("UPDATE users SET google_id = $1, updated_at = NOW() WHERE id = $2", [googleId, user.id]);
        user.google_id = googleId;
        return done(null, user);
      }

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

app.use(express.static(path.join(__dirname, "public", "login")));

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login?error=google' }),
  (req, res) => {
    // Redireciona para o front com sucesso
    res.redirect('http://localhost:3000/login?google_success=true');
  }
);

app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body; // REQUER app.use(express.json())
    if (
        typeof name !== 'string' || 
        typeof email !== 'string' || 
        typeof password !== 'string' ||
        !name || !email || !password
    ) {
      return res.status(400).json({ message: "Campos obrigatórios e devem ser texto." });
    }

    if (password.length < 8) return res.status(400).json({ message: "Senha curta." });

    const db = await getDB();
    const resExist = await db.query("SELECT id FROM users WHERE email = $1", [email]);
    if (resExist.rows.length > 0) return res.status(409).json({ message: "E-mail já cadastrado." });

    const hash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    await db.query("INSERT INTO users (name, email, password_hash, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)", [name, email, hash, now, now]);
    return res.status(201).json({ message: "Sucesso." });
  } catch (err) { console.error(err); return res.status(500).json({ message: "Erro interno." }); }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Informe dados." });
    const db = await getDB();
    const result = await db.query("SELECT id, name, email, password_hash FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    
    if (!user || !user.password_hash) return res.status(401).json({ message: "Inválido." });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Inválido." });

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: "Erro." });
      return res.json({ message: "Login OK", name: user.name });
    });

  } catch (err) { console.error(err); return res.status(500).json({ message: "Erro." }); }
});

app.get("/api/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Erro." });
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); 
      res.json({ message: "Logout OK" });
    });
  });
});

app.get("/api/me", async (req, res) => {
  if (!req.isAuthenticated() || !req.user) return res.status(401).json({ message: "Não autenticado" });
  return res.json(req.user);
});

app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "E-mail obrigatório." });
    const db = await getDB();
    const result = await db.query("SELECT id, name FROM users WHERE email = $1", [email]);
    const user = result.rows[0];
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = Date.now() + 3600000; 
      await db.query("UPDATE users SET reset_token = $1, reset_token_expires = $2, updated_at = NOW() WHERE id = $3", [token, expires, user.id]);
      
      const resetLink = `http://localhost:${PORT}/redefinir-senha.html?token=${token}`;
      console.log(`[SIMULAÇÃO] Link gerado: ${resetLink}`); 
      return res.json({ message: "Link gerado (simulação).", simulatedResetLink: resetLink });
    }
    return res.json({ message: "Se existe, enviamos." });
  } catch (err) { console.error(err); return res.status(500).json({ message: "Erro." }); }
});


app.post("/api/reset-password", resetPasswordLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) return res.status(400).json({ message: "Dados inválidos." });
    const db = await getDB();
    const result = await db.query("SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > $2", [token, Date.now()]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: "Token inválido." });
    const hash = await bcrypt.hash(password, 10);
    await db.query("UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL, updated_at = NOW() WHERE id = $2", [hash, user.id]);
    return res.json({ message: "Senha redefinida." });
  } catch (err) { console.error(err); return res.status(500).json({ message: "Erro interno." }); }
});


app.listen(PORT, '0.0.0.0', () => 
  console.log("Server running on http://0.0.0.0:" + PORT)
);