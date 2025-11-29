import { GET } from "@/app/api/year-period/route";

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

describe("API Route: /api/year-period", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve retornar os períodos letivos corretamente", async () => {
    const mockData = { "year/period": ["2024/1", "2024/2"] };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data["year/period"]).toHaveLength(2);
  });

  it("deve retornar erro 500 se a API externa falhar", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Falha ao buscar período na API externa");
  });

  it("deve capturar exceções de rede", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Erro interno ao buscar período");
  });
});