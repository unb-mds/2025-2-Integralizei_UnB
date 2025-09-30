# Sistema de Upload e Processamento de Histórico Acadêmico

## Visão Geral
Este projeto permite que o usuário **faça upload de históricos acadêmicos em PDF**.  
O sistema extrai dados importantes utilizando a **API Google Gemini** e os armazena em um **banco de dados**.

Fluxo principal:
1. O usuário envia um PDF de histórico acadêmico.
2. A API Gemini processa o arquivo e retorna um JSON com:
   - Semestre de ingresso
   - Curso
   - Lista de disciplinas (código, nome, menção, carga horária)
3. O Flask salva esses dados em um **banco de dados relacional**  
   - **SQLite** em desenvolvimento (arquivo `instance/dados.db`)  
   - **PostgreSQL** em produção (via variável `DATABASE_URL`)

---

## Tecnologias Utilizadas
- **Flask** – servidor web e rotas.
- **Google Gemini API** – processamento e extração de informações do PDF.
- **Flask-SQLAlchemy / SQLAlchemy** – ORM para interação com o banco.
- **SQLite** – banco de dados local para desenvolvimento.
- **PostgreSQL** – banco recomendado para produção.
- **python-dotenv** – gerenciamento de variáveis de ambiente.
- **VS Code + SQLite Viewer** – visualização dos dados em desenvolvimento.


## Dependências Principais
-Flask
-Flask-SQLAlchemy
-SQLAlchemy
-psycopg2-binary   # necessário apenas para PostgreSQL
-google-generativeai
-python-dotenv
-gunicorn      

# Estrutura do Projeto
project/
│
├─ app.py # Código principal da aplicação Flask
├─ requirements.txt # Lista de dependências do projeto
├─ .env.local # Variáveis de ambiente (não versionar)
│
├─ templates/ # Páginas HTML usadas pelo Flask
│ ├─ index.html # Formulário para upload do histórico em PDF
│ ├─ admin.html # (opcional) Painel de listagem de históricos
│ └─ history_detail.html # (opcional) Detalhes de um histórico específico
│
├─ static/ # Arquivos estáticos (CSS, JS, imagens) 
│
└─ instance/ # Pasta especial para dados locais
└─ dados.db # Banco SQLite criado automaticamente em desenvolvimento

## Progresso do Desenvolvimento

- ✅ **Formulário de upload** funcional  
  - Permite envio de históricos acadêmicos em PDF pela interface web.

- ✅ **Integração com Gemini**  
  - O sistema envia o PDF para a API Google Gemini e recebe um JSON estruturado
    com curso, semestre de ingresso e disciplinas.

- ✅ **Banco de dados**  
  - Migração de salvamento em arquivo `data.json` para **SQLite** durante o desenvolvimento.
  - Código preparado para **PostgreSQL** em produção (usando `DATABASE_URL`).

- ✅ **Visualização local dos dados**  
  - Rotas da API (`/histories`, `/histories/<id>`) retornam os dados em JSON.
  - Visualização direta no VS Code com extensões para SQLite.

- 🔜 **Deploy em nuvem**  
  - Próximo passo é publicar a aplicação (Render/Railway) e apontar para um
    banco PostgreSQL gerenciado.

## Imagens

<figure>
  <img src="https://github.com/user-attachments/assets/66642a89-2318-4dff-a671-f9dbb80e9e5b"
       alt="HTML simples do projeto" width="1301" height="641">
  <figcaption>Front-end simples do projeto</figcaption>
</figure>

---

<figure>
  <img src="https://github.com/user-attachments/assets/860a7cb9-6401-4bfc-ac1a-2d2a74f18591"
       alt="Banco de dados SQLite" width="951" height="658">
  <figcaption>Banco de dados SQLite</figcaption>
</figure>




