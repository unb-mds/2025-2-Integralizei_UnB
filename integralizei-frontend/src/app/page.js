
// Importamos o novo componente
import HeroSection from '../components/HeroSection'; 

// Metadados básicos para a Home
export const metadata = {
  title: 'Integralizei UnB - Início',
  description: 'A página inicial do projeto Integralizei UnB.',
};

export default function HomePage() {
  return (
    // Colocamos o HeroSection como o conteúdo principal
    <HeroSection /> 
  );
}