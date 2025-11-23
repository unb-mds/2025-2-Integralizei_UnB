import { render, screen, waitFor } from "@testing-library/react";
import DadosPage from "../../../src/app/dados/page";

jest.mock("@/components/Navbar2/Navbar2", () => {
  return function DummyNavbar() {
    return <div data-testid="navbar">Navbar Mock</div>;
  };
});

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

describe("Página de Dados (Dashboard)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("deve exibir mensagem de 'Nenhum dado encontrado' quando o localStorage estiver vazio", async () => {
    render(<DadosPage />);

    await waitFor(() => {
      const mensagem = screen.getByText("Nenhum dado encontrado");
      expect(mensagem).toBeInTheDocument();
    });
  });

  it("deve exibir os dados do aluno quando o localStorage estiver preenchido", async () => {
    const dadosMock = {
      aluno: { nome: "Teste da Silva", matricula: "20251234" },
      indices: { ira: 4.5 },
      curriculo: { integralizacao: 0.5, materias: [] }
    };

    window.localStorage.setItem("dadosAluno", JSON.stringify(dadosMock));

    render(<DadosPage />);

    await waitFor(() => {
      expect(screen.getByText(/Teste da Silva/i)).toBeInTheDocument();
      expect(screen.getByText(/20251234/i)).toBeInTheDocument();
    });
  });
});