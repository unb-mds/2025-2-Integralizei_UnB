import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CalculadoraPage from "../../../src/app/calculadora/page";
import "@testing-library/jest-dom";

// --- MOCKS ---

// 1. Mock do Navbar
jest.mock("@/components/Navbar2/Navbar2", () => {
  return function DummyNavbar() {
    return <div data-testid="navbar">Navbar Mock</div>;
  };
});

// 2. Mock do jsPDF para não quebrar ao tentar gerar binário no teste
const mockSave = jest.fn();
jest.mock("jspdf", () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    text: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    setFillColor: jest.fn(),
    circle: jest.fn(),
    addPage: jest.fn(),
    internal: { pageSize: { height: 297 } },
    save: mockSave,
  }));
});

// 3. Mock do LocalStorage (igual aos outros testes)
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

// 4. Mock do Fetch (API)
global.fetch = jest.fn((url: string) => {
  // Mock da API de Período
  if (url.includes("year-period")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ "year/period": ["2024/2", "2025/1"] }),
    });
  }

  // Mock da API de Cursos (Busca)
  if (url.includes("courses")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          id: 1,
          code: "CIC0004",
          name: "Algoritmos e Programação de Computadores",
          credits: 4,
          classes: [
            { _class: "A", teachers: ["Professor APC"], schedule: "35T23", days: ["Ter", "Qui"] }
          ]
        },
        {
          id: 2,
          code: "MAT0025",
          name: "Cálculo 1",
          credits: 6,
          classes: JSON.stringify([ // Testando caso venha como string
            { _class: "B", teachers: ["Professor Calc"], schedule: "24M34", days: ["Seg", "Qua", "Sex"] }
          ])
        }
      ]),
    });
  }

  return Promise.reject(new Error("URL desconhecida no teste"));
}) as jest.Mock;


// --- SUÍTE DE TESTES ---

describe("Página de Calculadora", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("deve carregar corretamente e ler dados do aluno do localStorage", async () => {
    // Simula um aluno com 50% de integralização base
    const dadosMock = {
      curriculo: { integralizacao: 50.00, ch_exigida: 3000 }
    };
    window.localStorage.setItem("dadosAluno", JSON.stringify(dadosMock));

    await act(async () => {
      render(<CalculadoraPage />);
    });

    // Verifica título
    expect(screen.getByText("Calculadora")).toBeInTheDocument();
    
    // Verifica se carregou a porcentagem base (pode demorar pela animação, mas o texto deve aparecer)
    await waitFor(() => {
      // O AnimatedNumber pode renderizar 50 ou 50.00, usamos regex flexível
      const porcentagemElements = screen.getAllByText(/50/); 
      expect(porcentagemElements.length).toBeGreaterThan(0);
    });
  });

  it("deve realizar uma busca e exibir resultados", async () => {
    await act(async () => {
      render(<CalculadoraPage />);
    });

    const inputBusca = screen.getByPlaceholderText(/Matéria \(Ex: Cálculo 1\)/i);
    const btnBuscar = screen.getByLabelText("Buscar");

    fireEvent.change(inputBusca, { target: { value: "Algoritmos" } });
    
    await act(async () => {
      fireEvent.click(btnBuscar);
    });

    await waitFor(() => {
      expect(screen.getByText("Algoritmos e Programação de Computadores")).toBeInTheDocument();
      expect(screen.getByText("Cálculo 1")).toBeInTheDocument();
    });
  });

  it("deve adicionar uma matéria à lista de selecionadas e atualizar créditos", async () => {
    await act(async () => {
      render(<CalculadoraPage />);
    });

    // 1. Faz a busca
    const inputBusca = screen.getByPlaceholderText(/Matéria \(Ex: Cálculo 1\)/i);
    fireEvent.change(inputBusca, { target: { value: "Algoritmos" } });
    await act(async () => {
      fireEvent.click(screen.getByLabelText("Buscar"));
    });

    // 2. Espera aparecer e clica no botão de adicionar (+)
    await waitFor(() => {
        expect(screen.getByText("Algoritmos e Programação de Computadores")).toBeInTheDocument();
    });

    const btnAdd = screen.getByLabelText("Adicionar Algoritmos e Programação de Computadores");
    fireEvent.click(btnAdd);

    // 3. Verifica se foi para a coluna "Sua Simulação"
    // O item sai da lista de busca e vai para selecionadas.
    // Verificamos se o botão de remover (lixeira) apareceu para esse item
    await waitFor(() => {
        const btnRemove = screen.getByLabelText("Remover Algoritmos e Programação de Computadores");
        expect(btnRemove).toBeInTheDocument();
    });

    // 4. Verifica se atualizou créditos (APC tem 4 créditos)
    // O AnimatedNumber demora um pouco, então usamos waitFor
    await waitFor(() => {
        // Procura pelo número 4 nos stats
        const creditosExtras = screen.getByText("4"); 
        expect(creditosExtras).toBeInTheDocument();
    });
  });

  it("deve gerar o PDF ao clicar no botão salvar", async () => {
    await act(async () => {
      render(<CalculadoraPage />);
    });

    // Precisamos adicionar uma matéria primeiro, senão o botão alerta e não salva
    const inputBusca = screen.getByPlaceholderText(/Matéria \(Ex: Cálculo 1\)/i);
    fireEvent.change(inputBusca, { target: { value: "Algoritmos" } });
    await act(async () => {
        fireEvent.click(screen.getByLabelText("Buscar"));
    });

    await waitFor(() => expect(screen.getByText("Algoritmos e Programação de Computadores")).toBeInTheDocument());
    
    fireEvent.click(screen.getByLabelText("Adicionar Algoritmos e Programação de Computadores"));

    // Espera adicionar
    await waitFor(() => expect(screen.getByLabelText("Remover Algoritmos e Programação de Computadores")).toBeInTheDocument());

    // Clica em Salvar PDF
    const btnSalvar = screen.getByText("Salvar Simulação (PDF)");
    fireEvent.click(btnSalvar);

    // Verifica se o mock do jsPDF foi chamado
    await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith("Planejamento_UnB.pdf");
    });
  });
});