---
title: Integralizei UNB
hide:
  - navigation # Esconde menu lateral esquerdo
---

# Integralizei UNB

Uma ferramenta pensada para acabar com o "achismo" no momento mais crucial do semestre: a matrícula.
Utilizando uma base de dados com informações de alunos que já cursaram essa mesma disciplina, em vez de ansiedade, você terá o poder dos dados para planejar seu semestre com mais confiança e tranquilidade.

## Contextualização do Problema

A época de matrícula na Universidade de Brasília (UnB) é historicamente um momento de grande expectativa e, frequentemente, de angústia e decepção para os estudantes. A incerteza sobre conseguir vagas com professores específicos gera dúvidas constantes, como "Será que eu consigo com ele?" ou "E se eu não passar e ficar sem a vaga?". Esse cenário leva muitos alunos a tomarem decisões baseadas em "achismo" ou a escolherem professores "mais fáceis" apenas para garantir a matrícula.

## Motivação

A motivação para o desenvolvimento do **Integralizei UnB** nasceu da experiência pessoal dos membros da equipe, que conhecem de perto o nervosismo de atualizar a página do SIGAA torcendo por um resultado positivo. O objetivo é substituir a ansiedade pelo poder dos dados, permitindo que o aluno planeje seu semestre com confiança e tranquilidade.

## Objetivos do Projeto

### Objetivo Geral
Criar uma ferramenta central para o planejamento de matrícula na UnB, reduzindo a incerteza dos estudantes através de análise de dados.

### Objetivos Específicos
* **Apoio à Decisão:** Fornecer análises que ajudem a tomar decisões estratégicas sobre quais turmas cursar.
* **Previsibilidade:** Analisar e prever a chance aproximada de garantir uma vaga com determinado professor utilizando dados históricos.
* **Qualidade de Produto:** Construir um produto de alta qualidade para a disciplina de Métodos de Desenvolvimento de Software (MDS).
* **Engajamento:** Alcançar um alto número de usuários ativos a cada semestre.

## Escopo Inicial Definido

O escopo do projeto foi estruturado em torno de quatro pilares fundamentais no backend: Coleta, Extração, Armazenamento e Lógica de Análise. As principais funcionalidades definidas foram:

1. **Análise de Histórico Pessoal:** Upload de PDF, extração via IA e geração de dashboard com IRA e progresso.
2. **Calculadora de Simulação:** Ferramenta interativa para simular grades futuras e verificar o impacto na integralização em tempo real.
3. **Pesquisa e Comparativo:** Mecanismo de busca para explorar dados históricos de turmas e comparar perfis de alunos (IRA, integralização).
4. **UnBot:** Assistente virtual para tirar dúvidas sobre regras acadêmicas.

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

-   **Carolina Becker**

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