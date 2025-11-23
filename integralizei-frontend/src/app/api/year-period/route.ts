import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.suagradeunb.com.br/courses/year-period/", {
      next: { revalidate: 3600 }, // Cache de 1 hora para não sobrecarregar
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Falha ao buscar período na API externa" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Erro API Period:", error);
    return NextResponse.json({ error: "Erro interno ao buscar período" }, { status: 500 });
  }
}