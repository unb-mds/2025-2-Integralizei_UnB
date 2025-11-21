"use client";

import { useState } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";
<<<<<<< HEAD
import styles from "./pesquisa.module.css"; 

export default function Page() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState(1);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [error, setError] = useState("");

  
  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault(); // Impede o reload
    
=======
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

>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
    try {
      setError("");
      const response = await fetch(
        `/api/courses/?search=${search}&year=${year}&period=${period}`
      );

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.statusText}`);
      }

<<<<<<< HEAD
      const data = await response.json();

      data.forEach((d: any) => {
        try {
          if (typeof d.classes === "string") {
            d.classes = JSON.parse(d.classes);
          }
        } catch {
          d.classes = [];
=======
      const data: Disciplina[] = await response.json();

      // converter classes se vierem como string
      data.forEach((d) => {
        if (typeof d.classes === "string") {
          try {
            d.classes = JSON.parse(d.classes as unknown as string);
          } catch {
            d.classes = [];
          }
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
        }
      });

      setDisciplinas(data);
<<<<<<< HEAD
    } catch (err: any) {
      console.error(err);
      setError(err.message);
=======
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erro desconhecido.";
      setError(msg);
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
    }
  }

  return (
    <>
      <Navbar2 />
<<<<<<< HEAD
      
      <div className={styles.pageContainer}>
        
        <section className={styles.headerSection}>
          <h1 className={styles.title}>Pesquisa</h1>
          <p className={styles.subtitle}>
            Simule sua integralização e veja como ela estará no proximo semestre
          </p>
        </section>
        
        
        <form className={styles.searchForm} onSubmit={handleSearch}>
          
          
=======

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
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Código ou nome da disciplina"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" className={styles.searchButton}>
<<<<<<< HEAD
              
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
=======
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
              </svg>
            </button>
          </div>

<<<<<<< HEAD
=======
          {/* Opções de ano e período */}
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
          <div className={styles.optionsContainer}>
            <div className={styles.inputGroup}>
              <label htmlFor="year-input">Ano</label>
              <input
                id="year-input"
                type="number"
                className={styles.numberInput}
                value={year}
<<<<<<< HEAD
                onChange={(e) => setYear(parseInt(e.target.value))}
=======
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="period-input">Período</label>
              <input
                id="period-input"
                type="number"
                className={styles.numberInput}
                value={period}
<<<<<<< HEAD
                onChange={(e) => setPeriod(parseInt(e.target.value))}
=======
                onChange={(e) => setPeriod(parseInt(e.target.value, 10))}
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
              />
            </div>
          </div>
        </form>
<<<<<<< HEAD
      
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* resultados */}
=======

        {/* Mensagem de erro */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* Resultados */}
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
        <div style={{ marginTop: "20px" }}>
          {disciplinas.length === 0 ? (
            <p>Nenhuma disciplina encontrada.</p>
          ) : (
            disciplinas.map((disciplina) => (
              <div key={disciplina.id} style={{ marginBottom: "20px" }}>
<<<<<<< HEAD
                
                {disciplina.classes && disciplina.classes.length > 0 ? (
                  <div style={{ marginLeft: "20px" }}>
                    
                    {disciplina.classes.map((turma: any, index: number) => (
                      <div key={index} className={styles.materiaCard}>
                        <div className={styles.materiaInfo}>
                          <p className={styles.titulo}>
                            {disciplina.code} - {disciplina.name}
                          </p>
                          <p className={styles.subtitulo}>
                            {turma.teachers.join(", ")}
                          </p>
                          <p className={styles.subtitulo}>Turma: {turma._class}</p>

                        </div>

                        <div className={styles.materiaActions}>
                          <div className={`${styles.botaoSeta} ${styles.baixo}`}></div>

                          <button
                            className={`${styles.favoriteBtn} ${turma.favorited ? styles.favorited : ""}`}
                            onClick={() => {}}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <span>Favoritar</span>
                          </button>
                        </div>
                      </div>

=======
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
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
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
<<<<<<< HEAD
    </> 
  );
}
=======
    </>
  );
}
>>>>>>> 460a0d0dd2e02e76cc5ed7509f964937399e6b86
