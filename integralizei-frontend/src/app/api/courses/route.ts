import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const year = searchParams.get("year") || "";
    const period = searchParams.get("period") || "";

    const response = await fetch(
      `https://api.suagradeunb.com.br/courses/?search=${search}&year=${year}&period=${period}`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro na API externa: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Converter classes de string para JSON se necessário
    data.forEach((d: any) => {
      if (typeof d.classes === "string") {
        try {
          d.classes = JSON.parse(d.classes);
        } catch {
          d.classes = [];
        }
      }
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
}
