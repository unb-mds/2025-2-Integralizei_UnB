"use client";
<<<<<<< HEAD
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
=======

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar2/Navbar2";
import { CheckCircle } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    const selected = event.target.files[0];
    setFile(selected);
    setStatus("");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const dropped = e.dataTransfer.files[0];

    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setStatus("");
    } else {
      setStatus("Envie apenas arquivos PDF.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Selecione ou arraste um PDF primeiro.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("dadosAluno", JSON.stringify(data));
        setStatus("Histórico enviado com sucesso!");

        setTimeout(() => router.push("/dados"), 1000);
      } else {
        setStatus(data.error || "Erro ao processar o PDF.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Erro ao conectar ao servidor.");
    }

    setLoading(false);
  };

  return (
    <>
      <Navbar />

      <main className="flex flex-col items-center justify-start px-6 pt-28 min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 font-[Inter]">

        {/* Caixa principal */}
        <div className="bg-white w-full max-w-2xl p-10 rounded-3xl shadow-lg text-center border border-gray-200">
          
          {/* Título */}
          <h1 className="text-4xl font-bold mb-2">
            Integralizei <span className="text-green-700">UnB</span>
          </h1>

          {/* Subtítulo */}
          <p className="text-gray-600 mb-8">
            Envie seu histórico acadêmico em PDF <br />
            <span className="text-gray-500 text-sm">Nenhum dado sensível será armazenado</span>
          </p>

          {/* Área de upload */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full p-10 rounded-2xl border-2 border-dashed transition-all ${
              dragActive
                ? "border-green-600 bg-green-50"
                : "border-gray-300 bg-gray-100"
            }`}
          >
            {file ? (
              <div className="flex flex-col items-center">
                <CheckCircle className="text-green-600 w-12 h-12 mb-2" />
                <p className="text-gray-700 font-medium">{file.name}</p>
                <p className="text-green-600 text-sm">Pronto para envio ✔️</p>
              </div>
            ) : (
              <p className="text-gray-600">
                Arraste e solte aqui ou clique no botão abaixo
              </p>
            )}

            <input
              type="file"
              accept="application/pdf"
              id="fileInput"
              onChange={handleFileChange}
              className="hidden"
            />

            <label
              htmlFor="fileInput"
              className="mt-5 inline-block bg-gray-800 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-black transition"
            >
              Selecionar PDF
            </label>
          </div>

          {/* Botão de envio */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`mt-8 w-full py-3 rounded-xl text-white font-semibold shadow-md transition 
              bg-gradient-to-r from-green-700 to-blue-700 hover:opacity-90
              ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Enviando..." : "Enviar histórico"}
          </button>

          {/* Mensagem */}
          {status && (
            <p className="mt-4 text-center text-gray-700 font-medium">{status}</p>
          )}
        </div>
      </main>
    </>
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
  );
}
