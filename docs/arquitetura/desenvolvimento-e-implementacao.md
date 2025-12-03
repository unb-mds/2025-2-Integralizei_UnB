# 4. Desenvolvimento e Implementação 

Esta seção detalha como o *Integralizei UnB* foi implementado, abordando arquitetura de componentes, funcionalidades entregues e práticas de DevOps.

---

## 4.1 Arquitetura da Solução

A solução segue uma arquitetura modular baseada em componentes, garantindo *facilidade de manutenção e expansão futura*.

*Componentes principais:*

| Componente | Função |
| --- | --- |
| *Ranking & Analysis Service* | Calcula a *integralização*, identificando disciplinas concluídas, pendentes e sugerindo possibilidades de matrícula futura. |
| *History Extractor Service* | Processa o histórico acadêmico do aluno, transformando o PDF em dados estruturados. |
| *Chatbot UnBot* | Suporte ao usuário via *Google Gemini API*, sem acessar dados sensíveis. |

*Decisões arquiteturais importantes:*

- Modularidade: cada serviço é independente, facilitando manutenção e futuras melhorias.  
- Segurança: Chatbot separado do processamento de históricos.  
- Escalabilidade: arquitetura preparada para integração de novos módulos.

*Diagramas da arquitetura*  

1. *Diagrama 1 – Contexto do Sistema*  
> Inserir diagrama aqui  
> ![Diagrama de Contexto](caminho/para/diagrama1.png)

2. *Diagrama 2 – Containers*  
> Inserir diagrama aqui  
> ![Diagrama de Containers](caminho/para/diagrama2.png)

3. *Diagrama 3 – Componentes / Nível 3 (C4)*  
> Inserir diagrama aqui  
> ![Diagrama de Componentes](caminho/para/diagrama3.png)

*Camadas implementadas*  

- *Frontend (SPA):* interface interativa, upload de histórico e visualização de resultados.  
- *Backend API:* orquestração dos serviços e lógica de cálculo da integralização.  
- *Database:* armazenamento de históricos anonimizados e resultados de análise.  
- *Serviços externos:* Chatbot (Google Gemini API) e API oficial da UnB para dados curriculares.

---

## 4.2 Implementação das Funcionalidades

*Funcionalidades entregues:*

- Upload de histórico acadêmico com validação de formato e segurança.  
- Cálculo da *integralização*, identificando disciplinas concluídas e pendentes.  
- Estimativa de chance de matrícula em disciplinas futuras.  
- Chatbot de suporte 24/7 (UnBot).  
- Interface interativa (SPA) para visualização de progresso e simulações de integralização.

*Prints, fluxos ou GIFs demonstrativos*  

> Inserir prints do código, telas da aplicação e fluxos aqui  
> ![Print do Frontend](caminho/para/print_frontend.png)  
> ![Print do Backend](caminho/para/print_backend.png)  
> ![Fluxo de Usuário](caminho/para/fluxo.gif)

---
