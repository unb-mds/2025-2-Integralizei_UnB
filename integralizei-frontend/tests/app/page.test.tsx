import { render, screen } from "@testing-library/react";
import Home from "../../src/app/page";
import "@testing-library/jest-dom";

jest.mock("@/components/Navbar2/Navbar2", () => {
  return function DummyNavbar() { return <div data-testid="navbar">Navbar Mock</div>; };
});

jest.mock("@/components/HeroSection", () => {
  return function DummyHero() { return <div data-testid="hero">Hero Mock</div>; };
});

describe("Página Inicial (Home)", () => {
  it("deve renderizar a estrutura principal com Navbar e HeroSection", () => {
    render(<Home />);
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("hero")).toBeInTheDocument();
  });
});