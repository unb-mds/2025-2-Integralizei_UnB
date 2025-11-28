"use client";

import { useState } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";
import styles from "./pesquisa.module.css";

// =========================
// Tipagens auxiliares
// =========================
interface Turma {
  _class: string;
  teachers: string[];
  classroom: string;
  schedule: string;
  days: string[];
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

export default function Page() {
  const [search, setSearch] = useState<string>("");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [period, setPeriod] = useState<number>(1);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [error, setError] = useState<string>("");

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // evita reload da página

    try {
      setError("");
      const response = await fetch(
        `/api/courses/?search=${search}&year=${year}&period=${period}`
      );

     if (!response.ok) {
      console.error("Erro na API:", response.statusText);
      setError("Houve um problema na busca. Verifique os dados.");
      return; 
    }
      
      const data: Disciplina[] = await response.json();

      // converter classes se vierem como string
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
        {/* Cabeçalho */}
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Pesquisa</h1>
          <p className={styles.subtitle}>
            Simule sua integralização e veja como ela estará no próximo semestre.
          </p>
        </section>

        {/* Formulário de busca */}
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
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </button>
          </div>

          {/* Opções de ano e período */}
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

        {/* Mensagem de erro */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Resultados */}
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
                  <strong>Departamento:</strong>{" "}
                  {disciplina.department?.code ?? "—"}
                </p>

                {disciplina.classes && disciplina.classes.length > 0 ? (
                  <div style={{ marginLeft: "20px" }}>
                    <h3>Turmas:</h3>
                    {disciplina.classes.map((turma, index) => (
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
