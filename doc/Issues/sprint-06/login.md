# Frontend de Login — Integralizei UnB

## Visão geral
Este módulo cuida da interface de login do projeto. Ele é responsável por capturar os dados do usuário e enviar para o backend.  

Funcionalidades principais:
- Tela de login (`index.html`) com campos de **E-mail/Senha** e botão de **login com Google**.
- Validação no lado do cliente para evitar campos vazios.
- Feedback visual para erros (mensagens, bordas vermelhas).
- Comunicação com o backend (`server.js`) via `fetch`.

---

## Stack e dependências
- **HTML5**: estrutura semântica e acessível.
- **CSS3**: estilização pura, sem frameworks.
- **JavaScript (ES6+)**: manipulação do DOM e requisições assíncronas (`fetch`).

Fontes e imagens:
- Google Fonts: fonte *Inter*.
- Logo da UnB: SVG da Wikimedia Commons.

---

## Estrutura dos arquivos
Arquivos principais do frontend dentro de `public/`:

```text
public/
├── css/
│   └── style.css         # Folha de estilo principal
├── js/
│   └── login.js          # Lógica do formulário de login
├── index.html            # Página de login (este módulo)
├── register.html         # Página de cadastro (criada por outra feature)
└── dashboard.html        # Página pós-login (criada por outra feature)
```
---

## Como funciona

### 1. `index.html`
- HTML semântico, com IDs e classes para JS e CSS.
- Mensagem de erro usa `role="alert"` e `aria-live="assertive"` para acessibilidade.
- Importa `css/style.css` e `js/login.js`.

### 2. `css/style.css`
- Paleta de cores da UnB: `#006633` e `#003366`.
- Layout responsivo, centralizando o card de login.
- Classes de estado:
  - `.hidden` → esconde elementos.
  - `.input-error` → borda vermelha e sombra de foco.
  - `.error-message` → estiliza a mensagem de erro.

### 3. `js/login.js`
Responsável pela interação da página.

**Inicialização**
- Espera o DOM carregar antes de adicionar listeners.

**Funções principais**
- `showError(message, fields)` → mostra a mensagem e destaca campos.
- `hideError()` → oculta a mensagem e remove destaque dos campos.

**Eventos**
- Input nos campos chama `hideError()` para sumir com o erro assim que o usuário digita.
- Submit do formulário:
  1. Evita o comportamento padrão (`event.preventDefault()`).
  2. Limpa erros antigos.
  3. Verifica campos vazios.
  4. Faz `fetch` POST para `/auth/login`.
  5. Mostra erro de rede ou mensagem do backend se algo der errado.
  6. Redireciona para `/dashboard.html` se login for bem-sucedido.

**Login com Google**
- Clique no botão atualmente mostra um `alert()` (placeholder).
- Futuro: redirecionar para `/auth/google`.

---

## Próximos passos
- Substituir `alert()` do login Google pelo redirecionamento real.



