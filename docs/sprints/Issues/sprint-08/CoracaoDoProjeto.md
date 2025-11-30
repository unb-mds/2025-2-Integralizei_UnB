
# 📘 Integralizei-UnB — Backend: Modificação da estrutura do banco de dados

Este documento descreve as funcionalidades e estruturas implementadas no backend do projeto **Integralizei-UnB**, com foco no processamento de históricos acadêmicos da UnB e geração de estatísticas de integralização por disciplina.

---

# O que foi implementado 

## ✔ 1. Geração Automática das Estatísticas de Integralização
Toda vez que um PDF de histórico é enviado, o backend:

1. Processa o arquivo com `parse_basico()`
2. Salva o aluno e suas disciplinas cursadas
3. Recalcula a integralização semestre a semestre
4. Gera uma tabela completa com:
   - **disciplina**
   - **integralização que o aluno tinha ao cursar a disciplina**

Essa tabela é a base estatística do Integralizei-UnB.

---

## ✔ 2. Tabela `estatisticas_disciplinas_agregadas`

Criamos uma tabela agregada que contém, para **cada disciplina**, estatísticas reais baseadas nos históricos importados:

| Campo | Descrição |
|-------|-----------|
| `codigo` | código da disciplina |
| `nome` | nome da disciplina |
| `media` | média de integralização histórica |
| `min_integralizacao` | menor integralização registrada |
| `max_integralizacao` | maior integralização registrada |
| `total_alunos` | quantos alunos já cursaram (dentro dos históricos enviados) |
| `atualizado_em` | timestamp da última atualização |

Essa tabela fornece a base sólida para qualquer análise ou simulador futuro.

---

## ✔ 3. Script de Agregação Automática

Criamos o script:

```
scripts/gerar_estatisticas_agregadas.py
```

Esse script:

- Lê todas as linhas da tabela `estatisticas_disciplinas`
- Agrupa por código da disciplina
- Calcula:
  - média
  - min
  - max
  - total de alunos
- Insere tudo em `estatisticas_disciplinas_agregadas`

Ele é chamado automaticamente sempre que um novo histórico é enviado.

---

## ✔ 4. Endpoint `/api/estatisticas/<codigo>`

Criamos o endpoint oficial do backend para retornar as estatísticas da disciplina em formato JSON.

### ▶ Exemplo de Request

```
GET /api/estatisticas/FGA0163
```

### ▶ Exemplo de Response

```json
{
  "codigo": "FGA0163",
  "nome": "INTRODUÇÃO A ENGENHARIA",
  "media_integralizacao": 10.34,
  "faixa_integralizacao": {
    "min": 10.34,
    "max": 10.34
  },
  "total_alunos": 1
}
```

Esse endpoint será consumido pelo frontend e é a principal peça do sistema hoje.

---

## ✔ 5. Estrutura atualizada do Banco de Dados

Após as melhorias, o SQLite do backend contém:

### 🟦 `alunos`
Informações do aluno e seus índices.

### 🟩 `disciplinas_cursadas`
Todas as disciplinas cursadas por cada aluno.

### 🟨 `integralizacoes_semestre`
Integralização acumulada período a período.

### 🟪 `estatisticas_disciplinas`
Linha por (aluno + disciplina), contendo a integralização naquele período.

### 🟥 `estatisticas_disciplinas_agregadas`
Tabela final usada pelo sistema.

---

## ✔ 6. Backend preparado para integração com o frontend

Após tudo isso:

- O backend já processa históricos
- Já calcula métricas reais de integralização por disciplina
- Já expõe dados via JSON
- Já está pronto para ser consumido pelo front-end



---

