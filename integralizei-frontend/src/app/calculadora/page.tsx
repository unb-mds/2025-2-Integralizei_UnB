"use client";

import { useState, useEffect, useRef } from "react";
import Navbar2 from "../../components/Navbar2/Navbar2";
import styles from "./calculadora.module.css";
import { Search, Plus, Trash2, User, BookOpen } from "lucide-react";
import jsPDF from "jspdf";

// --- DICIONÁRIO DE FALLBACK ---
const CREDITOS_FIXOS: Record<string, number> = {
  "CIC0201": 4, 
  "MAT0025": 6, "MAT0026": 6, "MAT0027": 6,
};

// --- TIPAGEM ---
interface Turma {
  _class: string;
  teachers: string[];
  schedule: string;
  days: string[];
}

interface MateriaAPI {
  id: number;
  code: string;
  name: string;
  classes: Turma[] | string; 
  credits?: number; 
}

interface Materia {
  uid: string; 
  id: string; 
  nome: string;
  creditos: number;
  professor: string;
  turma: string;
}

// --- COMPONENTE DE NÚMERO ---
function AnimatedNumber({ value, isPercentage = false }: { value: number, isPercentage?: boolean }) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const start = previousValue.current;
    const end = value;
    const duration = 400; 
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      
      const current = start + (end - start) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span>
      {isPercentage ? displayValue.toFixed(2) : Math.round(displayValue)}
      {isPercentage && "%"}
    </span>
  );
}

export default function CalculadoraPage() {
  const [resultadosBusca, setResultadosBusca] = useState<Materia[]>([]);
  const [selecionadas, setSelecionadas] = useState<Materia[]>([]);
  
  const [buscaMateria, setBuscaMateria] = useState("");
  const [buscaProfessor, setBuscaProfessor] = useState("");
  const [loadingBusca, setLoadingBusca] = useState(false);
  
  const [year, setYear] = useState<number>(2025);
  const [period, setPeriod] = useState<number>(1);
  const [semestreAtual, setSemestreAtual] = useState<{ano: number, periodo: number}>({ ano: 2025, periodo: 1 });

  const [porcentagemBase, setPorcentagemBase] = useState(0);
  const [pesoCredito, setPesoCredito] = useState(0.45); 
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dadosSalvos = localStorage.getItem("dadosAluno");
    if (dadosSalvos) {
      try {
        const dados = JSON.parse(dadosSalvos);
        let integ = dados.curriculo?.integralizacao || 0;
        if (integ <= 1) integ = integ * 100; 
        setPorcentagemBase(Number(integ));

        const chExigida = Number(dados.curriculo?.ch_exigida);
        if (chExigida && chExigida > 0) {
            const peso = (15 / chExigida) * 100;
            setPesoCredito(peso);
        }
      } catch (e) {
        console.error("Erro ao ler dados do aluno:", e);
      }
    }

    async function fetchPeriod() {
      try {
        const res = await fetch("/api/year-period");
        if (res.ok) {
          const data = await res.json();
          const periodos = data["year/period"];
          if (periodos && periodos.length > 0) {
            const ultimo = periodos[periodos.length - 1];
            const [anoApi, periodoApi] = ultimo.split("/");
            setYear(Number(anoApi));
            setPeriod(Number(periodoApi));
            setSemestreAtual({ ano: Number(anoApi), periodo: Number(periodoApi) });
          }
        }
      } catch (error) {
        console.error("Erro ao buscar período:", error);
      }
    }
    fetchPeriod();
  }, []);

  const selecionarSemestre = (tipo: 'atual' | 'anterior') => {
    if (tipo === 'atual') {
      setYear(semestreAtual.ano);
      setPeriod(semestreAtual.periodo);
    } else {
      if (semestreAtual.periodo === 1) {
        setYear(semestreAtual.ano - 1);
        setPeriod(2);
      } else {
        setYear(semestreAtual.ano);
        setPeriod(1);
      }
    }
    setResultadosBusca([]);
  };
  
  const getTextoSemestreAnterior = () => {
    if (semestreAtual.periodo === 1) return `${semestreAtual.ano - 1}.2`;
    return `${semestreAtual.ano}.1`;
  };

  const realizarBusca = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!buscaMateria.trim()) return;

    setLoadingBusca(true);
    try {
      const res = await fetch(`/api/courses/?search=${buscaMateria}&year=${year}&period=${period}`);
      if (!res.ok) throw new Error("Erro na busca");

      const data: MateriaAPI[] = await res.json();
      const materiasFormatadas: Materia[] = [];

      data.forEach((item) => {
        let classes: Turma[] = [];
        if (typeof item.classes === 'string') {
            try { classes = JSON.parse(item.classes); } catch { classes = []; }
        } else if (Array.isArray(item.classes)) {
            classes = item.classes;
        }

        if (classes.length > 0) {
            classes.forEach((turma) => {
                let creditosCalculados = (turma.days?.length || 0) * 2;
                if (creditosCalculados === 0) {
                    creditosCalculados = item.credits || CREDITOS_FIXOS[item.code] || 4;
                }

                materiasFormatadas.push({
                    uid: `${item.code}-${turma._class}`,
                    id: item.code,
                    nome: item.name,
                    creditos: creditosCalculados,
                    professor: turma.teachers?.[0] || "A definir",
                    turma: turma._class
                });
            });
        } else {
            const creditosFallback = item.credits || CREDITOS_FIXOS[item.code] || 4;
            materiasFormatadas.push({
                uid: item.code,
                id: item.code,
                nome: item.name,
                creditos: creditosFallback,
                professor: "—",
                turma: "—"
            });
        }
      });

      let disponiveis = materiasFormatadas.filter(
        m => !selecionadas.some(sel => sel.uid === m.uid)
      );

      if (buscaProfessor.trim()) {
        disponiveis = disponiveis.filter(m => 
          m.professor.toLowerCase().includes(buscaProfessor.toLowerCase())
        );
      }

      setResultadosBusca(disponiveis);

    } catch (error) {
      console.error("Erro na busca:", error);
      setResultadosBusca([]);
    } finally {
      setLoadingBusca(false);
    }
  };

  const moverMateria = (materia: Materia, direcao: 'adicionar' | 'remover') => {
    setExitingIds(prev => new Set(prev).add(materia.uid));

    setTimeout(() => {
      if (direcao === 'adicionar') {
        setResultadosBusca(prev => prev.filter(m => m.uid !== materia.uid));
        setSelecionadas(prev => [...prev, materia]);
      } else {
        setSelecionadas(prev => prev.filter(m => m.uid !== materia.uid));
        // Opcional: Se quiser que volte para a busca, descomente abaixo
        // setResultadosBusca(prev => [...prev, materia]);
      }
      setExitingIds(prev => {
        const novo = new Set(prev);
        novo.delete(materia.uid);
        return novo;
      });
    }, 250);
  };

  const totalCreditos = selecionadas.reduce((acc, curr) => acc + curr.creditos, 0);
  const novaIntegralizacao = porcentagemBase + (totalCreditos * pesoCredito);

  const createHeaderGradient = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#006633");
      gradient.addColorStop(1, "#003366");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL('image/png');
  };

  const createRoundedCardGradient = (w: number, h: number, radius: number) => {
    const canvas = document.createElement('canvas');
    const scale = 3; 
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(scale, scale);
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(w - radius, 0);
      ctx.quadraticCurveTo(w, 0, w, radius);
      ctx.lineTo(w, h - radius);
      ctx.quadraticCurveTo(w, h, w - radius, h);
      ctx.lineTo(radius, h);
      ctx.quadraticCurveTo(0, h, 0, h - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, 0, w, 0);
      gradient.addColorStop(0, "#006633");
      gradient.addColorStop(1, "#003366");
      ctx.fillStyle = gradient;
      ctx.fill();
    }
    return canvas.toDataURL('image/png');
  };

  const gerarPDF = () => {
    if (selecionadas.length === 0) {
      alert("Selecione matérias antes de salvar.");
      return;
    }
    const doc = new jsPDF();
    const headerImg = createHeaderGradient(500, 100);
    const cardImg = createRoundedCardGradient(180, 28, 4); 

    doc.addImage(headerImg, 'PNG', 0, 0, 210, 40);
    doc.setTextColor("#FFFFFF");
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Planejamento de Matrícula", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const dataHoje = new Date().toLocaleDateString('pt-BR');
    doc.text(`Semestre: ${year}.${period}  |  Data: ${dataHoje}`, 105, 32, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo da Simulação:", 14, 55);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(50);
    doc.text(`• Total de Créditos: ${totalCreditos}`, 14, 65);
    doc.text(`• Nova Integralização Estimada: ${novaIntegralizacao.toFixed(2)}%`, 14, 72);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Matérias Selecionadas:", 14, 90);

    let y = 100;
    const cardWidth = 180;
    const cardHeight = 28;
    const gapY = 10;
    const startX = 15;
    
    selecionadas.forEach((m) => {
        if (y + cardHeight > 280) {
            doc.addPage();
            y = 20; 
        }
        doc.addImage(cardImg, 'PNG', startX, y, cardWidth, cardHeight);
        doc.setTextColor("#FFFFFF");
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const nomeCurto = m.nome.length > 45 ? m.nome.substring(0, 42) + "..." : m.nome;
        doc.text(nomeCurto, startX + 5, y + 8);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(230, 230, 230); 
        doc.text(`${m.id}  -  Turma ${m.turma}`, startX + 5, y + 16);

        doc.setFont("helvetica", "italic");
        doc.text(`Prof. ${m.professor}`, startX + 5, y + 24);

        doc.setFillColor("#FFFFFF");
        doc.circle(startX + cardWidth - 15, y + 14, 8, 'F');
        
        doc.setTextColor("#006633"); 
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(m.creditos.toString(), startX + cardWidth - 15, y + 16, { align: "center" });
        y += cardHeight + gapY;
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.setFont("helvetica", "normal");
    doc.text("Gerado por Integralizei UnB", 105, pageHeight - 10, { align: "center" });
    doc.save("Planejamento_UnB.pdf");
  };

  const isSemestreAtual = year === semestreAtual.ano && period === semestreAtual.periodo;

  return (
    <>
      <Navbar2 />
      <div className={styles.pageContainer}>
        
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Calculadora</h1>
          <p className={styles.subtitle}>Busque matérias reais da UnB e simule sua integralização do próximo semestre</p>
        </div>

        <div className={styles.mainWrapper}>
          
          <div className={styles.calcContainer}>
            <h2>Buscar Matérias</h2>
            <p className={styles.containerSubtitle}>{year}.{period}</p>

            <form className={styles.searchForm} onSubmit={realizarBusca}>
              <div className={styles.searchContainer}>
                <input 
                  type="text" 
                  className={styles.searchInput} 
                  placeholder="Matéria (Ex: Cálculo 1)" 
                  value={buscaMateria}
                  onChange={(e) => setBuscaMateria(e.target.value)}
                  required 
                />
                {/* AQUI: Adicionado aria-label */}
                <button 
                  type="submit" 
                  className={styles.searchIcon} 
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label="Buscar" 
                >
                  <Search size={20} />
                </button>
              </div>

              <div className={styles.searchContainer}>
                <input 
                  type="text" 
                  className={styles.searchInput} 
                  placeholder="Professor (Opcional)" 
                  value={buscaProfessor}
                  onChange={(e) => setBuscaProfessor(e.target.value)}
                />
                <div className={styles.searchIcon}>
                   <User size={20} />
                </div>
              </div>
            </form>

            <div className={styles.bubblesContainer}>
              <div 
                className={`${styles.bubble} ${isSemestreAtual ? styles.active : ''}`}
                onClick={() => selecionarSemestre('atual')}
              >
                {semestreAtual.ano}.{semestreAtual.periodo} (Atual)
              </div>

              <div 
                className={`${styles.bubble} ${!isSemestreAtual ? styles.active : ''}`}
                onClick={() => selecionarSemestre('anterior')}
              >
                {getTextoSemestreAnterior()} (Anterior)
              </div>
            </div>

            <div className={styles.listaMaterias}>
              {loadingBusca ? (
                 <p style={{textAlign: "center", color: "#888", marginTop: "20px"}}>Carregando...</p>
              ) : resultadosBusca.length === 0 && buscaMateria ? (
                 <p style={{textAlign: "center", color: "#ccc", marginTop: "20px"}}>
                   Nenhuma matéria encontrada com esses filtros.
                 </p>
              ) : (
                resultadosBusca.map((m) => (
                  <div 
                    key={m.uid} 
                    className={`${styles.materiaCard} ${styles.fadeIn} ${exitingIds.has(m.uid) ? styles.fadeOut : ''}`}
                  >
                    <div className={styles.materiaInfo}>
                      <span className={styles.materiaCodigo}>{m.id} <span style={{fontWeight: 'normal', fontSize: '0.8em', color: '#666'}}>- Turma {m.turma}</span></span>
                      <span className={styles.materiaNome}>{m.nome}</span>
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', color: '#555', fontSize: '12px'}}>
                         <User size={12} /> 
                         <span style={{ fontWeight: buscaProfessor ? 'bold' : 'normal', color: buscaProfessor ? '#006633' : '#555' }}>
                           {m.professor}
                         </span>
                      </div>
                      <span className={styles.tagCreditos}>{m.creditos} créditos</span>
                    </div>
                    {/* AQUI: Adicionado aria-label */}
                    <button 
                      onClick={() => moverMateria(m, 'adicionar')} 
                      className={`${styles.actionBtn} ${styles.btnAdd}`}
                      aria-label={`Adicionar ${m.nome}`}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={styles.calcContainer}>
            <h2>Sua Simulação</h2>
            <p className={styles.containerSubtitle}>Matérias selecionadas</p>

            <div className={styles.statsHeader}>
              <div className={styles.statsRow}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    <AnimatedNumber value={totalCreditos} />
                  </span>
                  <span className={styles.statLabel}>Créditos Extras</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>
                    <AnimatedNumber value={Number(novaIntegralizacao)} isPercentage={true} />
                  </span>
                  <span className={styles.statLabel}>Nova Previsão</span>
                </div>
              </div>
            </div>

            <div className={styles.listaMaterias}>
              {selecionadas.length === 0 ? (
                <p style={{ textAlign: "center", color: "#eee", marginTop: "20px" }}>
                  Nenhuma matéria selecionada.
                </p>
              ) : (
                selecionadas.map((m) => (
                  <div 
                    key={m.uid} 
                    className={`${styles.materiaCard} ${styles.fadeIn} ${exitingIds.has(m.uid) ? styles.fadeOut : ''}`}
                  >
                    <div className={styles.materiaInfo}>
                      <span className={styles.materiaCodigo}>{m.id} <span style={{fontSize: '0.8em'}}>- {m.turma}</span></span>
                      <span className={styles.materiaNome}>{m.nome}</span>
                      <div style={{display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: '#555', fontSize: '11px'}}>
                         <BookOpen size={10} /> 
                         <span>{m.professor}</span>
                      </div>
                      <span className={styles.tagCreditos}>{m.creditos} créditos</span>
                    </div>
                    {/* AQUI: Adicionado aria-label */}
                    <button 
                      onClick={() => moverMateria(m, 'remover')} 
                      className={`${styles.actionBtn} ${styles.btnRemove}`}
                      aria-label={`Remover ${m.nome}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button onClick={gerarPDF} className={styles.btnSalvar}>
              Salvar Simulação (PDF)
            </button>
          </div>

        </div>
      </div>
    </>
  );
}