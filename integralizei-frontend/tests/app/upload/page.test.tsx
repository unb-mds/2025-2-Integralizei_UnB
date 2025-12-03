import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UploadPage from "@/app/upload/page";
import "@testing-library/jest-dom";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("@/components/Navbar2/Navbar2", () => {
  return function DummyNavbar() {
    return <div data-testid="navbar">Navbar</div>;
  };
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: "Sucesso" }),
  })
) as jest.Mock;

describe("Página de Upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("deve renderizar e permitir selecionar um arquivo (Garante cobertura de seleção)", async () => {
    // ⚠️ Simula usuário logado antes de renderizar
    localStorage.setItem("user_session", JSON.stringify({ token: "fake" }));

    render(<UploadPage />);

    // espera o input estar disponível no DOM
    const input = (await screen.findByTestId("file-input")) as HTMLInputElement;

    const file = new File(["conteudo"], "historico.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("historico.pdf")).toBeInTheDocument();

    const botao = screen.getByRole("button", { name: /Enviar Histórico/i });
    expect(botao).not.toBeDisabled();
  });

  it("deve simular o envio com sucesso (Garante cobertura de upload)", async () => {
    // ⚠️ Simula usuário logado antes de renderizar
    localStorage.setItem("user_session", JSON.stringify({ token: "fake" }));

    render(<UploadPage />);

    const input = (await screen.findByTestId("file-input")) as HTMLInputElement;
    const file = new File(["conteudo"], "historico.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(input, { target: { files: [file] } });

    const botao = screen.getByRole("button", { name: /Enviar Histórico/i });
    fireEvent.click(botao);

    await waitFor(() => {
      expect(
        screen.getByText(/Histórico enviado com sucesso/i),
      ).toBeInTheDocument();
    });
  });
});
