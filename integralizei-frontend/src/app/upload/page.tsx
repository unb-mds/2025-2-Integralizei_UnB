"use client";

import { useState, ChangeEvent, DragEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar2 from "../../components/Navbar2/Navbar2";
import { CheckCircle, UploadCloud, Lock, UserPlus, LogIn } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userSession = localStorage.getItem("user_session");
    
    // [FIX] queueMicrotask para evitar erro de linter (setState síncrono no effect)
    queueMicrotask(() => {
      setIsLoggedIn(!!userSession);
      setIsCheckingAuth(false);
    });
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setStatus("");
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (isLoggedIn) setDragActive(true); 
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (!isLoggedIn) return; 

    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type === "application/pdf") {
      setFile(dropped);
      setStatus("");
    } else {
      setStatus("Envie apenas arquivos PDF.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const userSession = localStorage.getItem("user_session");
    if (userSession) {
      try {
        const { email } = JSON.parse(userSession);
        if (email) formData.append("email", email);
      } catch (e) {
        console.error("Erro sessão:", e);
      }
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("dadosAluno", JSON.stringify(data));
        window.dispatchEvent(new Event("storage"));
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

  if (isCheckingAuth) {
    return (
      <>
        <Navbar2 />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-[Inter]">
          <p className="text-gray-500">Carregando...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar2 />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6 pt-20 font-[Inter]">
        <div className="bg-gradient-to-b from-green-700 to-blue-800 text-white rounded-3xl p-10 w-full max-w-2xl shadow-xl text-center relative overflow-hidden">
          
          <h1 className="text-3xl font-bold mb-2">Integralizei UnB</h1>
          <h2 className="text-xl font-semibold mb-1 opacity-90">
            Envie seu histórico acadêmico em PDF
          </h2>
          <p className="text-sm font-medium text-gray-200 mb-8">
            NENHUM DADO SENSÍVEL SERÁ ARMAZENADO
          </p>

          {isLoggedIn ? (
            <>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  flex flex-col items-center justify-center 
                  rounded-xl w-full h-64 border-2 border-dashed transition-all cursor-pointer
                  ${dragActive ? "border-white bg-white/30 scale-105" : "border-white/60 bg-white/10 hover:bg-white/20"}
                `}
              >
                {file ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in">
                    <CheckCircle className="w-16 h-16 text-green-300 mb-3" />
                    <p className="text-xl font-semibold text-white">{file.name}</p>
                    <p className="text-green-200 text-sm mt-1">Pronto para enviar</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="mt-4 text-xs text-white underline hover:text-red-200"
                    >
                      Remover arquivo
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-16 h-16 text-gray-200 mb-4" />
                    <p className="text-lg text-white font-medium">
                      Arraste seu arquivo aqui
                    </p>
                    <p className="text-sm text-gray-300 mt-1">ou clique para selecionar</p>
                  </>
                )}

                <input
                  id="fileInput"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {!file && (
                  <label htmlFor="fileInput" className="absolute inset-0 cursor-pointer" />
                )}
              </div>

              <div className="mt-8">
                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className={`
                    w-full bg-white text-green-800 font-bold text-lg px-6 py-3 rounded-lg 
                    shadow-md transition transform hover:-translate-y-1
                    ${(!file || loading) ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-100"}
                  `}
                >
                  {loading ? "Processando..." : "Enviar Histórico"}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white/10 rounded-xl p-8 border border-white/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4">
              <Lock className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Acesso Restrito</h3>
              <p className="text-gray-200 mb-6">
                Para garantir a segurança e salvar seu progresso, você precisa entrar na sua conta antes de enviar o histórico.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/login"
                  className="flex items-center justify-center gap-2 bg-white text-[#006633] px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  <LogIn size={18} />
                  Entrar
                </Link>
                <Link 
                  href="/cadastro"
                  className="flex items-center justify-center gap-2 bg-[#006633] border border-white/30 text-white px-6 py-3 rounded-lg font-bold hover:bg-[#00552b] transition-colors"
                >
                  <UserPlus size={18} />
                  Criar Conta
                </Link>
              </div>
            </div>
          )}

          {status && (
            <div className={`mt-6 p-3 rounded-lg text-sm font-medium ${status.includes("sucesso") ? "bg-green-500/20 text-green-100" : "bg-red-500/20 text-red-100"}`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </>
  );
}