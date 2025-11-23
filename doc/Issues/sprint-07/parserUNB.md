# Apuração do Parser do Integralizei - UnB

Após uma detalhada reavaliação das funcionalidades do formulário de leitura de históricos, foram implementadas novas funcionalidades e serviços executáveis pelo próprio parser
---

## Funcionalidades

-  **Leitura automática de histórico em PDF** (SIGAA UnB);
- **Parser inteligente** que extrai:
  - Nome, matrícula, curso;
  - IRA e MP;
  - Todas as disciplinas cursadas, menção, carga horária, período e status;
- **Cálculo de integralização total e por semestre**;
- **Geração automática de estatísticas** de integralização média por disciplina;
- **Armazenamento local em SQLite**, com logs de importações e histórico de cálculos.

---

## Estrutura do Projeto

```
formulario/
│
├── app.py                                # Aplicação Flask principal
├── parsers/
│   └── unb_historico.py                  # Parser do histórico em PDF
│
├── scripts/
│   ├── __init__.py
│   └── calcular_integralizacoes_semestre.py  # Cálculo automático de integralização
│
├── instance/
│   └── integralizei.db                   # Banco de dados SQLite
│
├── templates/
│   └── index.html                        # Página principal
│
└── uploads/                              # PDFs enviados pelos usuários
```

---

## Estrutura do Banco de Dados

| Tabela | Descrição |
|--------|------------|
| **alunos** | Dados do aluno (matrícula, nome, curso, IRA, MP, integralização) |
| **disciplinas_cursadas** | Todas as disciplinas extraídas do histórico, vinculadas ao aluno |
| **importacoes** | Registros de PDFs importados e dados brutos em JSON |
| **integralizacoes_semestre** | Carga horária e percentual integralizado por semestre |
| **estatisticas_disciplinas** | Média, mediana e desvio-padrão de integralização por disciplina |


---

## Fluxo Interno

1. O usuário faz upload do histórico em PDF.  
2. O parser (`unb_historico.py`) extrai todas as informações relevantes.  
3. O `app.py` grava os dados no banco via `upsert()`.  
4. Após o commit, o sistema executa `recalcular_tudo(DB_PATH)`, que:
   - Atualiza a tabela `integralizacoes_semestre`;
   - Gera estatísticas agregadas em `estatisticas_disciplinas`.  
5. O resultado pode ser visualizado diretamente no banco SQLite ou por futuras rotas Flask.

---

