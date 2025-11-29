"use client";

import { useState } from "react";
import styles from "../../app/pesquisa/pesquisa.module.css"; 

interface Turma {
  _class: string;
  teachers: string[];
  classroom: string;
  schedule: string;
  days: string[];
  favorited?: boolean;
}

interface TurmaCardProps {
  turma: Turma;
  disciplinaCode: string;
  disciplinaName: string;
}

export default function TurmaCard({ turma, disciplinaCode, disciplinaName }: TurmaCardProps) {
  const [expandido, setExpandido] = useState(false);

  const toggleRanking = () => {
    setExpandido(!expandido);
  };

  return (
    //  Container invisível que segura o Card + o Ranking
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "20px" }}>
      
      {/*  Card  */}
      <div 
        className={styles.materiaCard} 
        
        style={{ marginBottom: expandido ? "0" : "0", transition: "margin 0.2s" }}
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

      {/* Área do Ranking */}
      {expandido && (
        <div style={{ 
            width: '95%', 
            backgroundColor: 'transparent', 
            padding: '20px',
            border: '1px solid #ddd', 
            borderTop: 'none', 
            borderRadius: '0 0 15px 15px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
            animation: 'fadeIn 0.3s ease-in-out'
        }}>
            <p style={{textAlign: 'center', color: '#333'}}>
                Aqui entrará o Ranking... (No fundo branco da página)
            </p>
        </div>
      )}

      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}