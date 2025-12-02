"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./navbar2.module.css";
import { BarChart3, Calculator, Search, Info, LogIn, LogOut, Bot } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Função que verifica se existe SESSÃO DE USUÁRIO (Conta)
  const checkLoginStatus = () => {
    // CORREÇÃO: Não olhamos mais para 'dadosAluno' para definir se está logado na conta.
    // Olhamos apenas para 'user_session'.
    const dadosConta = localStorage.getItem("user_session");
    
    if (dadosConta) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();

    // Ouve mudanças no localStorage para atualizar o botão em tempo real
    window.addEventListener("storage", checkLoginStatus);
    
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 1. Limpa TODOS os dados locais ao sair
    localStorage.removeItem("dadosAluno");
    localStorage.removeItem("user_session");
    
    // 2. Chama a API de logout (opcional, mas boa prática)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/api/logout`); 
    } catch (error) {
      console.error("Erro logout:", error);
    }

    // 3. Atualiza estado visual e redireciona
    setIsLoggedIn(false);
    
    // Força atualização de outros componentes que ouvem o storage
    window.dispatchEvent(new Event("storage")); 
    
    router.push("/login");
  };

  return (
    <header className={styles.navbarContainer}>
      {/* Logo e nome */}
      <Link href="/" className={styles.logoContainer}>
        <Image
          src="/logo-unb.png"
          alt="Logo Integralizei UnB"
          width={40}
          height={40}
          className={styles.logoImage}
          priority
          unoptimized
        />
        <span className={styles.logoText}>Integralizei UnB</span>
      </Link>

      {/* Botões de navegação */}
      <nav className={styles.navLinks}>
        <Link href="/dados" className={`${styles.botao} ${styles.cor_da_UnB}`}>
          <BarChart3 size={18} />
          DADOS
        </Link>

        <Link
          href="/calculadora"
          className={`${styles.botao} ${styles.cor_da_UnB}`}
        >
          <Calculator size={18} />
          CALCULADORA
        </Link>

        <Link href="/pesquisa" className={`${styles.botao} ${styles.cor_da_UnB}`} prefetch={false}>
          <Search size={18} />
          PESQUISA
        </Link>

        {/* --- UNBOT --- */}
        <Link href="/unbot" className={`${styles.botao} ${styles.cor_da_UnB}`}>
          <Bot size={18} />
          UNBOT
        </Link>

        <Link href="/sobre" className={`${styles.botao} ${styles.cor_da_UnB}`}>
          <Info size={18} />
          SOBRE
        </Link>

        {/* --- BOTÃO DE LOGIN/LOGOUT --- */}
        {isLoggedIn ? (
          <button 
            onClick={handleLogout} 
            className={`${styles.botao} ${styles.cor_da_UnB}`}
            style={{ backgroundColor: "#dc2626", borderColor: "#dc2626" }} 
          >
            <LogOut size={18} />
            SAIR
          </button>
        ) : (
          <Link href="/login" className={`${styles.botao} ${styles.cor_da_UnB}`}>
            <LogIn size={18} />
            ENTRAR
          </Link>
        )}
      </nav>
    </header>
  );
}