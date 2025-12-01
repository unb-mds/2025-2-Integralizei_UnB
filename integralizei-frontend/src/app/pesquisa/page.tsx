"use client";

import { useState, useEffect } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";
import styles from "./pesquisa.module.css";
import TurmaCard from "../../components/TurmaCard/TurmaCard"; 

// =========================
// Tipagens auxiliares
// =========================
interface Turma {
  _class: string;
  teachers: string[];
  classroom: string;
  schedule: string;
  days: string[];
  favorited?: boolean;
}

interface Departamento {
  code: string;
}

interface Disciplina {
  id: number;
  name: string;
  code: string;
  department?: Departamento;
  classes?: Turma[];
}

export default function PesquisaPage() {
  const [search, setSearch] = useState<string>("");
  
  // Valores padrão iniciais (fallback)
  const [year, setYear] = useState<number>(2025);
  const [period, setPeriod] = useState<number>(1);
  
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [error, setError] = useState<string>("");

  // --- Busca o ano/período atual AUTOMATICAMENTE ao carregar ---
  useEffect(() => {
    async function fetchCurrentPeriod() {
      try {
        // Chama nossa nova rota local
        const response = await fetch("/api/year-period"); 
        
        if (response.ok) {
          const data = await response.json();
          // A API retorna: { "year/period": ["2024/2", "2025/1"] }
          const periodos = data["year/period"];
          
          if (periodos && Array.isArray(periodos) && periodos.length > 0) {
            // Pega o último item da lista (semestre mais recente)
            const ultimoPeriodo = periodos[periodos.length - 1]; // Ex: "2025/1" ou "2025/2"
            
            if (ultimoPeriodo && ultimoPeriodo.includes('/')) {
                const [anoApi, periodoApi] = ultimoPeriodo.split("/");
                setYear(parseInt(anoApi));
                setPeriod(parseInt(periodoApi));
            }
          }
        }
      } catch (err) {
        console.error("Falha ao buscar período atual, usando padrão:", err);
      }
    }

    fetchCurrentPeriod();
  }, []);

  // --- Função de Busca de Disciplinas ---
  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); 

    try {
      setError("");
      // Chama a API interna de cursos
      const response = await fetch(
        `/api/courses/?search=${search}&year=${year}&period=${period}`
      );

     if (!response.ok) {
      console.error("Erro na API:", response.statusText);
      setError("Houve um problema na busca. Verifique os dados.");
      return; 
    }
      
      const data: Disciplina[] = await response.json();

      // Tratamento de dados para converter string JSON em objeto
      data.forEach((d) => {
        if (typeof d.classes === "string") {
          try {
            d.classes = JSON.parse(d.classes as unknown as string);
          } catch {
            d.classes = [];
          }
        }
      });

      setDisciplinas(data);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      setError(msg);
    }
  }

  return (
    <>
      <Navbar2 />
      
      <div className={styles.pageContainer}>
        
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Pesquisa</h1>
          <p className={styles.subtitle}>
            Simule sua integralização e veja como ela estará no próximo semestre
          </p>
        </section>
        
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Código, nome da Disciplina ou Professor"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className={styles.searchButton}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </div>

          <div className={styles.optionsContainer}>
            <div className={styles.inputGroup}>
              <label htmlFor="year-input">Ano</label>
              <input
                id="year-input"
                type="number"
                className={styles.numberInput}
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="period-input">Período</label>
              <input
                 id="period-input"
                type="number"
                value={isNaN(period) ? "" : period}
                className={styles.numberInput}
                onChange={(e) => setPeriod(parseInt(e.target.value, 10))}
              />
            </div>
          </div>
        </form>
      
        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {/* Lista de Resultados */}
        <div style={{ marginTop: "20px", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {disciplinas.length === 0 && !error ? (
            <p style={{color: "#666"}}>Nenhuma disciplina encontrada.</p>
          ) : (
            disciplinas.map((disciplina) => (
              <div key={disciplina.id} style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
                
                {disciplina.classes && disciplina.classes.length > 0 ? (
                    <>
                      {disciplina.classes.map((turma, index) => (
                        
                        <TurmaCard 
                          key={index}
                          turma={turma}
                          disciplinaCode={disciplina.code}
                          disciplinaName={disciplina.name}
                        />
                      ))}
                    </>
                  ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </> 
  );
}