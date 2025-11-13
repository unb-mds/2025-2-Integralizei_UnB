"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar2/Navbar2";

// ---------------------------------------
// Tipos usados nesta página
// ---------------------------------------
interface Materia {
  codigo?: string;
  nome?: string;
  situacao?: string;
  periodo?: string;
  creditos?: number;
}

interface Curriculo {
  materias?: Materia[];
  integralizacao?: number;
  ch_integralizada?: number;
  ch_exigida?: number;
}

interface Indices {
  ira?: number;
  mp?: number;
}

interface Aluno {
  nome?: string;
  nome_completo?: string;
  matricula?: string | number;
  id?: string | number;
}

interface DadosAluno {
  aluno?: Aluno;
  indices?: Indices;
  curriculo?: Curriculo;
}

// ---------------------------------------
// Página principal
// ---------------------------------------
export default function DadosPage() {
  const [dados, setDados] = useState<DadosAluno | null>(null);
  // Carrega dados do localStorage
  useEffect(() => {
  const dadosSalvos = localStorage.getItem("dadosAluno");

  // microtask — recomendado pelo React
  Promise.resolve().then(() => {
    if (dadosSalvos) {
      try {
        setDados(JSON.parse(dadosSalvos) as DadosAluno);
      } catch {
        setDados(null);
      }
    }
  });
}, []);


  // Caso não tenha dados ainda
  if (!dados) {
    return (
      <>
        <Navbar />
        <main className="flex flex-col items-center justify-center h-screen text-gray-700">
          <h1 className="text-3xl font-bold">Nenhum dado encontrado</h1>
          <p className="mt-2 text-lg">
            Envie seu histórico novamente para visualizar seus dados.
          </p>
        </main>
      </>
    );
  }

  // Ajustes e extração
  const aluno = dados.aluno || {};
  const nomeAluno = aluno.nome || aluno.nome_completo || "Aluno";
  const matriculaAluno = aluno.matricula || aluno.id || "";

  const indices = dados.indices || {};
  const curriculo = dados.curriculo || {};
  const totalMaterias = curriculo.materias?.length || 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white text-gray-800 font-[Inter] px-8 py-16 pt-28">
        {/* Título */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-green-800">Meus Dados</h1>

          <p className="mt-2 text-xl font-medium text-gray-700">
            {nomeAluno}
            {matriculaAluno ? ` — Matrícula ${matriculaAluno}` : ""}
          </p>

          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Veja como seus dados estão atualmente, com uma precisão maior do que o SIGAA,
            permitindo que você planeje seus próximos passos com mais clareza.
          </p>
        </div>

        {/* Cards principais */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {/* IRA Atual */}
          <div className="bg-gradient-to-b from-green-700 to-blue-800 text-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-3">IRA Atual</h2>
            <p className="text-4xl font-bold">
              {indices?.ira !== null && indices?.ira !== undefined
                ? Number(indices.ira).toFixed(3)
                : "—"}
            </p>
            <p className="text-sm text-gray-200 mt-2">Média → 4.321</p>
          </div>

          {/* Integralização */}
          <div className="bg-gradient-to-b from-green-700 to-blue-800 text-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-3">Integralização</h2>
            <p className="text-4xl font-bold">
              {curriculo.integralizacao != null
                ? `${curriculo.integralizacao.toFixed(2)}%`
                : "—"}
            </p>

            <div className="w-full bg-gray-300 rounded-full h-3 mt-4">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{
                  width: `${
                    curriculo.integralizacao != null
                      ? curriculo.integralizacao
                      : 0
                  }%`,
                }}
              ></div>
            </div>

            <p className="text-sm text-gray-200 mt.2">
              Carga horária integralizada →{" "}
              {curriculo.ch_integralizada || 0}h / {curriculo.ch_exigida || 3480}h
            </p>
          </div>

          {/* Matérias feitas */}
          <div className="bg-gradient-to-b from-green-700 to-blue-800 text-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-3">Matérias Feitas</h2>
            <p className="text-4xl font-bold">{totalMaterias}</p>
            <p className="text-sm text-gray-200 mt-2">Média → 12</p>
          </div>
        </div>

        {/* Tabela do histórico */}
        <div className="max-w-6xl mx-auto bg-gradient-to-b from-green-700 to-blue-800 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Meu Histórico</h2>
          <p className="text-sm text-gray-200 mb-4">
            Lista completa das matérias já cursadas
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 bg-white text-gray-800 rounded-lg">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="py-3 px-4 border">Código</th>
                  <th className="py-3 px-4 border">Matéria</th>
                  <th className="py-3 px-4 border">Menção</th>
                  <th className="py-3 px-4 border">Semestre</th>
                  <th className="py-3 px-4 border">Créditos</th>
                </tr>
              </thead>

              <tbody>
                {curriculo.materias && curriculo.materias.length > 0 ? (
                  curriculo.materias.map((m: Materia, i: number) => (
                    <tr
                      key={i}
                      className={`${
                        i % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
                      } hover:bg-green-100 transition`}
                    >
                      <td className="py-2 px-4 border text-center">{m.codigo || "—"}</td>
                      <td className="py-2 px-4 border">{m.nome || "—"}</td>
                      <td className="py-2 px-4 border text-center">{m.situacao || "—"}</td>
                      <td className="py-2 px-4 border text-center">{m.periodo || "—"}</td>
                      <td className="py-2 px-4 border text-center">{m.creditos ?? "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      Nenhuma disciplina encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
