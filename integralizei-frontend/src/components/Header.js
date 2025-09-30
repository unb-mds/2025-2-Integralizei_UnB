// components/Header.js
import Link from 'next/link';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      {/* 1. Logo/Título - Canto Superior Esquerdo */}
      <div className={styles.logo}>
        {/* Link para a página inicial, usando a classe logoLink */}
        <Link href="/" className={styles.logoLink}>
          Integralizei UnB
        </Link>
      </div>

      {/* 2. Botão - Canto Superior Direito */}
      <nav className={styles.nav}>
        {/* Link para a página /integralizar, usando a classe button */}
        <Link href="/integralizar" className={styles.button}>
          Integralizei
        </Link>
      </nav>
    </header>
  );
};

export default Header;