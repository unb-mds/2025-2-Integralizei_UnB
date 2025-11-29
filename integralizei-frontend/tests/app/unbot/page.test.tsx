import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UnBotPage from "../../../src/app/unbot/page";
import "@testing-library/jest-dom";

// --- MOCKS (Inline para evitar erro de Hoisting/Inicialização) ---

// 1. Mock do React Markdown
jest.mock("react-markdown", () => {
  const MarkdownMock = ({ children }: { children: React.ReactNode }) => {
    return <div data-testid="markdown-mock">{children}</div>;
  };
  MarkdownMock.displayName = "MarkdownMock";
  return MarkdownMock;
});

// 2. Mock dos Plugins (Funções vazias)
jest.mock("remark-math", () => () => {});
jest.mock("rehype-katex", () => () => {});
jest.mock("remark-gfm", () => () => {});
jest.mock("katex/dist/katex.min.css", () => {});

// 3. Mock do Navbar
jest.mock("@/components/Navbar2/Navbar2", () => {
  const DummyNavbar = () => <div data-testid="navbar">Navbar Mock</div>;
  DummyNavbar.displayName = "DummyNavbar";
  return DummyNavbar;
});

// 4. Mock do Scroll
window.HTMLElement.prototype.scrollTo = jest.fn();

// 5. Mock do Fetch Global
global.fetch = jest.fn();

describe("Página UnBot (Chatbot)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar a interface inicial corretamente", () => {
    render(<UnBotPage />);
    expect(screen.getByText("UnBot")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite sua dúvida...")).toBeInTheDocument();
  });

  it("deve enviar uma mensagem e exibir a resposta da IA", async () => {
    // Simula sucesso
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: "O IRA é o Índice de Rendimento Acadêmico." }),
    });

    render(<UnBotPage />);
    const input = screen.getByPlaceholderText("Digite sua dúvida...");
    
    // O botão de enviar é o último da lista
    const buttons = screen.getAllByRole("button");
    const btnSend = buttons[buttons.length - 1]; 

    fireEvent.change(input, { target: { value: "O que é IRA?" } });
    fireEvent.click(btnSend);

    await waitFor(() => {
      expect(screen.getByText("O IRA é o Índice de Rendimento Acadêmico.")).toBeInTheDocument();
    });
  });

  it("deve exibir mensagem de erro se a API falhar", async () => {
    // Simula erro de rede
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Falha na rede"));

    render(<UnBotPage />);
    const input = screen.getByPlaceholderText("Digite sua dúvida...");
    const buttons = screen.getAllByRole("button");
    const btnSend = buttons[buttons.length - 1];

    fireEvent.change(input, { target: { value: "Teste Erro" } });
    fireEvent.click(btnSend);

    await waitFor(() => {
      expect(screen.getByText(/Não consegui conectar/i)).toBeInTheDocument();
    });
  });
});