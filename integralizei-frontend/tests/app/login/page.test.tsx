import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page"; 
import "@testing-library/jest-dom";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Login OK" }),
  })
) as jest.Mock;

describe("Página de Login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o formulário corretamente", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("E-mail")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Entrar$/i })).toBeInTheDocument();
  });

  it("deve realizar o login com sucesso e redirecionar", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "admin@teste.com" } });
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: /^Entrar$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Login efetuado com sucesso/i)).toBeInTheDocument();
      setTimeout(() => {
          expect(mockPush).toHaveBeenCalledWith("/");
      }, 1100);
    });
  });


  it("deve exibir erro quando a API retornar falha (ex: senha incorreta)", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Credenciais inválidas" }),
      })
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "admin@teste.com" } });
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "errada" } });
    fireEvent.click(screen.getByRole("button", { name: /^Entrar$/i }));

    await waitFor(() => {
      expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled(); 
    });
  });

  it("deve exibir erro genérico se o servidor estiver fora do ar (catch)", async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error("Falha na conexão"))
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "admin@teste.com" } });
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: /^Entrar$/i }));

    await waitFor(() => {
      expect(screen.getByText(/Não foi possível conectar ao servidor/i)).toBeInTheDocument();
    });
  });
});