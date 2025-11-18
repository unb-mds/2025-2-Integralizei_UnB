"use client";
import { useState } from "react";
import styles from "./Cadastro.module.css";

export default function CadastroPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [mensagem, setMensagem] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
 //TROQUEI A FUNÇAO HANDLESUBMIT PARA CONECTAR COM O BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem(""); 

    
    if (
      !formData.nome ||
      !formData.email ||
      !formData.senha ||
      !formData.confirmarSenha
    ) {
      setMensagem("Preencha todos os campos!");
      return;
    }
    
    if (formData.senha.length < 8) {
      setMensagem("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (formData.senha !== formData.confirmarSenha) {
      setMensagem("As senhas não coincidem!");
      return;
    }

   
    try {
      setMensagem("Cadastrando..."); 
      
      const BACKEND_URL = "http://localhost:3001";
      
      const API_ROUTE = "/api/register"; 

      const res = await fetch(BACKEND_URL + API_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.nome,
          email: formData.email,
          password: formData.senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        
        setMensagem(data.message || "Não foi possível cadastrar.");
        return;
      }
      
      setMensagem("Cadastro realizado com sucesso! Redirecionando para o login...");
      
      setFormData({ nome: "", email: "", senha: "", confirmarSenha: "" });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

    } catch (error) {
      console.error("Erro de conexão:", error);
      setMensagem("Não foi possível conectar ao servidor. O backend está rodando?");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Crie sua conta</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="nome"
            placeholder="Nome completo"
            value={formData.nome}
            onChange={handleChange}
            required
            className={styles.input}
          />

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

          <input
            type="password"
            name="confirmarSenha"
            placeholder="Confirmar senha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            Cadastrar
          </button>
        </form>

        {mensagem && <p className={styles.mensagem}>{mensagem}</p>}

        <p className={styles.linkLogin}>
          Já tem uma conta? <a href="/login">Entrar</a>
        </p>
      </div>
    </div>
  );
}
