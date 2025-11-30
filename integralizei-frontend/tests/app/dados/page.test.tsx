import { render, screen, waitFor, act } from "@testing-library/react";
import DadosPage from "../../../src/app/dados/page";
import "@testing-library/jest-dom";

// 1. Mock do Navbar
jest.mock("@/components/Navbar2/Navbar2", () => {
  return function DummyNavbar() {
    return <div data-testid="navbar">Navbar Mock</div>;
  };
});

// 2. Mock do LocalStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// 3. Mock do Fetch (API)
global.fetch = jest.fn((url: string) => {
  // Mock da API de Período (FORMATO CORRIGIDO COM PONTO)
  if (url.includes("year-period")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ "year/period": ["2024.1", "2024.2"] }),
    });
  }

  // Mock da API de Cursos (Busca de nomes)
  if (url.includes("courses")) {
    // Extrai o código da URL para devolver um nome dinâmico
    const urlObj = new URL(url, "http://localhost");
    const search = urlObj.searchParams.get("search");
    
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 1,
          code: search,
          name: `Disciplina Teste ${search}`,
        }
      ]),
    });
  }

  return Promise.reject(new Error("URL desconhecida no teste"));
}) as jest.Mock;

describe("Página de Dados (Dashboard)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("deve exibir mensagem de 'Nenhum dado encontrado' quando o localStorage estiver vazio", async () => {
    await act(async () => {
      render(<DadosPage />);
    });

    await waitFor(() => {
      const mensagem = screen.getByText("Nenhum dado encontrado");
      expect(mensagem).toBeInTheDocument();
    });
  });

  it("deve carregar dados do aluno, calcular recomendações e exibir nomes das matérias", async () => {
    // Dados Mockados de um aluno de Software
    const dadosMock = {
      aluno: { nome: "Ana Teste", matricula: "202012345", curso: "ENGENHARIA DE SOFTWARE" },
      indices: { ira: 4.2 },
      curriculo: { 
        integralizacao: 45.5, 
        materias: [
            { codigo: "MAT0025", nome: "Cálculo 1", situacao: "APR" } 
        ] 
      }
    };

    window.localStorage.setItem("dadosAluno", JSON.stringify(dadosMock));

    await act(async () => {
      render(<DadosPage />);
    });

    // 1. Verifica dados básicos
    await waitFor(() => {
      expect(screen.getByText(/Ana Teste/i)).toBeInTheDocument();
      expect(screen.getByText("4.2000")).toBeInTheDocument();
    });

    // 2. Verifica se as seções de recomendação apareceram
    await waitFor(() => {
      expect(screen.getByText("Matérias Pendentes")).toBeInTheDocument();
      expect(screen.getByText("Sugestões de Optativas")).toBeInTheDocument();
    });

    // 3. Verifica se renderizou o card com o nome fictício (Mock)
    await waitFor(() => {
        const cards = screen.getAllByText(/Disciplina Teste/i);
        expect(cards.length).toBeGreaterThan(0);
    });
  });
});