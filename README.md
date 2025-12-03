# 🎓 Integralizei UnB

**Visualização, planejamento e inteligência para sua trajetória acadêmica na Universidade de Brasília.**

---

## 1. 📌 Visão Geral

Projeto desenvolvido na disciplina de **Métodos de Desenvolvimento de Software (MDS - 2025/2)** – Engenharia de Software (FGA/UnB).

O **Integralizei UnB** é uma plataforma que simplifica a vida do estudante, permitindo o upload do histórico escolar (PDF) para gerar automaticamente métricas de desempenho, calcular integralização e oferecer recomendações de matrícula, tudo isso com segurança e persistência de dados.

### 🚀 Propósito

A aplicação resolve a dificuldade dos alunos em visualizar seu progresso real no curso e planejar os próximos semestres. Com o Integralizei, o usuário pode:

- 📊 **Acompanhar Métricas:** Visualizar IRA, créditos cursados e percentual de conclusão de forma gráfica.
- 📂 **Processamento Automático:** Extração de dados direto do PDF do histórico oficial (SIGAA).
- 🤖 **UnBot:** Tirar dúvidas sobre regras acadêmicas (IRA, menções, matrícula) com um assistente virtual.
- 🔒 **Segurança:** Dados vinculados à conta do usuário com autenticação robusta.

---

## 2. 🧩 Links Importantes

- 🎨 **[Protótipo de Alta Fidelidade](https://www.figma.com/design/O0hfvabbozN0wcHUb9xal0/Integralizei-UnB-Prototipo--c%C3%B3pia-?node-id=2-5057&p=f&t=us5kKhKGEUbQWBEo-0)**
- 🎨 **[Protótipo de Alta Fidelidade](https://www.figma.com/design/O0hfvabbozN0wcHUb9xal0/Integralizei-UnB-Prototipo--c%C3%B3pia-?node-id=274-782&p=f&t=us5kKhKGEUbQWBEo-0)**
- 🗺️ **[Story Map](https://www.figma.com/board/iYClmkeuO6PYRTE8YbSFgY/Integralizei-UnB?node-id=0-1&p=f&t=eaMuHT7w1QAbSRtX-0)**
- 📚 **[Documentação Completa](https://unb-mds.github.io/2025-2-Integralizei_UnB/)**
  
---

## 3. 📌 Funcionalidades

### ✅ Implementadas

- **Upload e Parser de Histórico:** Leitura inteligente de PDFs acadêmicos da UnB, identificando disciplinas, notas e menções.
- **Dashboard do Aluno:** Visualização clara de IRA, MP (Média Ponderada) e horas integralizadas vs. exigidas.
- **Autenticação Híbrida:**
  - Login tradicional (E-mail/Senha).
  - Login social via **Google OAuth**.
- **Persistência de Dados:** Seus dados ficam salvos na nuvem (PostgreSQL) e acessíveis de qualquer dispositivo.
- **UnBot (Chatbot):** Assistente para responder dúvidas frequentes sobre a vida acadêmica.
- **Calculadora de Fluxo:** Simulação de matérias futuras e impacto na integralização.
- **Segurança de Upload:** O sistema exige autenticação para processar e salvar históricos, garantindo a privacidade.

---

## 4. 🏗️ Arquitetura e Tecnologias

O projeto utiliza uma arquitetura de **Microsserviços** containerizada, separando responsabilidades para maior escalabilidade.

| Serviço          | Tecnologia                   | Responsabilidade                                                             |
| ---------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| **Frontend**     | Next.js (React) + Tailwind   | Interface do usuário, responsividade e interações dinâmicas.                 |
| **Backend Core** | Python (Flask)               | Processamento de PDF, cálculos estatísticos e lógica de negócios acadêmicos. |
| **Auth Service** | Node.js (Express + Passport) | Gerenciamento de usuários, sessões e autenticação Google OAuth.              |
| **Database**     | PostgreSQL                   | Armazenamento relacional robusto de alunos, disciplinas e estatísticas.      |
| **Infra**        | Docker & Docker Compose      | Orquestração de todo o ambiente de desenvolvimento e produção.               |

**Destaque Técnico:**

- O sistema possui um mecanismo de **Auto-Schema**: ao iniciar, o Backend verifica e cria automaticamente as tabelas necessárias no PostgreSQL, garantindo que o ambiente funcione imediatamente após o clone.

---

## 5. 🚀 Como Rodar o Projeto

Siga os passos abaixo para executar a aplicação localmente. O projeto é totalmente "dockerizado", facilitando a configuração.

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose instalados.
- [Git](https://git-scm.com/) instalado.

### Passo a Passo

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/unb-mds/2025-2-Integralizei_UnB.git
   cd 2025-2-Integralizei_UnB
   ```

2. **Configure as Variáveis de Ambiente (Opcional):**

   - O projeto já possui configurações padrão para desenvolvimento local no `docker-compose.yml`.
   - Caso precise configurar chaves do Google ou Banco, crie um arquivo `.env` na raiz baseado no `.env.exemplo`.

3. **Execute com Docker Compose:**
   Este comando irá construir as imagens (Frontend, Python Core, Node Auth e Postgres) e iniciar o sistema.

   ```bash
   docker-compose up --build
   ```

4. **Acesse a Aplicação:**

   - **Frontend:** [http://localhost:3000](http://localhost:3000) <-- Entre nesse localhost
   - **API Core:** [http://localhost:5000](http://localhost:5000)
   - **Auth Service:** [http://localhost:3001](http://localhost:3001)

### 🧪 Reiniciando o Programa

**Devido ao uso do Docker, caso tente reiniciar a programação sem apagar totalmente a database, o codigo falhara, coloque o seguinte codigo para reinicar a aplicação corrertamente:**

```bash
docker-compose down -v 
docker builder prune --all --force
docker-compose up --build
```

---
<div align="center">

## 6. 👥 Equipe

**Squad 09 – MDS 2025/2 – FGA/UnB**

| | | |
|:---:|:---:|:---:|
| <a href="https://github.com/GUGOFO"><img src="https://github.com/GUGOFO.png" width="200"></a><br>**Gustavo (GUGOFO)** | <a href="https://github.com/gpaulovit"><img src="https://github.com/gpaulovit.png" width="200"></a><br>**Paulo Vitor** | <a href="https://github.com/menali17"><img src="https://github.com/menali17.png" width="200"></a><br>**Enzo Menali** |
| <a href="https://github.com/AnnaBeatrizAraujo"><img src="https://github.com/AnnaBeatrizAraujo.png" width="200"></a><br>**Anna Beatriz** | <a href="https://github.com/iicaroll"><img src="https://github.com/iicaroll.png" width="200"></a><br>**Carol** | <a href="https://github.com/carolinabecker"><img src="https://github.com/carolinabecker.png" width="200"></a><br>**Carolina Becker** |

</div>

---

## 7. 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

