"use client";

import { useState } from "react";
import styles from "../../app/pesquisa/pesquisa.module.css"; 

// Interfaces
interface Turma {
  _class: string;
  teachers: string[];
  classroom: string;
  schedule: string;
  days: string[];
  favorited?: boolean;
}

interface RankingItem {
  posicao: number;
  integralizacao: string;
}

interface TurmaCardProps {
  turma: Turma;
  disciplinaCode: string;
  disciplinaName: string;
}

export default function TurmaCard({ turma, disciplinaCode, disciplinaName }: TurmaCardProps) {
  const [expandido, setExpandido] = useState(false);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const toggleRanking = async () => {
const toggleRanking = async () => {
    if (expandido) {
      setExpandido(false);
      return;
    }
    setExpandido(true);
    if (ranking.length > 0) return;

    setLoading(true);
    setError("");
    
    try {
      const professorNome = turma.teachers && turma.teachers.length > 0 ? turma.teachers[0] : "";
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      let url = `${baseUrl}/api/ranking/${disciplinaCode}`;
      // ---------------------
      
      if (professorNome) {
        url += `?professor=${encodeURIComponent(professorNome)}`;
      }

      const res = await fetch(url);
      
      if (!res.ok) throw new Error("Erro ao buscar ranking");
      const data = await res.json();
      setRanking(data);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar o ranking.");
    } finally {
      setLoading(false);
   }
 };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
      
      {/* --- CARD DA DISCIPLINA --- */}
      <div 
        className={styles.materiaCard} 
        style={{ marginBottom: expandido ? "0" : "0", transition: "margin 0.2s", zIndex: 2 }}
      >
        <div className={styles.materiaInfo}>
          <p className={styles.titulo}>
            {disciplinaCode} - {disciplinaName}
          </p>
          <p className={styles.subtitulo}>
            Professores: {turma.teachers.join(", ")}
          </p>
          <p className={styles.subtitulo}>Turma: {turma._class}</p>
          <p className={styles.subtitulo} style={{ fontSize: "0.9rem", opacity: 0.8 }}>
            {turma.schedule} | {turma.days.join(", ")}
          </p>
        </div>

        <div className={styles.materiaActions} style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className={`${styles.favoriteBtn} ${turma.favorited ? styles.favorited : ""}`}
            onClick={() => console.log(`Favoritou turma ${turma._class}`)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span>{turma.favorited ? "Salvo" : "Favoritar"}</span>
          </button>

          <button 
              className={`${styles.botaoSeta} ${expandido ? styles.expandido : ""}`}
              onClick={toggleRanking}
              title="Ver Ranking"
          >
          </button>
        </div>
      </div>

      {/* ---  ÁREA DO RANKING --- */}
      {expandido && (
        <div className={styles.rankingContainer}>
            
            {loading && <p style={{textAlign: 'center', padding: '20px'}}>Carregando...</p>}
            
            {error && <p style={{textAlign: 'center', color: '#ffaaaa', padding: '20px'}}>{error}</p>}

            {!loading && !error && ranking.length === 0 && (
                <p style={{textAlign: 'center', padding: '20px'}}>Nenhum dado encontrado para esta disciplina.</p>
            )}

            {!loading && !error && ranking.length > 0 && (
                <>
                    {/* Cabeçalho */}
                    <div className={`${styles.rankingLinha} ${styles.rankingHeader}`}>
                        <span>Posição</span>
                        <span>Integralização</span>
                    </div>

                    {/* Lista de Alunos */}
                    {ranking.map((item, index) => (
                        <div key={index} className={`${styles.rankingLinha} ${styles.rankingAluno}`}>
                            <span>{item.posicao}º</span>
                            <span>{item.integralizacao}</span>
                        </div>
                    ))}
                </>
            )}
        </div>
      )}
    </div>
  );
}