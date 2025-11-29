# 📚 Arquitetura de Software  

---

## 🔹 Introdução  
- As bases nas quais um software é erguido para que seja o mais robusto, escalável e sustentável.  
- A arquitetura estabelece as fundações nas quais os sistemas de alta qualidade são erguidos.  

---

## 🔹 Definição  
- É a organização fundamental de um sistema, definindo como o software será construído e como suas diferentes partes irão interagir.  
- Arquitetura **não é código**, mas sim as decisões e escolhas que nortearão e serão guias do projeto, definindo o esqueleto sobre o qual o projeto será implementado.  

---

## 🔹 Propósito  
- O propósito é não apenas organizar o código, mas definir a estrutura e o comportamento de um sistema garantindo que ele atenda:  
  - **Requisitos Funcionais**: o que deve ser feito pelo sistema.  
  - **Requisitos Não Funcionais (Atributos de Qualidade)**: como o sistema deve se comportar.  

> **Atributos de Qualidade** são propriedades mensuráveis ou testáveis que se concentram em _como_ o software executa suas funções, em contraste com os requisitos funcionais, que definem _o que_ ele faz.  

- A busca pelos atributos de qualidade define as decisões arquiteturais mais relevantes.  
- Uma arquitetura bem planejada serve como guia para o desenvolvimento e a evolução de software.  

---

## 🔹 O Papel da Arquitetura no Ciclo de Vida do Desenvolvimento de Software  
- A arquitetura não é um artefato estático: seu papel é dinâmico e evolui ao longo do **SDLC (_Software Development Life Cycle_)**.  
- A integração **eficaz** da arquitetura ao longo das etapas do SLDC é vital para o sucesso do projeto, levando a:  
  - Redução de riscos  
  - Aumento da qualidade  
  - Decisões mais assertivas  

### 📌 Nas fases do SDLC:  
- **Fase Inicial**: a arquitetura é a espinha dorsal da inovação.  
- **Fase de Manutenção**: foco em excelência operacional e sustentabilidade.  
- **Gestão de Mudanças**: requisitos evoluem, tecnologias ficam obsoletas, e novas oportunidades surgem → decisões arquiteturais ajudam a reduzir custos e complexidade das mudanças.  

---

## 🔹 Os Pilares de uma Arquitetura Robusta  
- A excelência de uma arquitetura é medida por sua capacidade de satisfazer atributos de qualidade.  
- O arquiteto deve equilibrar atributos que muitas vezes competem entre si (**trade-offs**).  
- Arquitetura é essencialmente sobre **alocação de recursos** e **gestão de restrições**.  

### 🔍 Análise de Atributos de Qualidade  
- ⚡ **Escalabilidade**: capacidade de crescer verticalmente ou horizontalmente.  
- 🔧 **Manutenibilidade**: facilidade de modificar, corrigir e evoluir o sistema.  
- 🚀 **Desempenho**: tempo de resposta, latência e eficiência no uso de recursos.  
- 🔒 **Segurança**: confidencialidade, integridade e disponibilidade.  
- 🧪 **Testabilidade**: facilidade em isolar e validar partes do sistema.  

---

## 🔹 Paradigmas Fundamentais: Estilos Arquiteturais  

### 📌 Diferença entre **Estilo** e **Padrão**  
- **Estilo Arquitetural**: filosofia de design de alto nível, define a macroestrutura (ex: Cliente-Servidor, Microsserviços).  
- **Padrão Arquitetural**: solução reutilizável para um problema recorrente dentro de um estilo (ex: API Gateway em Microsserviços).  

---

## 🔹 Análise dos Estilos Arquiteturais  

### 🏛️ Monolítico  
- **Estrutura**: aplicação única e coesa.  
- ✅ **Vantagens**: simplicidade inicial, facilidade de desenvolvimento, boa performance em pequena escala.  
- ❌ **Desvantagens**: pouca escalabilidade, manutenção complexa, reimplantação completa a cada mudança.  
- 🔍 **Exemplo**: Stack Overflow.  

---

### 🧩 Microsserviços  
- **Estrutura**: coleção de serviços independentes, cada um com seu próprio código e banco de dados.  
- ✅ **Vantagens**: escalabilidade granular, maior resiliência, agilidade em equipes autônomas.  
- ❌ **Desvantagens**: maior complexidade operacional, latência de rede, consistência de dados difícil.  
- 🔍 **Exemplos**: Netflix, Amazon, Uber, Spotify.  
- ⚖️ **Lei de Conway**: a arquitetura reflete a estrutura da organização.  

---

### 📡 Orientado a Eventos (EDA - Event Driven Architecture)  
- **Estrutura**: comunicação assíncrona via eventos (produtores, consumidores e broker).  
- ✅ **Vantagens**: desacoplamento, alta escalabilidade e resiliência.  
- ❌ **Desvantagens**: complexidade de monitoramento e rastreamento de eventos.  
- 🔍 **Uso**: geralmente combinado com microsserviços para orquestração.  

---

### 💻 Cliente-Servidor  
- **Estrutura**: divisão entre cliente (UI) e servidor (lógica e dados).  
- ✅ **Vantagens**: centralização, manutenção facilitada, segurança.  
- ❌ **Desvantagens**: acoplamento médio, escalabilidade limitada ao servidor.  
- 🔍 **Uso**: base da maioria das aplicações web e móveis modernas.  

---

## 🔹 Padrões de Arquitetura  

### 🏗️ Arquitetura em Camadas  
- Camada de Apresentação (UI)  
- Camada de Negócios  
- Camada de Persistência  
- Camada de Banco de Dados  

---

### 🎭 Model-View-Controller (MVC)  
- **Model**: dados e lógica de negócios.  
- **View**: interface com o usuário.  
- **Controller**: intermediário, coordena Model ↔ View.  

---

### 🔀 Pipe-and-Filter  
- **Filters**: processam os dados.  
- **Pipes**: conectam os filtros.  
- ✅ **Vantagens**: modularidade, reusabilidade e composição flexível.  

---

## 🔹 Tomada de Decisão Arquitetural  
- Arquitetura é sobre **trade-offs**.  
- Exemplo:  
  - Microsserviços → Escalabilidade e agilidade, mas complexidade operacional.  
  - Monólito → Simplicidade inicial, mas baixa escalabilidade.  
  - NoSQL → flexibilidade, mas menor consistência transacional.  

> O papel do arquiteto é alinhar arquitetura com **objetivos do negócio e restrições do projeto**.  

---

## 🔹 📊 Tabela Comparativa de Estilos Arquiteturais  

| **Característica** | **Monolítico** | **Microsserviços** | **Orientado a Eventos (EDA)** | **Cliente-Servidor** |  
|---------------------|----------------|---------------------|-------------------------------|-----------------------|  
| **Estrutura**       | Unidade única  | Serviços independentes | Serviços reativos a eventos | Divisão cliente/servidor |  
| **Acoplamento**     | Alto           | Baixo               | Muito Baixo (desacoplado)    | Médio                 |  
| **Escalabilidade**  | Baixa          | Alta (granular)     | Muito Alta                   | Média                 |  
| **Complexidade**    | Baixa inicial  | Alta (distribuído)  | Alta (monitoramento difícil) | Baixa a Média         |  
| **Agilidade**       | Baixa          | Alta                | Alta                         | Média                 |  
| **Ideal para**      | Projetos pequenos, MVPs | Grandes aplicações complexas | Sistemas reativos/integração | Aplicações Web e Mobile |  

---
