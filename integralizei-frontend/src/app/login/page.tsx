"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const [mensagem, setMensagem] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem("");

    if (!formData.email || !formData.senha) {
      setMensagem("Preencha todos os campos!");
      return;
    }

    try {
      setMensagem("Entrando...");
      // Conecta na porta 3001 (Backend de Login)
      const BACKEND_URL = "http://localhost:3001";
      const API_ROUTE = "/api/login";

      const res = await fetch(`${BACKEND_URL}${API_ROUTE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensagem(data.message || "E-mail ou senha inválidos.");
        return;
      }

      // --- AQUI ESTÁ A CORREÇÃO ---
      // Salvamos um sinal de que o usuário está logado
      localStorage.setItem("user_session", JSON.stringify({ 
        name: data.name, 
        email: formData.email,
        loggedAt: new Date().toISOString() 
      }));
      
      // Força um evento para a Navbar atualizar na hora (se estiver na mesma janela)
      window.dispatchEvent(new Event("storage"));
      // ----------------------------

      setMensagem("Login efetuado com sucesso! Redirecionando...");
      
      setTimeout(() => {
        router.push("/dados"); // Redireciona para os dados
      }, 1000);

    } catch (error) {
      console.error("Erro de conexão:", error);
      setMensagem("Não foi possível conectar ao servidor. O backend de login (3001) está rodando?");
    }
  };

  const handleGoogleLogin = () => {
    setMensagem("Redirecionando para o Google...");
    // A rota do Google também precisa setar o cookie/session, 
    // mas o redirecionamento acontece no backend.
    window.location.href = "http://localhost:3001/auth/google";
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

        <div className={styles.googleContainer}>
          <button onClick={handleGoogleLogin} className={styles.googleButton}>
            <Image
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google logo"
              width={24}
              height={24}
            />
            Entrar com Google
          </button>
        </div>

        {mensagem && <p className={styles.mensagem}>{mensagem}</p>}

        <p className={styles.linkCadastro}>
          Não tem uma conta? <a href="/cadastro">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}