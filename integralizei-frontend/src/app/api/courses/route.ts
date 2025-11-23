import { NextRequest, NextResponse } from "next/server";

<<<<<<< HEAD
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const year = searchParams.get("year") || "";
    const period = searchParams.get("period") || "";
=======
interface Course {
  id: number;
  name: string;
  code: string;
  classes: unknown[]; // use o tipo real se souber, ex: { professor: string; horario: string }[]
  [key: string]: unknown; // para campos adicionais vindos da API externa
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const year = searchParams.get("year") ?? "";
    const period = searchParams.get("period") ?? "";
>>>>>>> 1745b0ddc50068804e4905ac32f0e86ae428ad09

    const response = await fetch(
      `https://api.suagradeunb.com.br/courses/?search=${search}&year=${year}&period=${period}`
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Erro na API externa: ${response.statusText}` },
        { status: response.status }
      );
    }

<<<<<<< HEAD
    const data = await response.json();

    // Converter classes de string para JSON se necessário
    data.forEach((d: any) => {
      if (typeof d.classes === "string") {
        try {
          d.classes = JSON.parse(d.classes);
=======
    const data: Course[] = await response.json();

    // Converter classes de string para JSON se necessário
    data.forEach((d) => {
      if (typeof d.classes === "string") {
        try {
          d.classes = JSON.parse(d.classes as string);
>>>>>>> 1745b0ddc50068804e4905ac32f0e86ae428ad09
        } catch {
          d.classes = [];
        }
      }
    });

    return NextResponse.json(data);
<<<<<<< HEAD
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erro desconhecido" },
      { status: 500 }
    );
=======
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erro desconhecido ao processar requisição.";
    return NextResponse.json({ error: message }, { status: 500 });
>>>>>>> 1745b0ddc50068804e4905ac32f0e86ae428ad09
  }
}
