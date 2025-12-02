"use client";

import { useEffect, useState } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";
import { FLUXOS_POR_CURSO } from "@/data/fluxos";

// --- Interfaces ---
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

interface MateriaRecomendada {
  codigo: string;
  nome: string;
}

export default function DadosPage() {
  const [dados, setDados] = useState<DadosAluno | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [obrigatoriasPendentes, setObrigatoriasPendentes] = useState<MateriaRecomendada[]>([]);
  const [optativasSugeridas, setOptativasSugeridas] = useState<MateriaRecomendada[]>([]);
  const [loadingRecomendacoes, setLoadingRecomendacoes] = useState(false);

  useEffect(() => {
    // --- FUNÇÕES AUXILIARES ---
    const shuffleArray = (array: string[]) => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    const fetchMateriaInfo = async (codigo: string, anoBase: string, periodoBase: string): Promise<string | null> => {
      const tryFetch = async (a: string, p: string) => {
        try {
          const res = await fetch(`/api/courses?search=${codigo}&year=${a}&period=${p}`);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              return data[0].name;
            }
          }
        } catch { return null; }
        return null;
      };

      let nome = await tryFetch(anoBase, periodoBase);
      if (nome) return nome;

      let anoAnt = parseInt(anoBase);
      let periodoAnt = parseInt(periodoBase);
      if (periodoAnt === 1) { periodoAnt = 2; anoAnt -= 1; } else { periodoAnt = 1; }
      
      nome = await tryFetch(anoAnt.toString(), periodoAnt.toString());
      if (nome) return nome;

      anoAnt -= 1; 
      nome = await tryFetch(anoAnt.toString(), "1");
      if (nome) return nome;

      return codigo;
    };

    const selecionarMelhoresMaterias = async (
      listaCandidata: string[], 
      ano: string, 
      periodo: string
    ): Promise<MateriaRecomendada[]> => {
      const lote = listaCandidata.slice(0, 6); 

      const resultados = await Promise.all(
          lote.map(async (codigo) => {
              const nome = await fetchMateriaInfo(codigo, ano, periodo);
              const valido = nome && nome !== codigo && nome !== "Disciplina UnB";
              return { codigo, nome: nome || codigo, valido };
          })
      );

      const validos = resultados.filter(r => r.valido);
      const invalidos = resultados.filter(r => !r.valido);

      const finais = [...validos, ...invalidos].slice(0, 3).map(r => ({
          codigo: r.codigo,
          nome: r.nome
      }));

      return finais;
    };

    const processarRecomendacoes = async (nomeCurso: string, historico: Materia[], ano: string, periodo: string) => {
      const cursoUpper = nomeCurso.toUpperCase();
      let chaveCurso = "SOFTWARE"; 

      if (cursoUpper.includes("AEROESPACIAL")) chaveCurso = "AEROESPACIAL";
      else if (cursoUpper.includes("AUTOMOTIVA")) chaveCurso = "AUTOMOTIVA";
      else if (cursoUpper.includes("ELETRONICA") || cursoUpper.includes("ELETRÔNICA")) chaveCurso = "ELETRONICA";
      else if (cursoUpper.includes("ENERGIA")) chaveCurso = "ENERGIA";
      
      const fluxo = FLUXOS_POR_CURSO[chaveCurso];

      if (!fluxo) {
          setLoadingRecomendacoes(false);
          return;
      }

      const cursadasCodigos = new Set(historico.map(m => m.codigo?.toUpperCase().trim()));

      const todasPendentes = fluxo.obrigatorias.filter(codigo => !cursadasCodigos.has(codigo));
      const todasOptativas = fluxo.optativas.filter(codigo => !cursadasCodigos.has(codigo));

      const pendentesEmbaralhadas = shuffleArray(todasPendentes);
      const optativasEmbaralhadas = shuffleArray(todasOptativas);

      const [finaisPendentes, finaisOptativas] = await Promise.all([
          selecionarMelhoresMaterias(pendentesEmbaralhadas, ano, periodo),
          selecionarMelhoresMaterias(optativasEmbaralhadas, ano, periodo)
      ]);

      setObrigatoriasPendentes(finaisPendentes);
      setOptativasSugeridas(finaisOptativas);
      setLoadingRecomendacoes(false);
    };

    // --- LÓGICA PRINCIPAL ---
    const init = async () => {
      const dadosSalvos = localStorage.getItem("dadosAluno");
      if (!dadosSalvos) {
        setLoading(false);
        return;
      }

      let dadosParsed: DadosAluno | null = null;
      try {
        dadosParsed = JSON.parse(dadosSalvos) as DadosAluno;
        setDados(dadosParsed);
      } catch (e) {
        console.error("Erro ao ler dados:", e);
        setLoading(false);
        return;
      }

      setLoading(false);

      if (dadosParsed?.aluno?.curso && dadosParsed?.curriculo?.materias) {
        setLoadingRecomendacoes(true);
        try {
          const resPeriod = await fetch("/api/year-period");
          let ano = "2024";
          let periodo = "2";

          if (resPeriod.ok) {
            const dataPeriod = await resPeriod.json();
            const periodos = dataPeriod["year/period"];
            if (Array.isArray(periodos) && periodos.length > 0) {
              const ultimo = periodos[periodos.length - 1];
              const periodoFormatado = ultimo.replace("/", "."); 
              [ano, periodo] = periodoFormatado.split(".");
            }
          }

          await processarRecomendacoes(
            dadosParsed.aluno.curso, 
            dadosParsed.curriculo.materias,
            ano,
            periodo
          );

        } catch (error) {
          console.error("Erro ao inicializar recomendações:", error);
          setLoadingRecomendacoes(false);
        }
      }
    };

    init();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center font-[Inter]">Carregando...</div>;

  if (!dados) {
    return (
      <>
        <Navbar2 />
        <main className="flex flex-col items-center justify-center h-screen text-gray-700 font-[Inter]">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#006633] to-[#003366] bg-clip-text text-transparent">
            Nenhum dado encontrado
          </h1>
          <p className="mt-2 text-lg">Envie seu histórico novamente para visualizar seus dados.</p>
          <a href="/upload" className="mt-6 px-6 py-2 bg-[#006633] text-white rounded-lg hover:bg-[#004d26] transition">
            Ir para Upload
          </a>
        </main>
      </>
    );
  }

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
        
        {/* Cabeçalho */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#006633] to-[#003366] bg-clip-text text-transparent pb-1">
            Meus Dados
          </h1>
          <p className="mt-2 text-xl font-medium text-gray-700">
            {nomeAluno} {matriculaAluno ? `— ${matriculaAluno}` : ""}
          </p>
          <p className="text-md text-gray-500">{cursoAluno}</p>
        </div>

        {/* Cards Principais */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {/* Card IRA */}
          <div className="bg-gradient-to-b from-[#006633] to-[#003366] text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h2 className="text-2xl font-semibold mb-3">IRA Atual</h2>
            <p className="text-5xl font-bold">
              {indices?.ira !== null && indices?.ira !== undefined ? Number(indices.ira).toFixed(4) : "—"}
            </p>
            <p className="text-sm text-gray-200 mt-2">Índice de Rendimento Acadêmico</p>
          </div>

          {/* Card Integralização */}
          <div className="bg-gradient-to-b from-[#006633] to-[#003366] text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h2 className="text-2xl font-semibold mb-3">Integralização</h2>
            <p className="text-5xl font-bold">
              {curriculo.integralizacao != null ? `${Number(curriculo.integralizacao).toFixed(1)}%` : "—"}
            </p>
            <div className="w-full bg-white/30 rounded-full h-3 mt-4">
              <div
                className="bg-green-400 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${curriculo.integralizacao ? Math.min(Number(curriculo.integralizacao), 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-200 mt-2">
              {curriculo.ch_integralizada || 0}h / {curriculo.ch_exigida || 0}h
            </p>
          </div>

          {/* Card Disciplinas */}
          <div className="bg-gradient-to-b from-[#006633] to-[#003366] text-white p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform">
            <h2 className="text-2xl font-semibold mb-3">Disciplinas</h2>
            <p className="text-5xl font-bold">{totalMaterias}</p>
            <p className="text-sm text-gray-200 mt-2">Matérias concluídas/matriculadas</p>
          </div>
        </div>

        {/* --- SEÇÃO DE RECOMENDAÇÕES --- */}
        <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto mb-12">
          
          {/* Card Pendentes */}
          <div className="flex-1 bg-gradient-to-b from-[#006633] to-[#003366] rounded-2xl p-8 shadow-xl flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-2">Matérias Pendentes</h2>
            <p className="text-green-100 text-sm mb-6">
              Algumas matérias obrigatórias para você pegar no próximo semestre
            </p>

            <div className="flex flex-col gap-3">
              {loadingRecomendacoes ? (
                 <p className="text-center text-white/70 py-4">Carregando sugestões...</p>
              ) : obrigatoriasPendentes.length > 0 ? (
                obrigatoriasPendentes.map((m) => (
                  <div key={m.codigo} className="bg-white/90 text-gray-800 rounded-xl p-4 flex justify-between items-center hover:-translate-y-1 transition-all shadow-sm min-h-[80px]">
                    <div className="flex flex-col justify-center max-w-[80%]">
                      <span className="font-bold text-[#003366] text-base mb-1 line-clamp-2 leading-tight">
                        {m.nome}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">
                        {m.codigo}
                      </span>
                    </div>
                    <span className="bg-[#003366] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2">
                        Alta
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-green-200 text-sm mt-4">
                  Nenhuma obrigatória pendente encontrada.
                </p>
              )}
            </div>
          </div>

          {/* Card Sugestões */}
          <div className="flex-1 bg-gradient-to-b from-[#006633] to-[#003366] rounded-2xl p-8 shadow-xl flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-2">Sugestões de Optativas</h2>
            <p className="text-green-100 text-sm mb-6">
              Algumas sugestões de matérias para você pegar semestre que vem
            </p>

            <div className="flex flex-col gap-3">
              {loadingRecomendacoes ? (
                 <p className="text-center text-white/70 py-4">Carregando sugestões...</p>
              ) : optativasSugeridas.length > 0 ? (
                optativasSugeridas.map((m) => (
                  <div key={m.codigo} className="bg-white/90 text-gray-800 rounded-xl p-4 flex justify-between items-center hover:-translate-y-1 transition-all shadow-sm min-h-[80px]">
                    <div className="flex flex-col justify-center max-w-[80%]">
                      <span className="font-bold text-[#003366] text-base mb-1 line-clamp-2 leading-tight">
                        {m.nome}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">
                        {m.codigo}
                      </span>
                    </div>
                    <span className="bg-[#003366] text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ml-2">
                        Alta
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-green-200 text-sm mt-4">
                  Nenhuma optativa encontrada.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabela de Histórico */}
        <div className="max-w-6xl mx-auto border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gray-50 p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Histórico Detalhado</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-[#006633] text-white">
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
                    <tr key={i} className={`border-b hover:bg-green-50 transition ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                      <td className="py-3 px-4">{m.periodo || "—"}</td>
                      <td className="py-3 px-4 font-mono text-sm">{m.codigo || "—"}</td>
                      <td className="py-3 px-4 font-medium">{m.nome || "—"}</td>
                      <td className={`py-3 px-4 text-center font-bold ${
                        ["SS", "MS", "MM", "APROVADO", "APR"].includes(m.situacao || "") ? "text-[#006633]" : 
                        ["MI", "II", "SR", "REP", "TR"].includes(m.situacao || "") ? "text-red-600" : "text-gray-600"
                      }`}>
                        {m.situacao || "—"}
                      </td>
                      <td className="py-3 px-4 text-center">{m.creditos ?? "—"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">Nenhuma disciplina encontrada.</td>
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