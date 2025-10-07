// components/HeroSection.js

import Link from 'next/link';
import styles from './HeroSection.module.css';

const HeroSection = () => {
  return (
    <section className={styles.hero}>
      {/* Container de Conteúdo (Lado Esquerdo) */}
      <div className={styles.contentContainer}>
        <h1 className={styles.title}>Integralizei UnB</h1>
        <p className={styles.text}>
          Com apenas o seu histórico, nossa plataforma analisará e preverá qual a sua
          chance aproximada de garantir a vaga com o professor que você tanto quer. Assim, em vez
          de ansiedade, você terá o poder dos dados para planejar seu semestre com mais
          confiança e tranquilidade.
        </p>
        
        {/* Botão "Saiba mais" (Link para a página de upload) */}
        <Link href="/integralizar" className={styles.button}>
          Saiba mais
        </Link>
      </div>

      {/* Placeholder para a Imagem (Lado Direito), que você pode preencher depois */}
      <div className={styles.imagePlaceholder}>
        {/* Opcional: Adicionar uma ilustração ou deixar vazio por enquanto */}
      </div>
    </section>
  );
};

export default HeroSection;