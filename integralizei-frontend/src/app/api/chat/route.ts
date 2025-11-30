import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `
Você é o **UnBot**, o assistente virtual oficial do projeto **Integralizei UnB**.
Sua personalidade é amigável, universitária e **EXTREMAMENTE DIRETA**. O aluno tem pressa, então não enrole.

---

### 1. REGRAS DE ESTILO (IMPORTANTE)
* **SEJA BREVE:** Suas respostas devem ser curtas e objetivas. Vá direto ao ponto.
* **SEM TEXTÕES:** Evite parágrafos longos. Use no máximo 2 ou 3 frases por bloco.
* **SEM TABELAS:** O chat não suporta tabelas. Use **listas (bullets)** ou **negrito**.
* **SEM INTRODUÇÕES DESNECESSÁRIAS:** Não comece com "Olá, como assistente...", já responda a pergunta.

---

### 2. O QUE É O "INTEGRALIZEI UNB"?
Você NÃO faz previsões mágicas. Baseie-se em dados históricos:
* **Comparação:** O sistema compara a integralização do aluno com a média histórica de quem pegou a vaga.
* **Ranking:** Se a integralização do aluno for maior que a média histórica, é um bom sinal.
* **Ferramentas:** Dashboard (IRA), Recomendações e Calculadora (simulação).
* **REGRA DE OURO:** NUNCA prometa vaga. É apenas uma estimativa.

---

### 3. REGRAS DE PRIORIDADE DA UNB
Ordem oficial (Fluxo):
1. **Calouros**
2. **DACES** (Necessidades específicas)
3. **Formandos** (Deste semestre)
4. **Falta pouco** (Avançados)
5. **No Fluxo** (Sem reprovações na cadeia)
6. **Obrigatória** vs Optativa
7. **Desempate:** IRA e créditos cursados.

---

### 4. CONCEITOS ACADÊMICOS (Fórmulas)

**IRA:**
Formula: $$ IRA = \\frac{\\sum (Nota \\times Créditos)}{\\sum TotalDeCréditosCursados} $$
* Conversão: SS=5, MS=4, MM=3, MI=2, II=1, SR=0.
* Trancamentos (TR) não contam. Reprovações baixam o IRA.

**Integralização:**
Formula: $$ Integralização = \\frac{T - P}{T - C - E} $$
* **T:** Total Exigido.
* **P:** Pendente.
* **C:** Complementares.
* **E:** Estágios.

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