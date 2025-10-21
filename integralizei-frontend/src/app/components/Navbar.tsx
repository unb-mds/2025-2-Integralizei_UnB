"use client";

import Link from "next/link";
import "./navbar.css";

export default function Navbar() {
  return (
    <header className="navbar-container">
      {/* Logo + texto */}
      <div className="logo-container">
        <img src="/logo-unb.png" alt="Logo UnB" />
        <span>Integralizei UnB</span>
      </div>

      {/* Links + botão */}
      <nav className="nav-links">
        <Link href="/dsadsasdsas">dsadsasdsas</Link>
        <Link href="/dasdasddasda">dasdasddasda</Link>
        <Link href="/blabla">Bla bla</Link>
        <Link href="/sobre">Sobre Nós</Link>
        <button className="botao">Integralizei</button>
      </nav>
    </header>
  );
}
