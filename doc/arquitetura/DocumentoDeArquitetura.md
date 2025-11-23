# Documento de Arquitetura 

## Projeto: Integraizei UnB
---

## 1. Visão Geral e Objetivos da Arquitetura

O período de matrículas na Universidade de Brasília (UnB) costuma gerar ansiedade: os alunos não têm clareza sobre quais disciplinas podem cursar, nem sobre a viabilidade de pegar determinadas optativas.  

O projeto **Integralizei UnB** foi criado para reduzir essa incerteza. A plataforma permite que o estudante faça upload de seu histórico acadêmico e obtenha:

* Cálculo atualizado da **integralização** e do **IRA**.  
* Verificação da possibilidade de cursar disciplinas específicas com base na integralização e no IRA.  
* Sugestões de matérias optativas que o aluno consegue cursar, considerando os mesmos critérios.  

Este documento apresenta a arquitetura do sistema, descrevendo suas camadas, componentes principais, decisões críticas e fluxo de dados, servindo de guia para desenvolvimento e evolução futura do projeto.

---

## 2. Princípios da Arquitetura

A arquitetura foi definida com base em três pilares:

* **Manutenibilidade:** modularidade clara, permitindo ajustes e evolução do sistema.  
* **Testabilidade:** cada componente é isolável para testes confiáveis.  
* **Produtividade da equipe:** ecossistema tecnológico coeso, simplificando desenvolvimento e integração.  

Para atingir esses objetivos, adotamos:

* **Arquitetura em Camadas (Layered Architecture):** separa Apresentação → Lógica de Negócio → Serviços → Acesso a Dados.  
* **Modelo Cliente-Servidor:** front-end (SPA) separado do servidor, garantindo responsividade e escalabilidade.  
* **Orquestrador de Serviços no Back-end:** centraliza o fluxo de processamento (extração de dados, cálculos de integralização, verificação de disciplinas, recomendações), evitando microserviços complexos.

---

## 3. Pilha Tecnológica

* **Front-end:** Next.js (React + TypeScript) para SPA, com **Zustand** para estado global.  
* **Back-end:** Next.js API Routes + Node.js em TypeScript, centralizando lógica e comunicação.  
* **Banco de Dados:** PostgreSQL para armazenar resultados de integralização, escolhas de disciplinas e recomendações.  
* **Serviços externos:** Google Gemini API para extração de dados de PDFs; API da Sua Grade UnB para informações complementares.  

---

## 4. Modelo Arquitetural (C4)

### Nível 1: Diagrama de Contexto
Mostra o sistema como uma "caixa-preta", suas interações com o usuário (Aluno) e sistemas externos.

![Diagrama de Contexto Nível 1](https://github.com/unb-mds/2025-2-Integralizei_UnB/blob/292800e9dd7cd3b7097944546f4675c81f4699f7/doc/Fotos/Diagramas/Diagrama1.png)

### Nível 2: Diagrama de Contêineres
Apresenta os contêineres principais: SPA, Backend API e Banco de Dados.

![Diagrama de Contêineres Nível 2](https://github.com/unb-mds/2025-2-Integralizei_UnB/blob/f5715b4554a1efa46dd4e303a4812e12551f3f98/doc/Fotos/Diagramas/Diagrama2.png)

### Nível 3: Diagrama de Componentes
Detalha os principais blocos internos do Backend API:

* **Analysis Controller:** orquestra operações, recebe histórico do aluno.  
* **PDF Extractor (Gemini Facade):** extrai dados estruturados do PDF do histórico.  
* **Ranking & Analysis Service:** calcula integralização, IRA, verifica viabilidade de disciplinas e optativas.  
* **History Repository:** consulta dados históricos do banco para análise comparativa.  

![Diagrama de Componentes Nível 3](https://github.com/unb-mds/2025-2-Integralizei_UnB/blob/cca0a92cb81c3b074f2774e294b4547920b222cb/doc/Fotos/Diagramas/Diagrama3.png)

---

## 5. Fluxo de Dados

1. O aluno envia o histórico acadêmico via SPA.  
2. O `Analysis Controller` recebe o arquivo e solicita a extração ao `PDF Extractor`.  
3. Dados extraídos são enviados ao `Ranking & Analysis Service`.  
4. O serviço consulta o `History Repository` para obter informações históricas e comparar integralização e IRA.  
5. São calculados integralização, IRA, viabilidade de disciplinas e recomendações de optativas que o aluno consegue cursar.  
6. O resultado final é retornado à SPA, que atualiza a interface do usuário.  

---

## 6. Decisões Arquiteturais Chave (ADRs)

* Registros de decisão mantidos em `/docs/adr/`.   
* Permitem rastrear a evolução do projeto e justificar escolhas estratégicas.  

---

## 7. Conclusão

A arquitetura do Integralizei UnB combina padrões reconhecidos (Arquitetura em Camadas, Modelo Cliente-Servidor) com uma pilha integrada, que garante clareza e organização na implementação,
capacidade de evolução e manutenção futuras além de confiabilidade na análise de integralização, IRA e viabilidade de disciplinas obrigatórias/optativas. Esse documento serve como referência central para a equipe, oferecendo visão completa da estrutura, fluxos e decisões do sistema.
