+++
title = "Documento de Arquitetura 🏗️"
weight = 60
toc = true
+++

O projeto **Integralizei UnB** foi criado para reduzir a incerteza e a ansiedade dos alunos durante o período de matrículas na UnB. Esta plataforma analisa o histórico acadêmico para fornecer clareza sobre o progresso do curso e a viabilidade de cursar disciplinas.

Este documento apresenta a arquitetura do sistema, servindo como um guia central para a equipe de desenvolvimento.

### Funcionalidades Principais
✅ **Cálculo Preciso:** Fornece valores atualizados de integralização e IRA.  
✅ **Verificação de Viabilidade:** Confirma se o aluno pode cursar disciplinas específicas.  
✅ **Sugestões Inteligentes:** Recomenda matérias optativas com base nos critérios do aluno.

---

### 2. Princípios da Arquitetura

Nossa arquitetura foi projetada sobre três pilares essenciais para garantir a qualidade e a longevidade do projeto:

- **Manutenibilidade:** Uma modularidade clara que permite ajustes e a evolução contínua do sistema sem grandes impactos.
- **Testabilidade:** Cada componente é isolado, permitindo a criação de testes unitários e de integração confiáveis.
- **Produtividade:** Um ecossistema tecnológico coeso (Next.js/TypeScript) que simplifica o desenvolvimento e a integração.

---

### 3. Pilha Tecnológica

- **Front-end:** Next.js (React + TypeScript) com **Zustand** para gerenciamento de estado global.
- **Back-end:** Next.js API Routes (Node.js + TypeScript).
- **Banco de Dados:** PostgreSQL.
- **Serviços Externos:** Google Gemini API (extração de dados de PDF) e API da Sua Grade UnB.

---

### 4. Modelo Arquitetural (C4)

#### Nível 1: Diagrama de Contexto
Mostra o sistema como uma "caixa-preta", suas interações com o usuário (Aluno) e sistemas externos.

![Diagrama de Contexto Nível 1](/images/Diagrama1.png)

#### Nível 2: Diagrama de Contêineres
Apresenta os contêineres principais: SPA, Backend API e Banco de Dados.

![Diagrama de Contêineres Nível 2](/images/Diagrama2.png)

#### Nível 3: Diagrama de Componentes
Detalha os principais blocos internos do Backend API.

![Diagrama de Componentes Nível 3](/images/Diagrama3.png)

---

### 5. Fluxo de Dados

1.  **Envio:** O aluno envia o histórico acadêmico (PDF) através da interface (SPA).
2.  **Orquestração:** O `Analysis Controller` no back-end recebe o arquivo e gerencia o fluxo de processamento.
3.  **Extração:** O `PDF Extractor`, usando a API do Gemini, extrai os dados estruturados do histórico.
4.  **Análise:** O `Ranking & Analysis Service` recebe os dados, consulta o repositório histórico e realiza todos os cálculos.
5.  **Resultado:** A análise final (IRA, integralização, sugestões) é retornada para a SPA e exibida ao aluno.

---

### 6. Decisões Arquiteturais (ADRs)

> Todas as decisões arquiteturais importantes são documentadas e mantidas na pasta `/docs/adr/`. Isso garante a rastreabilidade e o compartilhamento de conhecimento sobre as escolhas técnicas que moldaram o projeto.

---
### 7. Conclusão
> A arquitetura do Integralizei UnB foi pensada para ser robusta e flexível, garantindo que o sistema não só atenda às necessidades atuais dos alunos, mas que também possa evoluir e incorporar novas funcionalidades no futuro.