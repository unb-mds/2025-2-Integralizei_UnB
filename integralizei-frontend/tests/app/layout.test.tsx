import { render, screen } from "@testing-library/react";
import RootLayout from "../../src/app/layout";
import "@testing-library/jest-dom";

jest.mock("next/font/google", () => ({
  Inter: () => ({ className: "inter-font" }),
}));

jest.mock("@/app/layout", () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="layout-wrapper">{children}</div>
    ),
  };
});

describe("RootLayout", () => {
  it("deve renderizar o conteúdo filho (children)", () => {
    render(
      <RootLayout>
        <div data-testid="child-content">Conteúdo de Teste</div>
      </RootLayout>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });
});