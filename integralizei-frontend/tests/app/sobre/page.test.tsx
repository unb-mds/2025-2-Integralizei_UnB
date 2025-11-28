import { render, screen } from "@testing-library/react";
import SobrePage from "../../../src/app/sobre/page";
import "@testing-library/jest-dom";

jest.mock("../../../src/components/Navbar2/Navbar2", () => {
  return function DummyNavbar() {
    return <div data-testid="navbar">Navbar Mock</div>;
  };
});

describe("Página Sobre", () => {
  it("deve renderizar o título principal e subtítulo corretamente", () => {
    render(<SobrePage />);

    const titulo = screen.getByRole("heading", { name: "Sobre o Projeto", level: 1 });
    expect(titulo).toBeInTheDocument();

    const subtitulo = screen.getByRole("heading", { name: "Criadores", level: 2 });
    expect(subtitulo).toBeInTheDocument();
  });

  it("deve conter o texto explicativo sobre o projeto", () => {
    render(<SobrePage />);
    
    expect(screen.getByText(/é um sistema desenvolvido para facilitar a vida acadêmica/i)).toBeInTheDocument();
    expect(screen.getByText(/processamento automático do histórico escolar/i)).toBeInTheDocument();
  });

  it("deve renderizar os cards de todos os 6 criadores", () => {
    render(<SobrePage />);

    const listaCriadores = [
      "Ana Beatriz Souza",
      "Ana Caroline Dantas",
      "Caroline Becker",
      "Gustavo Fornaciari",
      "Enzo Menali",
      "Paulo Vitor Gomes"
    ];

    listaCriadores.forEach((nome) => {
      const nomeElemento = screen.getByText(new RegExp(nome, "i"));
      expect(nomeElemento).toBeInTheDocument();

      const imagem = screen.getByAltText(nome);
      expect(imagem).toBeInTheDocument();
      expect(imagem).toHaveAttribute("src");
    });
  });

  it("deve renderizar a Navbar", () => {
    render(<SobrePage />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });
});