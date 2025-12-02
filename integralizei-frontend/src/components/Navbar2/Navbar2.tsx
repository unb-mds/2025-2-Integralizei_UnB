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

  // Função que verifica se existe algum dado de login (PDF ou Conta)
  const checkLoginStatus = () => {
    const dadosPDF = localStorage.getItem("dadosAluno");
    const dadosConta = localStorage.getItem("user_session");
    
    // Se tiver qualquer um dos dois, considera logado
    if (dadosPDF || dadosConta) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();

    // Adiciona um ouvinte para atualizar a Navbar automaticamente se o localStorage mudar
    window.addEventListener("storage", checkLoginStatus);
    
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 1. Limpa TODOS os dados locais
    localStorage.removeItem("dadosAluno");
    localStorage.removeItem("user_session");
    
    // 2. Chama a API de logout
    try {
      await fetch("http://localhost:3001/api/logout"); 
    } catch (error) {
      console.error("Erro logout:", error);
    }

    // 3. Atualiza estado e redireciona
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("storage")); // Avisa outros componentes
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

        <Link href="/pesquisa" className={`${styles.botao} ${styles.cor_da_UnB}`}>
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

        {/* --- LÓGICA DE TROCA DO BOTÃO ENTRAR/SAIR --- */}
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