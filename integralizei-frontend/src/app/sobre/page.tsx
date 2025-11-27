"use client";

import Image from "next/image";
import Navbar from "../../components/Navbar2/Navbar2";

export default function SobrePage() {
  const criadores = [
    {
      nome: "Ana Dantas",
      img: "/criadores/ana.jpg",
    },
    {
      nome: "Fulano da Silva",
      img: "/criadores/fulano.jpg",
    },
    {
      nome: "Ciclano Pereira",
      img: "/criadores/ciclano.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* NAVBAR */}
      <Navbar />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="px-6 py-16 flex flex-col items-center">

        {/* SECTION: SOBRE */}
        <h1 className="text-4xl font-bold mb-8 text-center">Sobre o Projeto</h1>

        <div className="max-w-3xl text-lg text-center text-gray-700 leading-relaxed mb-20">
          <p className="mb-4">
            O <strong>Integralizei UnB</strong> é um sistema desenvolvido para facilitar a vida acadêmica dos estudantes da Universidade de Brasília.
          </p>
          <p className="mb-4">
            A aplicação realiza o processamento automático do histórico escolar (PDF do SIGAA) e organiza as informações de forma clara e intuitiva, permitindo ao aluno visualizar sua integralização, créditos, disciplinas cursadas, IRA, e muito mais.
          </p>
          <p>
            O projeto foi desenvolvido como parte da disciplina de <strong>Métodos de Desenvolvimento de Software (MDS)</strong> e é resultado do esforço de um time colaborativo focado em construir uma ferramenta útil, moderna e acessível para toda a comunidade acadêmica.
          </p>
        </div>

        {/* SECTION: CRIADORES */}
        <h2 className="text-3xl font-bold mb-10 text-center">Criadores</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl">

          {criadores.map((pessoa, i) => (
            <div
              key={i}
              className="rounded-3xl p-8 flex flex-col items-center shadow-xl
                         bg-gradient-to-b from-green-600 to-blue-900 w-80"
            >
              {/* FOTO */}
              <div className="w-36 h-36 rounded-full overflow-hidden mb-4 shadow-lg">
                <Image
                  src={pessoa.img}
                  width={200}
                  height={200}
                  alt={pessoa.nome}
                  className="object-cover"
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
