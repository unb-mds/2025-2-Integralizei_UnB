import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import CalculadoraPage from "../../../src/app/calculadora/page";
import "@testing-library/jest-dom";
import React from "react";

// --- MOCKS ---

// Mock do Navbar
jest.mock("@/components/Navbar2/Navbar2", () => {
  return function DummyNavbar() {
    return <div data-testid="navbar">Navbar Mock</div>;
  };
});

// Mock do useRouter (Garante que o componente Navbar funcione)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));


// 1. Mock do jsPDF
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
  if (url.includes("year-period")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ "year/period": ["2024/2", "2025/1"] }),
    });
  }

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
          classes: JSON.stringify([
            { _class: "B", teachers: ["Professor Calc"], schedule: "24M34", days: ["Seg", "Qua", "Sex"] }
          ])
        }
      ]),
    });
  }

  return Promise.reject(new Error("URL desconhecida no teste"));
}) as jest.Mock;

// --- CORREÇÃO MOCK CANVAS COMPLETO (Resolve TypeErrors e 'Not Implemented') ---
beforeAll(() => {
  // Define o mock de getContext
  const mockContext = {
    createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
    fillRect: jest.fn(),
    scale: jest.fn(),
    beginPath: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    clearRect: jest.fn(),
    quadraticCurveTo: jest.fn(), // Essencial para o desenho da calculadora
    lineTo: jest.fn(),
    moveTo: jest.fn(),
    closePath: jest.fn(),
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 10 })),
    stroke: jest.fn(),
    bezierCurveTo: jest.fn(),
  };

  // 1. Mock do getContext
  global.HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext) as jest.Mock;

  // 2. Mock do toDataURL
  global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mocked_data_url') as jest.Mock;

  // 3. Mock das propriedades de tamanho (para o código da calculadora usar)
  Object.defineProperty(global.HTMLCanvasElement.prototype, 'width', { writable: true, configurable: true, value: 300 });
  Object.defineProperty(global.HTMLCanvasElement.prototype, 'height', { writable: true, configurable: true, value: 300 });
});
// --------------------------------------------------------------------------


// --- SUÍTE DE TESTES ---

describe("Página de Calculadora", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("deve carregar corretamente e ler dados do aluno do localStorage", async () => {
    const dadosMock = {
      curriculo: { integralizacao: 50.00, ch_exigida: 3000 }
    };
    window.localStorage.setItem("dadosAluno", JSON.stringify(dadosMock));

    await act(async () => {
      render(<CalculadoraPage />);
    });

    expect(screen.getByText("Calculadora")).toBeInTheDocument();
    
    await waitFor(() => {
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

    const inputBusca = screen.getByPlaceholderText(/Matéria \(Ex: Cálculo 1\)/i);
    fireEvent.change(inputBusca, { target: { value: "Algoritmos" } });
    await act(async () => {
      fireEvent.click(screen.getByLabelText("Buscar"));
    });

    await waitFor(() => {
        expect(screen.getByText("Algoritmos e Programação de Computadores")).toBeInTheDocument();
    });

    const btnAdd = screen.getByLabelText("Adicionar Algoritmos e Programação de Computadores");
    fireEvent.click(btnAdd);

    await waitFor(() => {
        const btnRemove = screen.getByLabelText("Remover Algoritmos e Programação de Computadores");
        expect(btnRemove).toBeInTheDocument();
    });

    await waitFor(() => {
        const creditosExtras = screen.getByText("4"); 
        expect(creditosExtras).toBeInTheDocument();
    });
  });

  it("deve gerar o PDF ao clicar no botão salvar", async () => {
    // Simula a adição da matéria para que o PDF tenha conteúdo
    const dadosMock = {
        curriculo: { integralizacao: 50.00, ch_exigida: 3000 }
    };
    window.localStorage.setItem("dadosAluno", JSON.stringify(dadosMock));

    await act(async () => {
      render(<CalculadoraPage />);
    });

    const inputBusca = screen.getByPlaceholderText(/Matéria \(Ex: Cálculo 1\)/i);
    fireEvent.change(inputBusca, { target: { value: "Algoritmos" } });
    await act(async () => {
        fireEvent.click(screen.getByLabelText("Buscar"));
    });

    await waitFor(() => expect(screen.getByText("Algoritmos e Programação de Computadores")).toBeInTheDocument());
    
    fireEvent.click(screen.getByLabelText("Adicionar Algoritmos e Programação de Computadores"));

    await waitFor(() => expect(screen.getByLabelText("Remover Algoritmos e Programação de Computadores")).toBeInTheDocument());

    const btnSalvar = screen.getByText("Salvar Simulação (PDF)");
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledWith("Planejamento_UnB.pdf");
    });
  });
});