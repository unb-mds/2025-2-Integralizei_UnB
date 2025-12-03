import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UploadPage from "@/app/upload/page";
import "@testing-library/jest-dom";

// Mock do useRouter (necessário para o componente)
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock da Navbar
jest.mock("@/components/Navbar2/Navbar2", () => {
  return function DummyNavbar() {
    return <div data-testid="navbar">Navbar</div>;
  };
});

describe("Página de Upload", () => {
  
  // Mock para simular que o usuário está logado
  beforeEach(() => {
    localStorage.setItem("user_session", JSON.stringify({ email: "teste@unb.br" }));
    
    // Mock do fetch global para simular o upload
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ 
            aluno: { nome: "Teste", matricula: "123" },
            curriculo: { materias: [] }
        }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // Função utilitária para esperar o estado de checagem inicial terminar
  const waitForAuthCheck = async () => {
    // Espera a microtask de autenticação terminar para renderizar o upload UI.
    // Isso resolve os warnings de act() e a renderização incorreta.
    await waitFor(() => {
        expect(screen.queryByText("Carregando...")).not.toBeInTheDocument();
        expect(screen.getByText("Arraste seu arquivo aqui")).toBeInTheDocument();
    });
  };

  it("deve renderizar e permitir selecionar um arquivo", async () => {
    render(<UploadPage />);

    await waitForAuthCheck();

    // FIX 1: Busca o input de arquivo pelo ID exato, após a UI de upload ser renderizada
    const input = document.querySelector("#fileInput") as HTMLInputElement;

    expect(input).toBeInTheDocument();

    const file = new File(["conteudo"], "historico.pdf", { type: "application/pdf" });
    
    // Simula a mudança de arquivo
    fireEvent.change(input, { target: { files: [file] } });

    // Espera o estado do arquivo ser atualizado
    await waitFor(() => {
        expect(screen.getByText("historico.pdf")).toBeInTheDocument();
    });
  });

  it("deve simular o envio com sucesso (Garante cobertura de upload)", async () => {
    render(<UploadPage />);

    await waitForAuthCheck();

    // Busca o input de arquivo
    const input = document.querySelector("#fileInput") as HTMLInputElement;
    const file = new File(["conteudo"], "historico.pdf", { type: "application/pdf" });
    
    // Simula a seleção
    fireEvent.change(input, { target: { files: [file] } });

    const botao = screen.getByRole("button", { name: /Enviar Histórico/i });
    
    // Clica e espera a chamada do fetch
    fireEvent.click(botao);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(screen.getByText("Histórico enviado com sucesso!")).toBeInTheDocument();
    });
  });
});