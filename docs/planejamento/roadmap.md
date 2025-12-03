# 3.1 Roadmap e Story Map

Este documento detalha o escopo funcional do projeto **Integralizei UnB**, organizado em Épicos e User Stories, com seus respectivos critérios de aceitação.

## Visão Geral do Roadmap

O desenvolvimento foi dividido em 3 grandes Épicos, entregues ao longo de 5 Sprints de desenvolvimento e 1 Sprint de revisão.

| Épico | Descrição | Status |
| :--- | :--- | :--- |
| **1. Análise e Predição** | Jornada central: upload de histórico e análise de dados. | ✅ Concluído |
| **2. Calculadora** | Ferramenta de planejamento proativo de semestres. | ✅ Concluído |
| **3. Pesquisa de Turmas** | Comparação com dados históricos da universidade. | ✅ Concluído |

---

## Detalhamento dos Épicos

### 🧗 ÉPICO 1: Análise de Histórico Pessoal e Predição de Vaga

**Objetivo:** Permitir que o aluno entenda sua situação atual e suas chances futuras.

#### US01 a US04: Acesso e Processamento
* **US01: Cadastro de Novo Usuário**
* **US02: Login de Usuário Existente**
* **US03: Upload do Histórico (PDF)**
* **US04: Feedback de Processamento**
    * *Critérios de Aceitação:*
        * O sistema deve aceitar apenas arquivos `.pdf`.
        * O tempo de processamento não deve exceder 15 segundos (RNF02).
        * Deve haver feedback visual (loading) durante a extração.

#### US05 a US07: Dashboard e Métricas
* **US05: Visualização do Dashboard**
* **US06: Visualização de Métricas (IRA, % Integralização)**
* **US07: Listagem de Matérias Pendentes**
    * *Critérios de Aceitação:*
        * Acurácia da extração de dados deve ser superior a 95% (RNF01).
        * As matérias pendentes devem ser separadas por obrigatórias e optativas.

#### US08 a US09: Inteligência
* **US08: Sugestão de Matérias Optativas**
* **US09: Predição de Chance na Vaga**
    * *Critérios de Aceitação:*
        * A predição deve exibir claramente um status: "Alta", "Média" ou "Baixa".
        * O cálculo deve considerar o IRA do aluno versus o histórico da disciplina.

---

### 💡 ÉPICO 2: Calculadora de Simulação de Semestre

**Objetivo:** Permitir a montagem de grades futuras e verificação de impacto no curso.

#### US10 a US14: Ferramenta de Simulação
* **US10: Acesso à Calculadora**
* **US11: Busca de Matérias para Simulação**
* **US12: Montagem da Simulação (Adicionar/Remover)**
* **US13: Visualização do Resultado (Cálculo em Tempo Real)**
    * *Critérios de Aceitação:*
        * Ao adicionar uma matéria, o "Novo % de Integralização" deve atualizar instantaneamente sem recarregar a página.
        * O sistema deve impedir a adição de matérias duplicadas na mesma simulação.
* **US14: Salvar Simulação**
    * *Critérios de Aceitação:*
        * O usuário deve poder recuperar a simulação salva após fazer logout e login novamente.

---

### 🔎 ÉPICO 3: Pesquisa e Comparação de Turmas

**Objetivo:** Fornecer dados históricos para tomada de decisão.

#### US15 a US18: Exploração de Dados
* **US15: Pesquisa de Matéria e Turmas**
* **US16: Visualização de Estatísticas da Turma**
* **US17: Visualização de "Ranking" Anônimo**
    * *Critérios de Aceitação:*
        * Os dados dos alunos no ranking devem ser totalmente anonimizados (sem nomes ou matrículas), exibindo apenas o IRA.
* **US18: Favoritar Turmas de Interesse**
    * *Critérios de Aceitação:*
        * O usuário deve ter uma lista de acesso rápido às turmas favoritadas.