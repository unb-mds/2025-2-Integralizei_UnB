"use client";

import { useState } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";
import styles from "./pesquisa.module.css"; 

export default function Page() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState(1);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [error, setError] = useState("");

  
  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault(); // Impede o reload
    
    try {
      setError("");
      const response = await fetch(
        `/api/courses/?search=${search}&year=${year}&period=${period}`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data = await response.json();

      data.forEach((d: any) => {
        try {
          if (typeof d.classes === "string") {
            d.classes = JSON.parse(d.classes);
          }
        } catch {
          d.classes = [];
        }
      });

      setDisciplinas(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  }

  return (
    <>
      <Navbar2 />
      
      <div className={styles.pageContainer}>
        
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Pesquisa</h1>
          <p className={styles.subtitle}>
            Simule sua integralização e veja como ela estará no proximo semestre
          </p>
        </section>
        
        
        <form className={styles.searchForm} onSubmit={handleSearch}>
          
          
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Código ou nome da disciplina"
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
                onChange={(e) => setYear(parseInt(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="period-input">Período</label>
              <input
                id="period-input"
                type="number"
                className={styles.numberInput}
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
              />
            </div>
          </div>
        </form>
      
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* resultados */}
        <div style={{ marginTop: "20px" }}>
          {disciplinas.length === 0 ? (
            <p>Nenhuma disciplina encontrada.</p>
          ) : (
            disciplinas.map((disciplina) => (
              <div key={disciplina.id} style={{ marginBottom: "20px" }}>
                <h2>{disciplina.name}</h2>
                <p>
                  <strong>Código:</strong> {disciplina.code}
                </p>
                <p>
                  <strong>Departamento:</strong> {disciplina.department?.code}
                </p>

                {disciplina.classes && disciplina.classes.length > 0 ? (
                  <div style={{ marginLeft: "20px" }}>
                    <h3>Turmas:</h3>
                    {disciplina.classes.map((turma: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid #ccc",
                          padding: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <p>
                          <strong>Turma:</strong> {turma._class}
                        </p>
                        <p>
                          <strong>Professores:</strong>{" "}
                          {turma.teachers.join(", ")}
                        </p>
                        <p>
                          <strong>Sala:</strong> {turma.classroom}
                        </p>
                        <p>
                          <strong>Horário:</strong> {turma.schedule}
                        </p>
                        <p>
                          <strong>Dias:</strong> {turma.days.join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Nenhuma turma encontrada para esta disciplina.</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </> 
  );
}