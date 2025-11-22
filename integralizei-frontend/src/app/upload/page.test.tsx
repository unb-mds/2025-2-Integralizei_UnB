import { render, screen } from "@testing-library/react";
import UploadPage from "./page";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock("../../components/Navbar2/Navbar2", () => {
  return function DummyNavbar() { return <div data-testid="navbar">Navbar</div>; };
});

describe("Página de Upload", () => {
  it("deve renderizar a área de dropzone", () => {
    render(<UploadPage />);
    expect(screen.getByText(/Envie seu histórico acadêmico/i)).toBeInTheDocument();
    expect(screen.getByText(/Arraste seu arquivo aqui/i)).toBeInTheDocument();
  });
});