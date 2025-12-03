# 3.2 Organização do Trabalho

Esta seção descreve a metodologia, os rituais e as ferramentas utilizadas pela equipe de 6 integrantes para o desenvolvimento do **Integralizei UnB**.

## 🔄 Modelo Ágil Adotado: Híbrido (Scrum + XP)

Dada a natureza do projeto (prazo fixo de 6 semanas e equipe pequena), optamos por uma abordagem híbrida para maximizar a entrega de valor e a qualidade do código.

* **Scrum:** Utilizado para a gestão macro, organização temporal e rituais de alinhamento.
* **Extreme Programming (XP):** Utilizado para as práticas de engenharia de software e execução das tarefas diárias.

### Estrutura das Sprints
O projeto foi executado em **6 Sprints de 1 semana** (Weekly Sprints), permitindo feedback rápido e correção de rota.

* **Sprint 1 a 5:** Desenvolvimento de Funcionalidades (Feature Dev).
* **Sprint 6:** Hardening (Estabilização, Bug Bash e Polimento).

---

## 📅 Rituais e Cerimônias

A rotina semanal da equipe seguia o seguinte calendário:

1.  **Sprint Planning (Segunda-feira):**
    * Definição da Meta da Sprint.
    * Quebra das User Stories em tarefas técnicas.
    * Estimativa e voluntariado para as tarefas.
2.  **Daily Stand-up (Diário - 15 min):**
    * Foco em desbloquear impedimentos.
    * Pergunta chave: "O que impede o meu par de entregar a tarefa hoje?"
3.  **Sprint Review & Retrospective (Sexta-feira):**
    * Demonstração do software funcionando (Deploy em ambiente de staging).
    * Discussão sobre melhoria contínua do processo (Kaizen).

---

## 👥 Papéis e Dinâmica da Equipe

A equipe de 6 pessoas operou sem hierarquia rígida, mas com responsabilidades claras baseadas em **Programação em Pares (Pair Programming)** do XP.

* **Product Owner (Rotativo):** Responsável por priorizar o backlog e validar se as entregas atendiam aos critérios de aceitação.
* **Dev Team (3 Pares):**
    * A execução das tarefas foi realizada 100% em pares para garantir qualidade de código e compartilhamento de conhecimento.
    * **Rotação de Pares:** Os pares eram trocados a cada 2 ou 3 dias para evitar silos de conhecimento (ex: apenas uma pessoa saber mexer no parser de PDF).
    * **Foco Vertical:** Cada par era responsável por uma *feature* de ponta a ponta (Front-end + Back-end + Banco de Dados).

---

## 🛠️ Ferramentas Adotadas

O ecossistema de ferramentas foi escolhido para suportar a integração contínua e a transparência.

| Categoria | Ferramenta | Uso no Projeto |
| :--- | :--- | :--- |
| **Gestão de Backlog** | Trello / GitHub Projects | Quadro Kanban para acompanhamento visual das tarefas. |
| **Versionamento** | Git & GitHub | Controle de versão. Uso de *Pull Requests* para revisão de código antes do merge na `main`. |
| **Documentação** | MkDocs + Hugo | Geração de documentação estática e site do projeto. |
| **CI/CD** | GitHub Actions | Pipeline automatizado para rodar testes e realizar deploy. |
| **Design/Prototipação** | Figma | Criação dos protótipos de alta fidelidade antes da codificação. |
| **Comunicação** | Discord/Slack | Comunicação assíncrona e chamadas de voz para pareamento. |