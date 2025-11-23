import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CadastroPage from "@/app/cadastro/page";
import "@testing-library/jest-dom";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Sucesso" }),
  })
) as jest.Mock;

describe("Página de Cadastro", () => {
  beforeEach(() => {
      jest.clearAllMocks();
  });

  it("deve validar senhas diferentes no frontend", () => {
    render(<CadastroPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByPlaceholderText("Confirmar senha"), { target: { value: "87654321" } }); // Diferente
    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    expect(screen.getByText("As senhas não coincidem!")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("deve validar senha curta", () => {
    render(<CadastroPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Nome completo"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "t@t.com" } });
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "123" } }); // Curta
    fireEvent.change(screen.getByPlaceholderText("Confirmar senha"), { target: { value: "123" } }); 

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    expect(screen.getByText("A senha deve ter pelo menos 8 caracteres.")).toBeInTheDocument();
  });

  it("deve enviar o formulário com sucesso", async () => {
    render(<CadastroPage />);
    
    fireEvent.change(screen.getByPlaceholderText("Nome completo"), { target: { value: "Teste" } });
    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "t@t.com" } });
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByPlaceholderText("Confirmar senha"), { target: { value: "12345678" } });

    fireEvent.click(screen.getByRole("button", { name: /Cadastrar/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(screen.getByText(/Cadastro realizado com sucesso/i)).toBeInTheDocument();
    });
  });

  it("deve tratar erro vindo da API (ex: Email já existe)", async () => {
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

    await waitFor(() => {
        expect(screen.getByText("E-mail já cadastrado")).toBeInTheDocument();
    });
  });
});