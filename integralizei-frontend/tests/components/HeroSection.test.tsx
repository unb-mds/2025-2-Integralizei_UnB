import { render, screen } from "@testing-library/react";
import HeroSection from "../../src/components/HeroSection";
import "@testing-library/jest-dom";

describe("HeroSection", () => {
  it("deve renderizar o título principal", () => {
    render(<HeroSection />);
    expect(screen.getByText(/Planeje sua integralização/i)).toBeInTheDocument();
  });

  it("deve conter o link para envio de histórico", () => {
    render(<HeroSection />);
    const link = screen.getByRole("link", { name: /Enviar Histórico/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/upload");
  });
});