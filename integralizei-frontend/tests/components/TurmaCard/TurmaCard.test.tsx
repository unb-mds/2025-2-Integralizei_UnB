import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TurmaCard from "../../../src/components/TurmaCard/TurmaCard";
import "@testing-library/jest-dom";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      { posicao: 1, integralizacao: "50.00%" }
    ]),
  })
) as jest.Mock;

describe("TurmaCard Component", () => {
  const mockTurma = {
    _class: "A",
    teachers: ["Prof. Teste"],
    classroom: "S1",
    schedule: "24T12",
    days: ["Seg", "Qua"],
    favorited: false,
  };

  it("deve renderizar as informações básicas do card", () => {
    render(
      <TurmaCard 
        turma={mockTurma} 
        disciplinaCode="MAT001" 
        disciplinaName="Cálculo 1" 
      />
    );

    expect(screen.getByText("MAT001 - Cálculo 1")).toBeInTheDocument();
    expect(screen.getByText("Professores: Prof. Teste")).toBeInTheDocument();
  });

  it("deve expandir o ranking ao clicar na seta", async () => {
    render(
      <TurmaCard 
        turma={mockTurma} 
        disciplinaCode="MAT001" 
        disciplinaName="Cálculo 1" 
      />
    );


    expect(screen.queryByText("Posição")).not.toBeInTheDocument();

    const botaoSeta = screen.getByTitle("Ver Ranking");
    
    fireEvent.click(botaoSeta);

    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/api/ranking/MAT001?professor=Prof.%20Teste")
        );
    });
  });
});