import { NextRequest, NextResponse } from "next/server";

interface Course {
  id: number;
  name: string;
  code: string;
  classes: unknown[];
  [key: string]: unknown;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Usa '??' que é mais seguro que '||' para strings vazias
    const search = searchParams.get("search") ?? "";
    const year = searchParams.get("year") ?? "";
    const period = searchParams.get("period") ?? "";

    // Chama a API externa da UnB
    const response = await fetch(
      `https://api.suagradeunb.com.br/courses/?search=${search}&year=${year}&period=${period}`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro na API externa: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data: Course[] = await response.json();

    // Tratamento de dados (converter string JSON para objeto real)
    data.forEach((d) => {
      if (typeof d.classes === "string") {
        try {
          d.classes = JSON.parse(d.classes as string);
        } catch {
          d.classes = [];
        }
      }
    });

    return NextResponse.json(data);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro desconhecido ao processar requisição.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}