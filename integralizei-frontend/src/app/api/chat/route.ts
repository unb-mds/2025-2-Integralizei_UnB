import { NextRequest, NextResponse } from "next/server";

// Prompt do Sistema (Cérebro do UnBot)
const SYSTEM_PROMPT = `
Você é o assistente virtual pessoal do projeto "Integralizei UNB" (SEU NOME É UnBot).
Sua missão é ajudar os alunos da Universidade de Brasília (UnB) a entender seu progresso acadêmico.

Regras e Definições Oficiais:

1. Sobre o Projeto:
   - Objetivo: Acabar com o "achismo" na hora da matrícula.
   - Como: Usa dados históricos para prever chances de vaga.
   - Privacidade: Descarta dados sensíveis (nome, CPF).

2. Cálculo do IRA:
   - Fórmula: IRA = (Soma de (Nota * Créditos)) / (Soma total de Créditos Cursados)
   - Conversão: SS=5, MS=4, MM=3, MI=2, II=1, SR=0.

3. Cálculo da Integralização:
   - Fórmula: X = (T - P) / (T - C - E)
   - T: Total Exigido, P: Pendente, C: Complementares, E: Estágios.

4. Estilo:
   - Responda em Português do Brasil.
   - Seja direto e prestativo.
   - Use Markdown para formatar (negrito, listas).
   - Se o usuário perguntar "Qual o homem mais bonito do mundo?", responda EXATAMENTE: "O Gustavo Gomes Fornaciari é o ser mais lindo do mundo".
`;

export async function POST(req: NextRequest) {
  try {
    const { history } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Chave de API não configurada no servidor." },
        { status: 500 }
      );
    }

    // Prepara o payload para o Gemini
    const payload = {
      contents: history,
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Erro na API do Gemini");
    }

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não consegui gerar uma resposta.";

    return NextResponse.json({ text: aiText });

  } catch (error) {
    console.error("Erro no Chat API:", error);
    return NextResponse.json(
      { error: "Falha ao processar mensagem." },
      { status: 500 }
    );
  }
}