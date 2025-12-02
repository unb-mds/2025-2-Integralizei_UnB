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

  // --- CORREÇÃO AQUI ---
  // Antes ele olhava (dadosPDF || dadosConta).
  // Agora ele só olha dadosConta.
  const checkLoginStatus = () => {
    const dadosConta = localStorage.getItem("user_session");
    
    // Só muda o botão para "SAIR" se tiver conta logada
    if (dadosConta) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();

    // Ouve mudanças para atualizar automaticamente
    window.addEventListener("storage", checkLoginStatus);
    
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Limpa os dados ao sair
    localStorage.removeItem("dadosAluno");
    localStorage.removeItem("user_session");
    
    // Tenta avisar o backend (opcional, ignora erro se falhar)
    try {
      await fetch("http://localhost:3001/api/logout"); 
    } catch (error) {
      console.error("Logout local apenas");
    }

    setIsLoggedIn(false);
    
    // Força atualização da tela e dos componentes
    window.dispatchEvent(new Event("storage"));
    window.location.reload(); 
  };

  return (
    <header className={styles.navbarContainer}>
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

        <Link href="/unbot" className={`${styles.botao} ${styles.cor_da_UnB}`}>
          <Bot size={18} />
          UNBOT
        </Link>

        <Link href="/sobre" className={`${styles.botao} ${styles.cor_da_UnB}`}>
          <Info size={18} />
          SOBRE
        </Link>

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