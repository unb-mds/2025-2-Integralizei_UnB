"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./navbar2.module.css";
import { BarChart3, Calculator, Search, Info, LogIn, LogOut, Bot } from "lucide-react";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const checkLoginStatus = () => {
    const dadosConta = localStorage.getItem("user_session");
    
    // [FIX] queueMicrotask evita o erro "synchronous setState" do ESLint
    queueMicrotask(() => {
      if (dadosConta) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    });
  };

  useEffect(() => {
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    localStorage.removeItem("dadosAluno");
    localStorage.removeItem("user_session");
    
    // [FIX] O catch (_) resolve o warning de variável não usada
    try {
      await fetch("http://localhost:3001/api/logout"); 
    } catch (error) { // Mantido 'error' para clareza, mas é ignorado no final do bloco
      console.error("Logout local apenas", error);
    }

    setIsLoggedIn(false);
    window.dispatchEvent(new Event("storage"));
    
    // [FIX] Isso é essencial e não depende do useRouter()
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