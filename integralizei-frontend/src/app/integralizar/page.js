// app/integralizar/page.js
// Esta é a única versão correta.

// 1. Importa o componente de formulário
import UploadForm from '../../components/UploadForm';

// 2. Define os metadados
export const metadata = {
  title: 'Upload de Histórico | Integralizei UnB',
  description: 'Envie seu histórico acadêmico em PDF para análise.',
};

// 3. Exporta o único componente de página (Page Component)
export default function IntegralizarPage() {
  return (
    // Simplificamos a div para remover estilos em linha complexos.
    // O estilo de centralização já está no CSS do UploadForm.module.css (margin: 4rem auto).
    <div>
      <UploadForm />
    </div>
  );
}