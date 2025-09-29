// app/page.tsx
"use client"; 

import { useState } from 'react';


type Discipline = {
  id: number;
  name: string;
  code: string;
  department: {
    code: string;
  };
};

export default function SearchPage() {
 
  const [searchTerm, setSearchTerm] = useState("");
  const [year, setYear] = useState(new Date().getFullYear()); 
  const [period, setPeriod] = useState(1);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false); 

  //função para Buscar na API 
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setSearched(true); 
    setDisciplines([]); 

    try {
     
      const apiUrl = `https://api.suagradeunb.com.br/courses/?search=${searchTerm}&year=${year}&period=${period}`;
      
      const response = await fetch(apiUrl);

      if (!response.ok) {
        
        throw new Error(`Erro na API: ${response.statusText}`);
      }

      const data = await response.json();
      setDisciplines(data);

    } catch (err) {
      console.error("Falha ao buscar disciplinas:", err);
      setError("Não foi possível carregar as disciplinas. Verifique os filtros ou tente novamente mais tarde.");
    } finally {
     
      setLoading(false);
    }
  };

  return (
    <main style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <div>
        <h1>🔎 Busca de Disciplinas - UnB</h1>
        <p>Encontre disciplinas por nome ou código</p>
        
        <hr style={{ margin: '1rem 0' }} />

        {/* Formulário de Busca */}
        <div>
          <label htmlFor="search-term">Nome ou código da disciplina:</label>
          <br />
          <input
            id="search-term"
            type="text"
            placeholder="Ex: Cálculo 1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '1rem' }}
          />

          <div>
            <label htmlFor="year-input" style={{ marginRight: '1rem' }}>Ano:</label>
            <input
              id="year-input"
              type="number"
              placeholder="Ano"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              style={{ padding: '8px', marginRight: '1rem' }}
            />

            <label htmlFor="period-input" style={{ marginRight: '1rem' }}>Período:</label>
            <input
              id="period-input"
              type="number"
              placeholder="Período"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              style={{ padding: '8px' }}
            />
          </div>

          <br />
          <button 
            onClick={handleSearch} 
            disabled={loading}
            style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer' }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        <hr style={{ margin: '2rem 0' }} />

        {/* Área de Resultados */}
        <div>
          <h2>Resultados</h2>
          {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}
          
          {disciplines.length > 0 && (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {disciplines.map((d) => (
                <li 
                  key={d.id} 
                  style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '1rem', marginBottom: '1rem' }}
                >
                  <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.5rem' }}>{d.name}</strong>
                  <span>Código: {d.code}</span>
                  <br />
                  <span>Departamento: {d.department?.code || 'N/A'}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Mensagem para quando a busca não retorna resultados */}
          {searched && !loading && disciplines.length === 0 && !error && (
            <p>Nenhuma disciplina encontrada com esses critérios.</p>
          )}
        </div>
      </div>
    </main>
  );
}
