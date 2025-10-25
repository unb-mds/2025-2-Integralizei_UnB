"use client";

import { useState } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";



export default function Page() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [period, setPeriod] = useState(1);
  const [disciplinas, setDisciplinas] = useState<any[]>([]);
  const [error, setError] = useState("");

  async function handleSearch() {
    
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
      <div style={{ padding: "20px" }}>
        <h1>Busca de Disciplinas</h1>

        <div>
          
          <input
            type="text"
            placeholder="Código ou nome da disciplina"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ marginRight: "10px" }}
          />
          <input
            type="number"
            placeholder="Ano"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{ marginRight: "10px", width: "80px" }}
          />
          <input
            type="number"
            placeholder="Período"
            value={period}
            onChange={(e) => setPeriod(parseInt(e.target.value))}
            style={{ marginRight: "10px", width: "80px" }}
          />
          <button onClick={handleSearch}>Buscar</button>
        </div>

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