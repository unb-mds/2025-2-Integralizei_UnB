import { render, screen } from "@testing-library/react";
import Navbar from "../../../src/components/Navbar2/Navbar2";
import "@testing-library/jest-dom";

describe("Componente Navbar", () => {
  it("deve renderizar o título e os links principais", () => {
    render(<Navbar />);
    
    // Verifica o logo/texto
    expect(screen.getByText("Integralizei UnB")).toBeInTheDocument();
    
    // Verifica se os links existem
    expect(screen.getByRole("link", { name: /DADOS/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /PESQUISA/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ENTRAR/i })).toBeInTheDocument();
  });
});