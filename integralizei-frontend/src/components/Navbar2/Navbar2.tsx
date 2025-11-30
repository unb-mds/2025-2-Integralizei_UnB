"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./navbar2.module.css";
import { BarChart3, Calculator, Search, Info, LogIn, Bot } from "lucide-react";

export default function Navbar() {
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

        {/* --- NOVO BOTÃO: UNBOT --- */}
        <Link href="/unbot" className={`${styles.botao} ${styles.cor_da_UnB}`}>
          <Bot size={18} />
          UNBOT
        </Link>

        <Link href="/sobre" className={`${styles.botao} ${styles.cor_da_UnB}`}>
          <Info size={18} />
          SOBRE
        </Link>

        <Link href="/login" className={`${styles.botao} ${styles.cor_da_UnB}`}>
          <LogIn size={18} />
          ENTRAR
        </Link>
      </nav>
    </header>
  );
}