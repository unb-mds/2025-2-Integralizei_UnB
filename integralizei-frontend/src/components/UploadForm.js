// components/UploadForm.js
'use client'; // Isso é necessário no App Router para usar 'useState' e funções de interatividade

import { useState } from 'react';
import styles from './UploadForm.module.css';

const UploadForm = () => {
  // Estado para armazenar o arquivo selecionado
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("Nenhum arquivo escolhido");

  // Lida com a seleção do arquivo
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setFileName(file ? file.name : "Nenhum arquivo escolhido");
  };

  // Lida com o envio do formulário (futura interação com o Flask)
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Por favor, selecione um arquivo PDF.");
      return;
    }

    // AQUI OCORRERÁ A FUTURA INTERAÇÃO COM O FLASK
    console.log("Arquivo a ser enviado:", selectedFile);
    alert(`Pronto para enviar: ${selectedFile.name}. A integração com o Flask será feita em breve!`);

    // Aqui você faria a chamada 'fetch' ou 'axios' para a API Flask
  };

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Integralizei UnB</h2>
      <p className={styles.subtitle}>
        Envie seu histórico acadêmico em PDF.
      </p>
      <p className={styles.privacyNote}>
        Seus dados serão processados com segurança e não serão armazenados permanentemente.
      </p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Input REAL que fica invisível */}
        <input
          type="file"
          id="file-upload"
          accept=".pdf"
          onChange={handleFileChange}
          className={styles.fileInput}
        />

        {/* Botões customizados que imitam o design da imagem */}
        <div className={styles.customFileInput}>
          <label htmlFor="file-upload" className={styles.chooseButton}>
            Escolher arquivo
          </label>
          <span className={styles.fileName}>{fileName}</span>
        </div>

        {/* Botão de Envio */}
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={!selectedFile} // Desabilita se nenhum arquivo for selecionado
        >
          Enviar Arquivo
        </button>
      </form>
    </div>
  );
};

export default UploadForm;