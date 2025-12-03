/* eslint-disable @next/next/no-img-element */
import { render, screen, waitFor } from "@testing-library/react";
import Navbar from "@/components/Navbar2/Navbar2";
import "@testing-library/jest-dom";
// Removendo a importação de ImgHTMLAttributes, que não é necessária aqui, mas é implicada
import React from "react"; 

// Mock do useRouter
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// --- CORREÇÃO FINAL DO MOCK DE IMAGEM (Resolve 'Unexpected any') ---
jest.mock("next/image", () => ({
  __esModule: true,
  // [FIX]: Define as props com tipos boolean explícitos (Copilot's solution)
  // Isso elimina o uso de 'any' nos argumentos e o erro do linter.
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean; unoptimized?: boolean }) => (
    <img 
      {...props} 
      // Garante que o alt exista (resolve warnings)
      alt={props.alt || 'mocked image'} 
    />
  ),
}));
// -------------------------------------------------------------------

describe("Componente Navbar", () => {
  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("deve renderizar o título e os links principais e mostrar ENTRAR por padrão", async () => {
    render(<Navbar />);

    expect(screen.getByText("Integralizei UnB")).toBeInTheDocument();

    await waitFor(() => {
        expect(screen.getByText("ENTRAR")).toBeInTheDocument();
    });
  });

  it("deve mostrar botão SAIR quando estiver logado", async () => {
    localStorage.setItem("user_session", "true");
    
    render(<Navbar />);

    await waitFor(() => {
        expect(screen.getByText("SAIR")).toBeInTheDocument();
    });
  });
});