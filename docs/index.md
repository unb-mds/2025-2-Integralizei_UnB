---
title: Integralizei UNB
hide:
  - navigation # Esconde menu lateral esquerdo
---

# Integralizei UNB

Uma ferramenta pensada para acabar com o "achismo" no momento mais crucial do semestre: a matrícula.
Utilizando uma base de dados com informações de alunos que já cursaram essa mesma disciplina, em vez de ansiedade, você terá o poder dos dados para planejar seu semestre com mais confiança e tranquilidade.

<div class="grid cards" markdown>

-   :material-clipboard-text-outline: **Ver Requisitos do Projeto**

    ---

    Consulte os requisitos funcionais e não funcionais que guiam nosso desenvolvimento.

    [:arrow_right: Acessar Requisitos](requisitos/index.md)

</div>


## Como Funciona o Nosso Backend?

Para criar o **INTEGRALIZEI UNB**, nosso backend foi construído com quatro conceitos fundamentais. Acesse os links abaixo para ler os detalhes técnicos.

<div class="grid cards" markdown>

-   :material-inbox-arrow-down: **1. Coleta de Dados**

    ---

    Entenda como coletamos os históricos acadêmicos de forma segura e anônima.

    [:arrow_right: Ler mais](arquitetura/coleta-de-dados.md)

-   :material-robot: **2. Extração com IA**

    ---

    Veja como usamos IA para ler os PDFs e extrair as informações de forma precisa.

    [:arrow_right: Ler mais](arquitetura/extracao-com-ia.md)

-   :material-database: **3. Armazenamento**

    ---

    Aprenda como organizamos e armazenamos os dados extraídos em nosso banco de dados.

    [:arrow_right: Ler mais](arquitetura/armazenamento.md)

-   :material-chart-bar: **4. Lógica de Análise**

    ---

    Descubra a lógica e os cálculos que usamos para gerar a análise de integralização e o IRA.

    [:arrow_right: Ler mais](arquitetura/logica-de-analise.md)

</div>

## 2. Visão Geral do Produto / Solução

### 2.1 Descrição Técnica da Solução Desenvolvida
O *Integralizei UnB* é uma *Single-Page Application (SPA)* que permite aos estudantes interagir com todo o sistema sem recarregar páginas, proporcionando uma experiência fluida e responsiva.

*Fluxo de dados principal:*  
1. Upload do histórico acadêmico pelo usuário na SPA.  
2. Processamento pelo *History Extractor Service* para organizar os dados.  
3. Cálculo da *integralização* pelo *Ranking & Analysis Service*, que identifica disciplinas concluídas e pendentes.  
4. Resultados exibidos na interface para análise e simulação do progresso acadêmico.  
5. Suporte via *Chatbot UnBot, que utiliza **Google Gemini API* de forma segura, sem acessar dados sensíveis do aluno.

---

### 2.2 Principais Usuários e Necessidades

| Persona / Usuário | Necessidade | Como o Integralizei UnB atende |
| --- | --- | --- |
| Estudante que busca matrícula em disciplinas concorridas | Saber as chances de conseguir vaga | Estimativa probabilística via *Ranking & Analysis Service* |
| Estudante que quer planejar a integralização | Visualizar o progresso em relação às disciplinas pendentes | Simulações em tempo real na *SPA* |
| Estudante com dúvidas sobre regras | Suporte rápido e confiável | *Chatbot UnBot, integrado à **Google Gemini API* |

---

### 2.3 Arquitetura Geral do Sistema (Containers)

| Container | Tecnologias | Função | Comunicação |
| --- | --- | --- | --- |
| SPA | Next.js, React, TypeScript | Interface do usuário e upload de históricos | JSON/HTTPS com Backend API |
| Backend API | Node.js, Next.js API Routes | Orquestra serviços e cálculos da integralização | JSON/HTTPS |
| Banco de Dados | PostgreSQL | Persistência de históricos anonimizados e resultados de análise | SQL |
| Sistema Externo 1 | Google Gemini API | Fornece respostas contextuais ao Chatbot | HTTPS |
| Sistema Externo 2 | API Sua Grade UnB | Dados oficiais do catálogo de disciplinas da UnB | HTTPS |

---

### 2.4 Tecnologias Utilizadas (Justificadas)

| Categoria | Tecnologia | Justificativa Técnica |
| --- | --- | --- |
| Front-end | *Next.js / React* | Permite criar *SPAs rápidas, interativas e responsivas*, melhorando a experiência do usuário e facilitando a renderização dinâmica de dados da integralização. |
| Linguagem | *TypeScript* | Tipagem estática garante maior *robustez do código*, reduz erros em tempo de execução e facilita manutenção colaborativa em equipe. |
| Banco de Dados | *PostgreSQL* | SGBD relacional confiável, capaz de *armazenar históricos anonimizados com integridade*, suportando consultas complexas e cálculos do serviço de ranking. |
| Back-end | *Node.js* | Suporta operações assíncronas com alta performance, ideal para *processamento de dados e comunicação com APIs externas* em tempo real. |
| Ferramentas de Desenvolvimento | *VS Code / Figma* | VS Code para desenvolvimento colaborativo e manutenção de código, Figma para prototipagem visual, garantindo *consistência na interface e na experiência do usuário*. |
| Chatbot | *Google Gemini API* | Oferece *respostas contextuais confiáveis* aos usuários, garantindo suporte rápido sem comprometer dados sensíveis. |

## A Equipe Por Trás do Projeto

Este projeto foi desenvolvido por estudantes da disciplina de Métodos de Desenvolvimento de Software.

<div class="grid cards" markdown>

-   **Ana Beatriz Souza**

    ---
    Desenvolvedor

-   **Ana Caroline Dantas**

    ---
    Desenvolvedor

-   **Ana Carolina Becker**

    ---
    Desenvolvedor

-   **Enzo Menali Vettorato**

    ---
    Desenvolvedor

-   **Gustavo Gomes**

    ---
    Scrum Master

-   **Paulo Vitor Gomes**

    ---
    Product Owner

</div>