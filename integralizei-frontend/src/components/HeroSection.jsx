"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRightCircle } from "lucide-react";

export default function HeroSection() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between bg-white font-[Inter]">
      {/* Hero principal */}
      <section className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl px-8 mt-36 mb-16">
        {/* Texto */}
        <div className="max-w-xl text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight bg-gradient-to-r from-green-700 to-blue-800 bg-clip-text text-transparent">
            Planeje sua integralização com dados reais da UnB
          </h1>
          <p className="text-gray-700 mt-6 text-lg">
            Envie seu histórico acadêmico e descubra sua chance de vaga, seu
            desempenho médio e simule como suas escolhas podem impactar seu IRA.
          </p>

          <Link
            href="/upload"
            className="inline-flex items-center gap-2 mt-8 bg-gradient-to-r from-green-700 to-blue-800 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Enviar Histórico
            <ArrowRightCircle size={22} />
          </Link>
        </div>

        {/* Ilustração */}
        <div className="hidden md:flex justify-center mt-10 md:mt-0">
          <Image
            src="/hero-ira.png"
            alt="Ilustração de análise acadêmica"
            width={480}
            height={480}
            className="object-contain drop-shadow-lg"
            unoptimized
          />
        </div>
      </section>

      {/* Sessão explicativa */}
      <section className="w-full bg-gradient-to-b from-green-700 to-blue-800 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-10">Como funciona?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-10 md:px-20">
          <div className="bg-white/10 p-8 rounded-xl shadow-md hover:bg-white/20 transition">
            <h3 className="text-xl font-semibold mb-3">1. Envie seu histórico</h3>
            <p className="text-sm text-gray-200">
              Faça upload do seu histórico da UnB em PDF. Nós extraímos apenas as
              informações relevantes — matérias, menções e IRA.
            </p>
          </div>

          <div className="bg-white/10 p-8 rounded-xl shadow-md hover:bg-white/20 transition">
            <h3 className="text-xl font-semibold mb-3">2. Analise seu desempenho</h3>
            <p className="text-sm text-gray-200">
              Veja seu IRA, as matérias cursadas e compare seu progresso com o de
              outros estudantes do mesmo curso.
            </p>
          </div>

          <div className="bg-white/10 p-8 rounded-xl shadow-md hover:bg-white/20 transition">
            <h3 className="text-xl font-semibold mb-3">3. Simule sua integralização</h3>
            <p className="text-sm text-gray-200">
              Adicione novas matérias à simulação e descubra como isso impacta sua
              integralização e suas chances de vaga.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gradient-to-r from-green-700 to-blue-800 py-6 text-center text-sm text-white">
        © {new Date().getFullYear()} Integralizei UnB — Projeto MDS/UnB
      </footer>
    </main>
  );
}
