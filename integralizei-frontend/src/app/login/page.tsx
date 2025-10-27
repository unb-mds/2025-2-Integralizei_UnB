"use client";

import { useState } from "react";
import styles from "./login.module.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const [mensagem, setMensagem] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.email === "" || formData.senha === "") {
      setMensagem("Preencha todos os campos!");
      return;
    }

    console.log("Login realizado com:", formData);
    setMensagem("Login efetuado com sucesso!");
    setFormData({ email: "", senha: "" });
  };

  const handleGoogleLogin = () => {
    // Aqui você pode integrar o login com Google futuramente (ex: Firebase Auth)
    console.log("Login com Google clicado");
    setMensagem("Tentando login com Google...");
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Entre na sua conta</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <input
            type="password"
            name="senha"
            placeholder="Senha"
            value={formData.senha}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            Entrar
          </button>
        </form>

        <div className={styles.separator}>ou</div>

        <button onClick={handleGoogleLogin} className={styles.googleButton}>
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google logo"
          />
          Entrar com Google
        </button>

        {mensagem && <p className={styles.mensagem}>{mensagem}</p>}

        <p className={styles.linkCadastro}>
          Não tem uma conta? <a href="/cadastro">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}
