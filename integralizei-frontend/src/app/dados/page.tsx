"use client";

import { useEffect, useState } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";

// --- Interfaces para Tipagem Segura ---
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
  curso?: string;
}

interface DadosAluno {
  aluno?: Aluno;
  indices?: Indices;
  curriculo?: Curriculo;
}

export default function DadosPage() {
  const [dados, setDados] = useState<DadosAluno | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const dadosSalvos = localStorage.getItem("dadosAluno");
      if (dadosSalvos) {
        try {
          setDados(JSON.parse(dadosSalvos) as DadosAluno);
        } catch (e) {
          console.error("Erro ao ler dados:", e);
        }
      }
      setLoading(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Tela de Carregamento ou Sem Dados
  if (loading) return <div className="flex h-screen items-center justify-center">Carregando...</div>;

  if (!dados) {
    return (
      <>
        <Navbar2 />
        <main className="flex flex-col items-center justify-center h-screen text-gray-700 font-[Inter]">
          <h1 className="text-3xl font-bold text-green-800">Nenhum dado encontrado</h1>
          <p className="mt-2 text-lg">Envie seu histórico novamente para visualizar seus dados.</p>
          <a href="/upload" className="mt-6 px-6 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition">
            Ir para Upload
          </a>
        </main>
      </>
    );
  }

  // Extração segura das variáveis para renderização
  const aluno = dados.aluno || {};
  const nomeAluno = aluno.nome || aluno.nome_completo || "Aluno";
  const matriculaAluno = aluno.matricula || "";
  const cursoAluno = aluno.curso || "Curso não identificado";

  const indices = dados.indices || {};
  const curriculo = dados.curriculo || {};
  const totalMaterias = curriculo.materias?.length || 0;

  return (
    <>
      <Navbar2 />
      <main className="min-h-screen bg-white text-gray-800 font-[Inter] px-8 py-16 pt-28">
        {/* Cabeçalho do Aluno */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-green-800">Meus Dados</h1>
          <p className="mt-2 text-xl font-medium text-gray-700">
            {nomeAluno} {matriculaAluno ? `— ${matriculaAluno}` : ""}
          </p>
          <p className="text-md text-gray-500">{cursoAluno}</p>
        </div>

        {/* Cards Principais (Grid) */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {/* Card IRA */}
          <div className="bg-gradient-to-b from-green-700 to-blue-800 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h2 className="text-2xl font-semibold mb-3">IRA Atual</h2>
            <p className="text-5xl font-bold">
              {indices?.ira !== null && indices?.ira !== undefined
                ? Number(indices.ira).toFixed(4)
                : "—"}
            </p>
            <p className="text-sm text-gray-200 mt-2">Índice de Rendimento Acadêmico</p>
          </div>

          {/* Card Integralização */}
          <div className="bg-gradient-to-b from-green-700 to-blue-800 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h2 className="text-2xl font-semibold mb-3">Integralização</h2>
            <p className="text-5xl font-bold">
              {curriculo.integralizacao != null
                ? `${Number(curriculo.integralizacao).toFixed(1)}%`
                : "—"}
            </p>
            
            {/* Barra de Progresso */}
            <div className="w-full bg-white/30 rounded-full h-3 mt-4">
              <div
                className="bg-green-400 h-3 rounded-full transition-all duration-1000"
                style={{
                  width: `${curriculo.integralizacao ? Math.min(Number(curriculo.integralizacao), 100) : 0}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-200 mt-2">
              {curriculo.ch_integralizada || 0}h / {curriculo.ch_exigida || 0}h
            </p>
          </div>

          {/* Card Matérias */}
          <div className="bg-gradient-to-b from-green-700 to-blue-800 text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h2 className="text-2xl font-semibold mb-3">Disciplinas</h2>
            <p className="text-5xl font-bold">{totalMaterias}</p>
            <p className="text-sm text-gray-200 mt-2">Matérias concluídas/matriculadas</p>
          </div>
        </div>

        {/* Tabela de Histórico */}
        <div className="max-w-6xl mx-auto border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Histórico Detalhado</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-green-700 text-white">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold">Período</th>
                  <th className="py-3 px-4 text-left font-semibold">Código</th>
                  <th className="py-3 px-4 text-left font-semibold">Disciplina</th>
                  <th className="py-3 px-4 text-center font-semibold">Menção</th>
                  <th className="py-3 px-4 text-center font-semibold">Créditos</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {curriculo.materias && curriculo.materias.length > 0 ? (
                  curriculo.materias.map((m, i) => (
                    <tr
                      key={i}
                      className={`border-b hover:bg-green-50 transition ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4">{m.periodo || "—"}</td>
                      <td className="py-3 px-4 font-mono text-sm">{m.codigo || "—"}</td>
                      <td className="py-3 px-4 font-medium">{m.nome || "—"}</td>
                      <td className={`py-3 px-4 text-center font-bold ${
                        ["SS", "MS", "MM"].includes(m.situacao || "") ? "text-green-600" : 
                        ["MI", "II", "SR"].includes(m.situacao || "") ? "text-red-600" : "text-gray-600"
                      }`}>
                        {m.situacao || m.situacao || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">{m.creditos ?? "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
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