"use client";

import Image from "next/image";
import Navbar from "../../components/Navbar2/Navbar2";

export default function SobrePage() {
  const criadores = [
    
    { nome: "Ana Beatriz Souza", img: "/criadores/ana.jpeg" },
    { nome: "Ana Caroline Dantas", img: "/criadores/carol.jpg" },
    { nome: "Caroline Becker", img: "/criadores/carol2jpeg.jpeg" },

    { nome: "Gustavo Fornaciari", img: "/criadores/gustavo.jpeg" },
    { nome: "Enzo Menali", img: "/criadores/enzo.jpg" },
    { nome: "Paulo Vitor Gomes", img: "/criadores/paulo.jpg" },
  ];

  return (
    <div className="min-h-screen bg-white font-[Inter]">
      <Navbar />

      <div className="px-6 pt-28 pb-16 flex flex-col items-center">

        {/* TÍTULO PRINCIPAL - Efeito Degradê no Texto (Igual ao Pesquisa) */}
        <h1 className="text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-[#006633] to-[#003366] bg-clip-text text-transparent">
          Sobre o Projeto
        </h1>

        {/* TEXTO DESCRITIVO */}
        <div className="max-w-3xl mx-auto text-lg text-center text-gray-700 leading-relaxed mb-20">
          <p className="mb-4">
            O <strong>Integralizei UnB</strong> é um sistema desenvolvido para facilitar a vida acadêmica
            dos estudantes da Universidade de Brasília.
          </p>

          <p className="mb-4">
            A aplicação realiza o processamento automático do histórico escolar (PDF do SIGAA)
            e organiza as informações de forma clara e intuitiva, permitindo ao aluno visualizar
            sua integralização, créditos, disciplinas cursadas, IRA, e muito mais.
          </p>

          <p>
            O projeto foi desenvolvido como parte da disciplina de{" "}
            <strong>Métodos de Desenvolvimento de Software (MDS)</strong> e é resultado do esforço de um
            time colaborativo focado em construir uma ferramenta útil, moderna e acessível para toda a
            comunidade acadêmica.
          </p>
        </div>

        {/* SUBTÍTULO - Efeito Degradê no Texto */}
        <h2 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-[#006633] to-[#003366] bg-clip-text text-transparent">
          Criadores
        </h2>

        {/* GRID COM 6 PESSOAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl place-items-center">
          {criadores.map((pessoa, i) => (
            <div
              key={i}
              className="rounded-3xl p-8 flex flex-col items-center shadow-xl
                         bg-gradient-to-b from-[#006633] to-[#003366] w-80 hover:scale-105 transition-transform"
            >
              {/* FOTO */}
              <div className="w-36 h-36 rounded-full overflow-hidden mb-4 shadow-lg border-4 border-white/20">
                <Image
                  src={pessoa.img}
                  width={200}
                  height={200}
                  alt={pessoa.nome}
                  className="object-cover w-full h-full"
                />
              </div>

              {/* NOME */}
              <h3 className="text-white text-xl font-semibold text-center">
                {pessoa.nome}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}