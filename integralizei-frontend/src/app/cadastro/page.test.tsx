import { render, screen } from "@testing-library/react";
import CadastroPage from "./page";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("Página de Cadastro", () => {
  it("deve renderizar todos os campos de cadastro", () => {
    render(<CadastroPage />);
    expect(screen.getByPlaceholderText("Nome completo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("E-mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Senha")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirmar senha")).toBeInTheDocument();
  });
});