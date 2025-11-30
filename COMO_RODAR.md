# 🚀 Guia de Execução - Integralizei UnB

Este projeto utiliza uma arquitetura de **Microserviços**. Para que o sistema funcione completamente, é necessário configurar as variáveis de ambiente e rodar **3 terminais** simultaneamente.

---

## 📋 Pré-requisitos

Certifique-se de ter instalado:
* **Node.js** (v18 ou superior)
* **Python** (3.11 ou 3.12 recomendado)
* **Git**

---

## 🔑 Passo 0: Configuração dos Segredos (.env)

O projeto agora exige **dois arquivos de configuração** para funcionar (Login e Chatbot). Crie-os antes de tudo.

### 1. Backend de Login (Autenticação)
Crie um arquivo chamado **`.env`** dentro da pasta:
`integralizei-backend/login-service/.env`

**Conteúdo:**
```env
PORT=3001
SESSION_SECRET="segredo-super-secreto-desenvolvimento"
# Credenciais do Google Cloud (Para o botão 'Entrar com Google')
GOOGLE_CLIENT_ID="SUA_CHAVE_DO_GOOGLE_AQUI"
GOOGLE_CLIENT_SECRET="SEU_SEGREDO_DO_GOOGLE_AQUI"
```

### 2. Frontend (Chatbot IA)

Crie um arquivo chamado **`.env.local`** dentro da pasta:
`integralizei-frontend/.env.local`

**Conteúdo:**
```env
# Chave da API do Google Gemini para o UnBot
GEMINI_API_KEY="SUA_CHAVE_GEMINI_AQUI"
```

---

🛠️ Instalação das Dependências (Apenas na 1ª vez)

Abra o terminal na raiz do projeto e siga os passos para seu sistema operacional.

1. Frontend e Backend (Node.js)

Funciona igual para Windows e Linux.

```bash
# Instalar Frontend
cd integralizei-frontend
npm install

# Voltar e Instalar Backend de Login
cd ../integralizei-backend/login-service
npm install

# Voltar para a raiz
cd ../..
```

2. Backend Python (Processamento)

🪟 No Windows (PowerShell)

```powershell
# Cria o ambiente virtual
py -3.12 -m venv .venv

# Ativa o ambiente
.\.venv\Scripts\activate

# Instala as dependências
pip install -r integralizei-backend/requirements.txt
```

🐧 No Linux / Mac (Bash)

```bash
# Cria o ambiente virtual (garantindo python 3)
python3 -m venv .venv

# Ativa o ambiente
source .venv/bin/activate

# Instala as dependências
pip install -r integralizei-backend/requirements.txt
```

---

▶️ O Ritual de Execução (Como rodar)

Você precisará de 3 Terminais abertos na raiz do projeto.

🟢 Terminal 1: Backend Python (Processamento de PDF)

Windows:
```powershell
.\.venv\Scripts\activate
cd integralizei-backend/formulario-flask
python app.py
```

Linux:
```bash
source .venv/bin/activate
cd integralizei-backend/formulario-flask
python3 app.py
```

✅ Sucesso: Deve aparecer Running on http://0.0.0.0:8000

🔵 Terminal 2: Backend Login (Autenticação)

```bash
cd integralizei-backend/login-service
npm run dev
```

✅ Sucesso: Deve aparecer Server running on http://localhost:3001

🎨 Terminal 3: Frontend (Interface & Chatbot)

```bash
cd integralizei-frontend
npm run dev
```

✅ Sucesso: Deve aparecer Ready in ... e rodar em http://localhost:3000

---

🔗 Acessando o Projeto

👉 Abra no navegador: http://localhost:3000

🧪 Logins de Teste (Banco Local)

Se não quiser usar o Google, use:

```
Email: admin@teste.com
Senha: 12345678
```

---

⚠️ Solução de Problemas

1. Erro "No module named..." no Python

    Você esqueceu de ativar o ambiente virtual.

    Win:
    ```
    .\.venv\Scripts\activate
    ```

    Linux:
    ```
    source .venv/bin/activate
    ```

2. UnBot responde "Erro ao conectar ao servidor"

    Você esqueceu de criar o arquivo `.env.local` na pasta do frontend ou não reiniciou o terminal 3 após criar o arquivo.

3. Erro "redirect_uri_mismatch" no Login com Google

    A URL de callback no Google Cloud Console deve ser exatamente:
    ```
    http://localhost:3001/auth/google/callback
    ```