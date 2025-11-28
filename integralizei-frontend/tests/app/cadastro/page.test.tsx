import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CadastroPage from "@/app/cadastro/page";
import "@testing-library/jest-dom";

// Mock do Router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("Página de Cadastro", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve validar senhas diferentes", async () => {
    render(<CadastroPage />);
    
    // CORREÇÃO: Precisamos preencher Nome e Email para passar da primeira validação!
    fireEvent.change(screen.getByPlaceholderText("Nome completo"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "teste@teste.com" } });

    // Preenche senhas diferentes
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByPlaceholderText("Confirmar senha"), { target: { value: "87654321" } }); 

    // Dispara o envio
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    // Agora sim, a mensagem correta deve aparecer
    expect(await screen.findByText("As senhas não coincidem!")).toBeInTheDocument();
  });

  it("deve validar senha curta", async () => {
    render(<CadastroPage />);
    
    // Preenche campos obrigatórios
    fireEvent.change(screen.getByPlaceholderText("Nome completo"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "t@t.com" } });
    
    // Senha curta
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "123" } }); 
    fireEvent.change(screen.getByPlaceholderText("Confirmar senha"), { target: { value: "123" } }); 

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    expect(await screen.findByText("A senha deve ter pelo menos 8 caracteres.")).toBeInTheDocument();
  });

  it("deve enviar o formulário com sucesso", async () => {
    render(<CadastroPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Nome completo"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "t@t.com" } });
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByPlaceholderText("Confirmar senha"), { target: { value: "12345678" } });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      // Como o mock global no jest.setup.js retorna sucesso, esperamos a mensagem de sucesso
      expect(screen.getByText(/Cadastro realizado com sucesso/i)).toBeInTheDocument();
    });
  });

  it("deve tratar erro vindo da API", async () => {
    // Sobrescreve o fetch global APENAS para este teste
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ message: "E-mail já cadastrado" }),
        })
      );

    render(<CadastroPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Nome completo"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "existe@t.com" } });
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByPlaceholderText("Confirmar senha"), { target: { value: "12345678" } });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    expect(await screen.findByText("E-mail já cadastrado")).toBeInTheDocument();
  });
});