Skip to content
Navigation Menu
unb-mds
2025-2-Integralizei_UnB

Type / to search
Code
Issues
1
Pull requests
Actions
Projects
Wiki
Security
Insights
Settings
Unsaved changes
You have unsaved changes on this file that can be restored.
2025-2-Integralizei_UnB
/
sajnjsa.md
in
juncao-front/back

Edit

Preview
Indent mode

Spaces
Indent size

2
Line wrap mode

No wrap
Editing sajnjsa.md file contents
Selection deleted
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
# 🚀 Guia de Execução - Integralizei UnB

Este projeto utiliza uma arquitetura de **Microserviços**. Para que o sistema funcione completamente, é necessário rodar **3 terminais** simultaneamente.

## 📋 Pré-requisitos
Certifique-se de ter instalado:
- Node.js (v18 ou superior)
- Python (3.12 recomendado)
- Git

---

## 🛠️ Configuração Inicial (Apenas na 1ª vez)

Se você acabou de clonar o projeto, instale as dependências nesta ordem:

### 1. Frontend
No terminal, entre na pasta e instale:
```bash
cd integralizei-frontend
npm install
```
### 2. Backend Login (Node.js)
Entre na pasta, instale e configure o ambiente:

```bash
cd integralizei-backend/login-service
npm install

# Crie um arquivo .env nesta pasta com o seguinte conteúdo:
# PORT=3001
# SESSION_SECRET="segredo-super-secreto"
# GOOGLE_CLIENT_ID="SUA_CHAVE_AQUI_NAO_COLOQUE_A_REAL_NO_GITHUB"
# GOOGLE_CLIENT_SECRET="SEU_SEGREDO_AQUI_NAO_COLOQUE_O_REAL_NO_GITHUB"
```

Volte para a raiz do projeto e crie o ambiente virtual unificado:

```bash
# Estando na raiz do projeto (C:\2025-2-Integralizei_UnB)
py -3.12 -m venv .venv # nao precisa ter essa especifica versao, desde que seja <= 3.12
.\.venv\Scripts\activate
pip install -r integralizei-backend/requirements.txt
```
### Parte 3: O Ritual de Execução (Como rodar)

## ▶️ Como Rodar (O Ritual Diário)

Abra **3 Terminais** no VS Code e siga a ordem:

### 🟢 Terminal 1: Backend Python (Processamento)
*Responsável por ler o PDF e gerar os gráficos.*
```powershell
# Na raiz do projeto, ative o Python (se não estiver verde)
.\.venv\Scripts\activate

# Entre na pasta e rode
cd integralizei-backend/formulario-flask
python app.py
```
## ✅ Sucesso: Deve aparecer Running on http://0.0.0.0:8000.

---
## 🔵 Terminal 2: Backend Login (Autenticação)
Responsável pelo Login e Cadastro.

```powershell
cd integralizei-backend/login-service
npm run dev
```
## ✅ Sucesso: Deve aparecer Server running on http://localhost:3001.

--- 

## 🎨 Terminal 3: Frontend (Interface)
O site que você vê.

```powershell
cd integralizei-frontend
npm run dev
```

## ✅ Sucesso: Deve aparecer Ready on http://localhost:3000.
---
### Parte 4: Acesso e Problemas Comuns

## 🔗 Acessando o Projeto

👉 Abra no navegador: **[http://localhost:3000](http://localhost:3000)**

### 🧪 Logins de Teste
Você pode criar uma conta nova na hora ou usar:
- **Email:** `admin@teste.com`
- **Senha:** `12345678`

---

## ⚠️ Problemas Comuns

**1. Erro "No module named..." no Python**
> Você esqueceu de ativar o ambiente virtual. Rode `.\.venv\Scripts\activate` na raiz antes de rodar o app.py.

**2. Erro de Conexão no Login**
> Verifique se o Terminal 2 (Porta 3001) está rodando.

**3. Erro de Conexão no Upload**
> Verifique se o Terminal 1 (Porta 8000) está rodando.


Use Control + Shift + m to toggle the tab key moving focus. Alternatively, use esc then tab to move to the next interactive element on the page.
Nenhum arquivo escolhido
Attach files by dragging & dropping, selecting or pasting them.
List updated, Focused item: Sprint - 02, not selected, 1 of 10 