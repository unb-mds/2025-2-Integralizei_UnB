import { POST } from "@/app/api/chat/route";
import { NextRequest } from "next/server";

// Interface para o corpo da requisição
interface ChatRequestBody {
  history: unknown[];
}

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

describe("API Route: /api/chat", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("deve retornar erro 500 se a API Key não estiver configurada", async () => {
    delete process.env.GEMINI_API_KEY;

    const req = {
      json: async () => ({ history: [] } as ChatRequestBody),
    } as unknown as NextRequest;

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    
    expect(body.error).toMatch(/Chave de API não configurada/);
  });

  it("deve chamar a API do Gemini e retornar a resposta formatada", async () => {
    process.env.GEMINI_API_KEY = "TEST_KEY";

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "Olá, sou o UnBot!" }] } }]
      }),
    });

    const req = {
      json: async () => ({ history: [{ role: "user", parts: [{ text: "Oi" }] }] } as ChatRequestBody),
    } as unknown as NextRequest;

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    
    expect(body.text).toBe("Olá, sou o UnBot!");
  });

  it("deve tratar erro vindo da API do Google", async () => {
    process.env.GEMINI_API_KEY = "TEST_KEY";

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: { message: "Google Error" } }),
    });

    const req = {
      json: async () => ({ history: [] } as ChatRequestBody),
    } as unknown as NextRequest;

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    
    expect(body.error).toBe("Falha ao processar mensagem.");
  });
});