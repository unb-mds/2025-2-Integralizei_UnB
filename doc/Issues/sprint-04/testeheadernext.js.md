# Estrutura do Next.js

O **Next.js** é um framework em cima do **React** que organiza o projeto em **pastas e arquivos especiais**, que ditam o comportamento da aplicação.  

## Pontos principais

- **`app/` (ou `pages/` nas versões antigas):** cada pasta/arquivo aqui vira uma **rota** automaticamente.  
- **Componentes React:** você escreve a UI normalmente em React (`.jsx` ou `.tsx`).  
- **Server e Client Components:** o Next.js mistura código que roda no servidor (melhor para performance e SEO) com código que roda no cliente (interatividade).  
- **API Routes (`app/api/...`):** permite criar **endpoints de backend** dentro do mesmo projeto.  
- **Rotas dinâmicas:** usando colchetes (`[id]`), você cria páginas dinâmicas.  
- **Renderização:** pode ser feita de 3 formas:  
  - **SSR (Server-Side Rendering)** → página gerada no servidor a cada requisição.  
  - **SSG (Static Site Generation)** → página gerada uma vez no build.  
  - **CSR (Client-Side Rendering)** → carregada direto no navegador como no React puro.  
- **Estilização:** suporta CSS modules, Tailwind, styled-components, etc.  
- **Configuração:** feita em `next.config.js`.  

---
 exemplo de header do site
```javascript
//src/components/Header.js

import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      
      {/* 1. Área do Logo/Título (Continua na esquerda) */}
      <Link href="/" className={styles.logo}>
        Integralizei UnB
      </Link>

      {/* 2. Novo Container para o lado direito (Links + Botão) */}
      <div className={styles.rightSide}>
        
        {/* Links de Navegação */}
        <nav className={styles.navLinks}>
          <Link href="/sobre" className={styles.link}>Sobre Nós</Link> 
          <Link href="/features" className={styles.link}>Features</Link>
          <Link href="/faq" className={styles.link}>FAQ's</Link>
        </nav>

        {/* Botão de Ação */}
        <Link href="/login" className={styles.ctaButton}>
          Integralizei
        </Link>
      </div>

    </header>
  );
}

```css
/* src/components/Header.module.css */

.header {
  display: flex;
  justify-content: space-between; 
  align-items: center; 
  padding: 15px 40px; 
  background-color: white; 
  border-image: linear-gradient(to right, #ebebeb, #e7e7e7) 1; 
  border-bottom: 2px solid;
  border-image-slice: 1;
}

.rightSide {
  display: flex;
  align-items: center; 
  gap: 30px;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  text-decoration: none;
}

.navLinks {
  display: flex;
  gap: 25px;
}

.link {
  color: #6b7280; 
  font-size: 16px;
  text-decoration: none;
  padding: 5px 0;
  transition: color 0.2s;
}

.link:hover {
  color: #000000; 
}

.ctaButton {
  background-color: #000000; 
  color: white;
  font-weight: 600;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.ctaButton:hover {
  background-color: #d6d6d6;
}

  background-color: #d6d6d6;
}

