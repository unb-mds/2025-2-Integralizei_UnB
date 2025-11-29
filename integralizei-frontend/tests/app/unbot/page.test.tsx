import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UnBotPage from "../../../src/app/unbot/page";
import "@testing-library/jest-dom";

jest.mock("react-markdown", () => (props: { children: React.ReactNode }) => {
  return <div data-testid="markdown-mock">{props.children}</div>;
});

jest.mock("remark-math", () => () => {});
jest.mock("rehype-katex", () => () => {});
jest.mock("remark-gfm", () => () => {});

jest.mock("katex/dist/katex.min.css", () => {});

jest.mock("@/components/Navbar2/Navbar2", () => {
  return function DummyNavbar() {
    return <div data-testid="navbar">Navbar Mock</div>;
  };
});

window.HTMLElement.prototype.scrollTo = jest.fn();

global.fetch = jest.fn();

describe("Página UnBot (Chatbot)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar a interface inicial corretamente", () => {
    render(<UnBotPage />);

    expect(screen.getByText("UnBot")).toBeInTheDocument();
    expect(screen.getByText("Seu assistente virtual de integralização")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Digite sua dúvida...")).toBeInTheDocument();
    
    expect(screen.getByText("O que é o IRA?")).toBeInTheDocument();
  });

  it("deve enviar uma mensagem e exibir a resposta da IA", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: "O IRA é o Índice de Rendimento Acadêmico." }),
    });

    render(<UnBotPage />);

    const input = screen.getByPlaceholderText("Digite sua dúvida...");
    
    const buttons = screen.getAllByRole("button");
    const btnSend = buttons[buttons.length - 1]; 

    fireEvent.change(input, { target: { value: "O que é IRA?" } });
    fireEvent.click(btnSend);

    expect(screen.getByText("O que é IRA?")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("O IRA é o Índice de Rendimento Acadêmico.")).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/chat", expect.objectContaining({
      method: "POST",
      body: expect.stringContaining("O que é IRA?")
    }));
  });

  it("deve enviar mensagem ao clicar em uma sugestão (Chip)", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: "Resposta sobre integralização." }),
    });

    render(<UnBotPage />);

    const sugestaoBtn = screen.getByText("Como calculo minha integralização?");
    fireEvent.click(sugestaoBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/chat", expect.objectContaining({
        body: expect.stringContaining("Como calculo minha integralização?")
      }));
    });
  });

  it("deve exibir mensagem de erro se a API falhar", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Falha na rede"));

    render(<UnBotPage />);

    const input = screen.getByPlaceholderText("Digite sua dúvida...");
    const buttons = screen.getAllByRole("button");
    const btnSend = buttons[buttons.length - 1];

    fireEvent.change(input, { target: { value: "Teste Erro" } });
    fireEvent.click(btnSend);

    await waitFor(() => {
      expect(screen.getByText(/Não consegui conectar ao servidor/i)).toBeInTheDocument();
    });
  });
});