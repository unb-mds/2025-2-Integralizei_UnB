"use client";

import { useState } from "react";
import Navbar from "../../components/Navbar2/Navbar2"; // ajuste o caminho se necessário

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Handlers de drag
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setStatus("");
    } else {
      setStatus("⚠️ Envie apenas arquivos PDF.");
    }
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setStatus("");
    } else {
      setStatus("⚠️ Envie apenas arquivos PDF.");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus("Selecione ou arraste um arquivo PDF primeiro.");
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
        setStatus("✅ Histórico enviado com sucesso!");
        setTimeout(() => (window.location.href = "/dados"), 1200);
      } else {
        setStatus(data.error || "Erro ao processar o arquivo.");
      }
    } catch (error) {
      console.error(error);
      setStatus("❌ Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 font-[Inter] pt-16 px-6">
        <div className="bg-white rounded-3xl shadow-[0_8px_35px_rgba(0,0,0,0.06)] w-full max-w-2xl py-10 px-8 border border-gray-100 text-center">
          {/* Título */}
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
            Integralizei <span className="text-green-700">UnB</span>
          </h1>
          <p className="text-gray-500 mb-8">
            Envie seu histórico acadêmico em PDF
            <br />
            <span className="text-sm text-gray-400">
              Nenhum dado sensível será armazenado
            </span>
          </p>

          {/* Área interativa de arraste */}
          <label
            htmlFor="fileInput"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`transition-all duration-300 flex flex-col items-center justify-center h-44 rounded-2xl border-2 border-dashed cursor-pointer select-none ${
              dragActive
                ? "border-green-600 bg-green-50 scale-[1.02]"
                : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:scale-[1.01]"
            }`}
          >
            {file ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 text-green-700 mb-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                <p className="text-gray-800 font-medium">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">Pronto para envio ✅</p>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 text-gray-400 mb-2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 16.5v-9m0 0l3 3m-3-3l-3 3M4.5 19.5h15a2.25 2.25 0 002.25-2.25v-7.5A2.25 2.25 0 0019.5 7.5h-15A2.25 2.25 0 002.25 9.75v7.5A2.25 2.25 0 004.5 19.5z"
                  />
                </svg>
                <p className="text-gray-600 font-medium text-base">
                  Arraste e solte seu arquivo PDF aqui
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  ou clique para selecionar
                </p>
              </>
            )}
          </label>

          {/* Input real (escondido) */}
          <input
            id="fileInput"
            type="file"
            accept=".pdf"
            onChange={handleChange}
            className="hidden"
          />

          {/* Botão Enviar */}
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`mt-8 w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold text-lg shadow-lg transition-all ${
              loading
                ? "bg-green-400 cursor-wait"
                : "bg-gradient-to-r from-green-700 to-blue-800 hover:opacity-90"
            }`}
          >
            {loading ? "Enviando..." : "Enviar histórico"}
          </button>

          {/* Status */}
          {status && (
            <p
              className={`mt-4 text-sm font-medium ${
                status.includes("sucesso")
                  ? "text-green-600"
                  : status.includes("Erro")
                  ? "text-red-500"
                  : "text-gray-600"
              }`}
            >
              {status}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
