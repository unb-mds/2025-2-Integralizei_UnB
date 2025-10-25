

import Image from 'next/image';
import Link from 'next/link'; 
import styles from './navbar2.module.css'; 

export default function Navbar2() {
  return (
    
    <header className={styles.navbarContainer}>
      
      <div className={styles.logoContainer}>
        <Image
          src="/logo-unb.png" 
          alt="Logo Integralizei UnB"
          width={50}  
          height={50}
          className={styles.logoImage}
          priority
          unoptimized 
        />
        <span className={styles.logoText}>Integralizei UnB</span>
      </div>
      <nav className={styles.navLinks}>
        <Link
          href="/dados" 
          className={`${styles.botao} ${styles['cor_da_UnB']}`}
        >
          DADOS
        </Link>

        <Link
          href="/calculadora" 
          className={`${styles.botao} ${styles['cor_da_UnB']}`}
        >
          CALCULADORA
        </Link>

        <Link
          href="/pesquisa" 
          className={`${styles.botao} ${styles['cor_da_UnB']}`}
        >
          PESQUISA
        </Link>
      </nav>
    </header>
  );
}