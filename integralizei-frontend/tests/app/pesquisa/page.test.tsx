import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import PesquisaPage from "../../../src/app/pesquisa/page";
import "@testing-library/jest-dom";

jest.mock("@/components/Navbar2/Navbar2", () => {
  return function DummyNavbar() { return <div data-testid="navbar">Navbar</div>; };
});

global.fetch = jest.fn((url: string) => {
  if (url.includes("year-period")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ "year/period": ["2024/1", "2025/2"] }),
    });
  }
  
  if (url.includes("courses")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { 
          id: 1, 
          name: "Cálculo 1", 
          code: "MAT0025", 
          classes: [{ _class: "A", teachers: ["Professor X"], schedule: "24M34", days: ["Seg", "Qua"] }] 
        }
      ]),
    });
  }

  return Promise.reject(new Error("URL desconhecida no teste"));
}) as jest.Mock;

describe("Página de Pesquisa", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve carregar o ano e período atual automaticamente", async () => {
    await act(async () => {
      render(<PesquisaPage />);
    });

    await waitFor(() => {
      const yearInput = screen.getByLabelText(/Ano/i) as HTMLInputElement;
      const periodInput = screen.getByLabelText(/Período/i) as HTMLInputElement;
      
      expect(yearInput.value).toBe("2025");
      expect(periodInput.value).toBe("2");
    });
  });

  it("deve permitir buscar uma disciplina e exibir o resultado", async () => {
    await act(async () => {
      render(<PesquisaPage />);
    });

    const searchInput = screen.getByPlaceholderText(/Código/i);
    
    fireEvent.change(searchInput, { target: { value: "Cálculo" } });

    const submitButton = screen.getByRole("button");
    
    await act(async () => {
        fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/MAT0025 - Cálculo 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Professor X/i)).toBeInTheDocument();
    });
  });
});