import { GET } from "@/app/api/courses/route";
import { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status || 200,
      json: async () => body,
    }),
  },
}));

global.fetch = jest.fn();

describe("API Route: /api/courses", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve buscar cursos e converter 'classes' de string para JSON", async () => {
    const mockExternalData = [{
      id: 1, code: "CIC0004", name: "APC",
      classes: JSON.stringify([{ _class: "A", teachers: ["Professor X"] }])
    }];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockExternalData,
    });

    const req = {
      url: "http://localhost/api/courses?search=APC&year=2024&period=2"
    } as unknown as NextRequest;

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data[0].classes[0]._class).toBe("A");
  });
  
  it("deve lidar com 'classes' mal formatadas", async () => {
    const mockExternalData = [
      { id: 1, code: "ERR", name: "Erro", classes: "{json-quebrado" }
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockExternalData,
    });

    const req = {
      url: "http://localhost/api/courses?search=ERR"
    } as unknown as NextRequest;

    const res = await GET(req);
    const data = await res.json();

    expect(data[0].classes).toEqual([]);
  });

  it("deve retornar erro se a API externa falhar", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway"
    });

    const req = { url: "http://localhost/api/courses" } as unknown as NextRequest;
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(502);
    expect(body.error).toMatch(/Erro na API externa/);
  });
});