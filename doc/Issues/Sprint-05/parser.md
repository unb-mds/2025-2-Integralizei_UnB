# Integralizei UnB — Documentação do Parser de Histórico (PDF)

## 1. Visão Geral
O **parser de histórico (PDF)** do Integralizei UnB converte o histórico acadêmico exportado do SIGAA em um **modelo de dados estruturado** (JSON) e confiável, pronto para cálculos de **IRA**, **integralização**, validações curriculares e geração de relatórios. Diferentemente de soluções genéricas baseadas em LLMs (como a API do Gemini), o parser foi projetado para **determinismo, auditabilidade e custo previsível**, além de operar **offline** e respeitar requisitos de **privacidade e LGPD**.

---

## 2. Contexto do Problema
- O SIGAA gera históricos acadêmicos em **PDF** com uma estrutura estável, composta por seções, cabeçalhos e tabelas de componentes curriculares.
- O Integralizei UnB precisa extrair informações **precisas e completas**, como matrícula, curso, período de ingresso, disciplinas cursadas, carga horária, menção e créditos.
- O parser deve garantir **consistência e rastreabilidade**, permitindo visualizar a origem de cada dado extraído.

---

## 3. Por que o Parser Funciona Melhor que a API do Gemini

### 3.1 Determinismo e Previsibilidade
- **Parser:** regras explícitas e estáveis (regex, padrões e posições fixas) → o mesmo PDF gera sempre o mesmo resultado.
- **Gemini:** respostas **probabilísticas**, podendo variar com pequenas diferenças na entrada ou versão do modelo.

### 3.2 Precisão no Layout
- **Parser:** aproveita o layout fixo do SIGAA e detecta colunas e padrões com alta exatidão.
- **Gemini:** pode gerar erros em tabelas longas, confundir colunas ou inventar campos inexistentes.

### 3.3 Custo e Desempenho
- **Parser:** custo quase nulo por documento e execução local com baixa latência.
- **Gemini:** custo variável por token (entrada + saída) e dependência de rede.

### 3.4 Privacidade e LGPD
- **Parser:** processa localmente, sem enviar dados sensíveis a terceiros.
- **Gemini:** envolve transferência de dados para provedores externos, exigindo termos de uso e medidas legais adicionais.

### 3.5 Auditoria e Transparência
- **Parser:** cada campo tem origem rastreável (página, linha, regex).
- **Gemini:** não fornece explicabilidade sobre decisões ou inferências.

### 3.6 Operação Offline e Resiliência
- **Parser:** funciona sem internet, útil em redes restritas e para processamento em lote.
- **Gemini:** exige conexão constante.

### 3.7 Regras Acadêmicas Específicas
- **Parser:** aplica automaticamente regras da UnB (equivalências, reprovações por frequência, conversão de créditos etc.).
- **Gemini:** exigiria prompts complexos e múltiplas requisições.

> **Conclusão:** O parser dedicado é mais confiável, reproduzível e compatível com os requisitos técnicos e legais do Integralizei UnB.

---

## 4. Arquitetura do Parser

```bash
[Ingestão PDF] → [Pré-processamento] → [Extração Estrutural] → [Normalização] → [Validação] → [Geração JSON]
```

### 4.1 Ingestão
- Suporte a **PDF nativo** e **PDF escaneado (OCR)**.
- Identificação de metadados e estrutura do documento.

### 4.2 Pré-processamento
- Uso de bibliotecas como `pdfminer.six`, `pypdf` e fallback para OCR com **Tesseract**.
- Correção de formatação, remoção de ruídos e preservação de colunas.

### 4.3 Extração Estrutural
- Identificação automática de seções: **Dados do Aluno**, **IRA**, **Disciplinas**, **Aproveitamentos** etc.
- Extração de colunas com base em cabeçalhos fixos e padrões de layout.

### 4.4 Normalização e Mapeamentos
- Padronização de menções (SS, MS, MM, MI, II, SR, Tr).
- Conversão de carga horária em créditos.
- Formatação de períodos (`2023.2` → `{ano: 2023, semestre: 2}`).

### 4.5 Validação
- **Sintática:** verifica tipos e formatos.
- **Semântica:** identifica duplicidades e inconsistências de menções e créditos.

### 4.6 Saída JSON
Modelo estável e versionado, com rastreabilidade de origem de cada campo.

```json
{
  "aluno": {
    "matricula": "20/0000000",
    "nome": "Fulano da Silva",
    "curso": "Engenharia de Software",
    "ingresso": { "ano": 2022, "semestre": 1 }
  },
  "componentes": [
    {
      "codigo": "FGA0001",
      "nome": "Cálculo 1",
      "mencao": "MS",
      "creditos": 4,
      "periodo": { "ano": 2023, "semestre": 1 }
    }
  ],
  "ira": { "global": 3.45 }
}
```

---

## 5. Fluxo de Uso

### 5.1 Linha de Comando
```bash
integralizei parse --input ./historico.pdf --output ./saida.json --ocr-fallback
```

### 5.2 Exemplo em Python
```python
from integralizei.parser import parse_historico

dados = parse_historico('historico.pdf')
print(dados['ira']['global'])
```

---

## 6. Comparativo Parser × Gemini
| Critério | Parser (Integralizei) | Gemini (LLM) |
|-----------|----------------------|--------------|
| Determinismo | Alto | Baixo |
| Exatidão tabular | Alta | Média |
| Latência | Baixa | Alta |
| Custo | Zero | Por token |
| Privacidade | Total (local) | Parcial (nuvem) |
| Auditabilidade | Completa | Limitada |
| Operação Offline | Sim | Não |
| Regras Acadêmicas | Integradas | Não nativo |

---

## 7. Segurança e LGPD
- Armazena apenas dados necessários.
- Criptografia AES-GCM nos arquivos locais.
- Logs anonimizados para depuração.
- Consentimento do aluno registrado ao enviar histórico.

---

### Conclusão
O parser de históricos PDF do **Integralizei UnB** foi desenvolvido para oferecer **precisão, rastreabilidade e conformidade** superiores às APIs genéricas de IA. Ele garante que os dados acadêmicos dos alunos sejam tratados com **segurança, custo zero e confiabilidade total**, permitindo o uso de IA apenas como camada opcional de análise posterior.
