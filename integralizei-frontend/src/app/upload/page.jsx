"use client";

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
  );
}
