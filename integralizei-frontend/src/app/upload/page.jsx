"use client";
import { useState } from "react";

export default function UploadPage() {
  const [fileName, setFileName] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) setFileName(file.name);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Card com degradê */}
      <div className="bg-gradient-to-b from-green-700 to-blue-800 text-white rounded-3xl p-10 w-full max-w-2xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-2">Integralizei UnB</h1>
        <h2 className="text-xl font-semibold mb-1">
          Envie seu histórico acadêmico em PDF
        </h2>
        <p className="text-sm font-medium text-gray-200 mb-8">
          NENHUM DADO SENSÍVEL SERÁ ARMAZENADO
        </p>

        {/* Área de upload */}
        <label
          htmlFor="fileInput"
          className="flex flex-col items-center justify-center bg-white/20 hover:bg-white/30 transition-colors cursor-pointer rounded-xl w-full h-52 border-2 border-dashed border-white/60 mb-8"
        >
          <p className="text-gray-100 mb-3">
            {fileName ? `Arquivo selecionado: ${fileName}` : "Arraste seu arquivo para esse espaço"}
          </p>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
            />
          </svg>
          <input
            id="fileInput"
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {/* Separador "OU" */}
      <div className="mt-6 text-green-800 font-bold text-xl">OU</div>

      {/* Botão alternativo */}
      <label
        htmlFor="fileInput"
        className="mt-3 bg-gradient-to-r from-green-700 to-blue-800 text-white px-6 py-3 rounded-lg cursor-pointer hover:opacity-90 transition"
      >
        Escolha um arquivo para enviar
      </label>
    </div>
  );
}
