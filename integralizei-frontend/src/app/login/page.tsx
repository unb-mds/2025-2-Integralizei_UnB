<<<<<<< HEAD
"use client";

import { useState } from "react";
import styles from "./login.module.css";

export default function LoginPage() {
=======

"use client";

import { useState } from "react";
import Image from "next/image";
import styles from "./login.module.css";
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
  const [formData, setFormData] = useState({
    email: "",
    senha: "",
  });

  const [mensagem, setMensagem] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

<<<<<<< HEAD
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
=======
 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensagem(""); 
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86

    if (formData.email === "" || formData.senha === "") {
      setMensagem("Preencha todos os campos!");
      return;
    }

<<<<<<< HEAD
    console.log("Login realizado com:", formData);
    setMensagem("Login efetuado com sucesso!");
    setFormData({ email: "", senha: "" });
  };

  const handleGoogleLogin = () => {
    // Integrar o login com Google futuramente
=======
    try {
      setMensagem("Entrando..."); 

      const BACKEND_URL = "http://localhost:3001";
      const API_ROUTE = "/api/login";

      const res = await fetch(BACKEND_URL + API_ROUTE, {
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

      setMensagem("Login efetuado com sucesso! Redirecionando..."); 
      
      router.push('/'); 

    } catch (error) {
      console.error("Erro de conexão:", error);
      setMensagem("Não foi possível conectar ao servidor. O backend está rodando?");
    }
  };

  const handleGoogleLogin = () => {
    
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
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

<<<<<<< HEAD
        <div className={styles.googleContainer}>
        <button onClick={handleGoogleLogin} className={styles.googleButton}>
            <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google logo"
            />
            Entrar com Google
        </button>
        </div>


=======
        {/* Login com Google */}
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

>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
        {mensagem && <p className={styles.mensagem}>{mensagem}</p>}

        <p className={styles.linkCadastro}>
          Não tem uma conta? <a href="/cadastro">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
