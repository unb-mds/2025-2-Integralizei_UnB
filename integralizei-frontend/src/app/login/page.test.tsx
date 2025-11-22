import { render, screen } from "@testing-library/react";
import LoginPage from "./page";
import "@testing-library/jest-dom";

// Mock do useRouter
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe("Página de Login", () => {
  it("deve renderizar o formulário de login", () => {
    render(<LoginPage />);
    expect(screen.getByRole("heading", { name: /Entre na sua conta/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("E-mail")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Senha")).toBeInTheDocument();
  });

  it("deve ter o botão de entrar", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /^Entrar$/i })).toBeInTheDocument();
  });
});