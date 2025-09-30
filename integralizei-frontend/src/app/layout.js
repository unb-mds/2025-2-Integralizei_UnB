// app/layout.js
import './globals.css';
import Header from '../components/Header';


export const metadata = {
  title: 'Integralizei UnB - Seu Guia de Matrícula',
  description: 'Análise e previsão de integralização de créditos na UnB.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* 1. O Header aparece em todas as páginas */}
        <Header />
        
        {/* 2. O {children} é o conteúdo específico de cada página */}
        <main className="content">
           {children}
        </main>
      </body>
    </html>
  );
}