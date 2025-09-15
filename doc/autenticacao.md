# Autenticação

→ Autenticação é o processo de **confirmar a identidade de um usuário** antes de dar acesso a um sistema.

Exemplo: quando você faz login com seu e-mail e senha, o sistema precisa ter certeza de que realmente é você.

- obs: autenticação ≠ autorização. ( autorização : **o que você pode fazer** depois de estar autenticado)
- solicitação de login → identidade confirmada → autorização

## Autenticação Básica → login + senha

### **HTTP Basic Authentication**

- É um método simples (e inseguro se usado sozinho).
- O navegador manda `usuário:senha` em formato Base64 no cabeçalho HTTP.
- Exemplo:
    - Usuário = `carol`, Senha = `1234`
    - `carol:1234` → em Base64 vira `Y2Fyb2w6MTIzNA==`
    - O cabeçalho enviado é:
        
        ```
        Authorization: Basic Y2Fyb2w6MTIzNA==
        
        ```
        
- O servidor recebe, decodifica o Base64 e checa se está certo.
- Problema: Base64 pode ser facilmente decodificado → se alguém interceptar o tráfego sem HTTPS, consegue ver login e senha.

<aside>

oq é base64? 

- É um **método de codificação** que transforma dados (texto, imagem, binário) em uma sequência de caracteres **A–Z, a–z, 0–9, +, /**.
- Ele não é criptografia, apenas um jeito de representar dados em formato de texto legível.

oq é HTTP? 

**HyperText Transfer Protocol** (Protocolo de Transferência de Hipertexto).

- É o **protocolo de comunicação** que permite que navegadores (cliente) e servidores troquem informações na web.  É a “linguagem” que o navegador usa para pedir páginas e dados ao servidor.
</aside>

---

# Tokens

Um token é um conjunto de dados gerado por um servidor após o usuário ter sua identidade verificada com sucesso pela primeira vez. Esse token é então enviado para o dispositivo do usuário (como um navegador ou aplicativo móvel) e apresentado a cada nova solicitação para provar que o usuário já foi autenticado e tem permissão para realizar a ação desejada.

### Como Funciona a Autenticação Baseada em Token?

O fluxo de autenticação baseada em token geralmente segue os seguintes passos:

1. **Solicitação de Acesso:** O usuário insere suas credenciais (geralmente login e senha) em uma tela de login.
2. **Verificação das Credenciais:** O servidor de autenticação valida se as credenciais fornecidas estão corretas.
3. **Geração do Token:** Se as credenciais estiverem corretas, o servidor gera um token único que contém informações sobre o usuário e suas permissões.
4. **Envio do Token ao Cliente:** O servidor envia esse token de volta para o dispositivo do usuário, onde ele é armazenado de forma segura.
5. **Solicitações Subsequentes:** Para cada nova solicitação de acesso a um recurso protegido, o cliente envia o token junto no cabeçalho da requisição.
6. **Validação do Token:** O servidor recebe a requisição, verifica a validade e a autenticidade do token. Se o token for válido, o servidor processa a solicitação e retorna os dados solicitados.

## Bearer token

Um Bearer Token é um tipo de token de acesso que autentica requisições em APIs ou sistemas. Ele funciona como um "passe de acesso". qualquer pessoa que possua o token pode acessar os recursos autorizados.

- mais seguro q a autenticação basica
- substitui o login/senha durante o uso do sistema.

O token é enviado no **cabeçalho HTTP** de cada requisição:

```
Authorization: Bearer <token_aqui>

```

Exemplo:

```
GET /dados-aluno HTTP/1.1
Host: sistema-unb.edu
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

```

O servidor recebe o token e verifica se ele é válido antes de liberar o acesso.

## Access Token e Refresh Token

### Access Token (Token de Acesso)

- É uma credencial (uma "chave") de curta duração usada para acessar recursos protegidos, como uma API ou dados de um usuário.
- É enviado em cada requisição para o servidor para provar que o usuário tem permissão para realizar aquela ação.
- Possui um tempo de vida muito curto (geralmente minutos) por motivos de segurança. Se um access token for roubado, o invasor terá acesso ao sistema por um período muito limitado.

### Refresh Token (Token de Atualização)

- É uma credencial de longa duração que é usada para obter um novo access token.
- Quando o access token expira, a aplicação utiliza o refresh token para solicitar um novo access token ao servidor, sem que o usuário precise fazer login novamente.
- Possui um tempo de vida longo (dias, semanas ou até meses). Ele é armazenado de forma segura e só é utilizado para renovar a sessão do usuário.

## JWT (JSON Web Token)

---

O **JWT** é um token em formato JSON, dividido em **header, payload e signature**. Ele é usado em autenticação moderna para identificar usuários sem precisar guardar sessão no servidor, garantindo segurança e eficiência. 
Ele é compacto, em formato texto (JSON codificado em Base64), e pode ser enviado facilmente em requisições HTTP.

### Como funciona na autenticação

1. O usuário faz login (ex.: com Google ou senha).
2. O servidor cria um JWT e envia para o cliente (navegador ou app).
3. O cliente guarda o JWT (em cookie seguro ou localStorage).
4. Em cada requisição à API, o cliente manda o token:

```
Authorization: Bearer <seu_jwt_aqui>

```

1. O servidor valida a assinatura e confere se o token ainda está válido (não expirou).
- **Sem necessidade de sessão no servidor** → o token carrega os dados.
- **Leve e rápido** → é só um texto.
- **Seguro** → assinado digitalmente, não pode ser alterado sem ser detectado.
- **Amplamente usado** em APIs modernas.

OBS

- Sempre usar HTTPS para evitar roubo do token.
- Tokens devem ter tempo de expiração curto + usar refresh tokens quando necessário.

## OAuth2

OAuth 2.0 (Open Authorization 2.0) é um framework de autorização, e não de autenticação. 

O OAuth 2.0 define quatro papéis principais que interagem entre si:

1. **Resource Owner (Dono do Recurso):** É o usuário final, a pessoa que é dona dos dados e que concede a permissão.
2. **Client (Cliente):** É a aplicação que deseja acessar os recursos do usuário.
3. **Authorization Server (Servidor de Autorização):** É o servidor responsável por autenticar o Resource Owner e emitir os tokens de acesso após obter o consentimento.
4. **Resource Server (Servidor de Recursos):** É o servidor onde os recursos do usuário estão armazenados e que aceita os tokens de acesso para servir esses recursos. 

→ **Fluxos de Autorização (Grant Types)** 

"receitas" (fluxos) para obter um token de acesso

**1. Authorization Code Flow (Fluxo de Código de Autorização)**

- **Para quem é:** Aplicações web tradicionais que rodam em um servidor (back-end), onde o código-fonte não é exposto ao público.
- **Como funciona:** É o fluxo mais comum e seguro. A aplicação redireciona o usuário para o servidor de autorização para fazer login e dar consentimento. O servidor então retorna um código de autorização temporário. A aplicação, em seu back-end, troca esse código por um access token e um refresh token. Como a troca final ocorre no servidor, as credenciais do cliente ficam seguras.
- **Segurança:** Muito alta.

**2. Authorization Code Flow com PKCE (Proof Key for Code Exchange)**

- **Para quem é:** Aplicações públicas, como aplicativos mobile e Single-Page Applications (SPAs) que rodam no navegador.
- **Como funciona:** É uma extensão do fluxo anterior, projetada para clientes que não podem armazenar um segredo de forma segura. Antes de iniciar o fluxo, o cliente cria um "segredo" dinâmico e envia uma versão transformada dele para o servidor de autorização. Quando vai trocar o código pelo token, ele envia o segredo original, provando que é o mesmo cliente que iniciou o processo. Isso previne ataques de interceptação do código.
- **Segurança:** Altíssima, é o padrão-ouro atual para SPAs e mobile.

**3. Client Credentials Flow (Fluxo de Credenciais do Cliente)**

- **Para quem é:** Comunicação entre máquinas (M2M), como microserviços ou scripts de automação, onde não há um usuário final envolvido.
- **Como funciona:** A própria aplicação se autentica diretamente no servidor de autorização usando seu `client_id` e `client_secret` para obter um *access token*. O token representa a própria aplicação, não um usuário.
- **Segurança:** Alta, desde que as credenciais do cliente sejam armazenadas de forma segura.

**4. Implicit Flow (Fluxo Implícito) - LEGADO**

- **Para quem é:** Era usado por SPAs e aplicações JavaScript, mas **não é mais recomendado**.
- **Por que é legado?** Ele retornava o *access token* diretamente na URL de redirecionamento do navegador, o que o tornava vulnerável a ataques e vazamentos. Foi substituído pelo fluxo *Authorization Code com PKCE*.

## OpenID Connect

- trabalha em conjunto com o OAuth 2.0

Se o OAuth 2.0 é um framework para AUTORIZAÇÃO (dar permissão para acessar recursos), o OpenID Connect é uma camada fina de identidade construída sobre o OAuth 2.0 para lidar com a AUTENTICAÇÃO.

O OIDC padroniza o processo de login (autenticação) usando um servidor de autorização já existente. É o principal protocolo por trás dos botões "Entrar com Google", "Entrar com Apple", etc.

### OIDC e OAuth 2.0

É impossível falar de OIDC sem mencionar o OAuth 2.0.

- **OIDC é uma extensão do OAuth 2.0.** Todo fluxo OpenID Connect é também um fluxo OAuth 2.0, mas o contrário não é verdadeiro.
- Ele aproveita os mesmos papéis (Client, Authorization Server, etc.) e fluxos (como o Authorization Code Flow).
- A grande adição do OIDC é a padronização do processo de autenticação e a introdução de um artefato específico para isso: o **ID Token**.

### ID Token

Enquanto o OAuth 2.0 fornece um Access Token para acessar APIs, o OIDC introduz o ID Token.

O **ID Token** é um **JWT** que contém informações (chamadas de *claims*) sobre o usuário e sobre o evento de autenticação. Ele é a prova criptográfica de que o usuário foi autenticado com sucesso por um Provedor de Identidade.

As *claims* (informações) padronizadas mais comuns em um ID Token incluem:

- `iss` (Issuer): Quem emitiu o token (o Provedor de Identidade, ex: `https://accounts.google.com`).
- `sub` (Subject): Um identificador único e estável para o usuário no Provedor de Identidade. É o "ID do usuário".
- `aud` (Audience): Para qual aplicação (Client) o token foi emitido.
- `exp` (Expiration Time): Quando o token expira.
- `iat` (Issued At): Quando o token foi emitido.
- `auth_time`: Quando o usuário se autenticou pela última vez.

O ID Token pode também conter informações do perfil do usuário, como `name`, `email`, `picture`, `given_name`, etc.

### Fluxo do OpenID Connect

O fluxo mais comum (e seguro) é muito parecido com o *Authorization Code Flow* do OAuth 2.0, mas com algumas adições importantes.

1. **Solicitação de Autenticação:** A aplicação (Client) redireciona o usuário para o Provedor de Identidade (ex: Google). A solicitação inclui um parâmetro scope especial: **openid**. É esse escopo que sinaliza que se trata de um fluxo OIDC. Outros escopos podem ser adicionados para solicitar informações do usuário (ex: profile, email).
2. **Autenticação e Consentimento:** O usuário faz login no Provedor de Identidade (se ainda não estiver logado) e consente em compartilhar suas informações de identidade com a aplicação.
3. **Retorno do Código de Autorização:** O Provedor de Identidade redireciona o usuário de volta para a aplicação com um authorization_code temporário.
4. **Troca do Código por Tokens:** A aplicação, em seu back-end, envia esse authorization_code de volta para um endpoint específico do Provedor de Identidade (o *Token Endpoint*).
5. **Recebimento dos Tokens:** Aqui está a grande diferença! O Provedor de Identidade valida o código e retorna:
    - Um **Access Token** (igual ao do OAuth 2.0, para acessar APIs).
    - E um **ID Token** (a prova da autenticação).
6. **Validação e Login:** A aplicação recebe o ID Token, valida sua assinatura para garantir a autenticidade, verifica as *claims* (como iss, aud e exp) e extrai as informações do usuário (como o sub, que é o ID). Com base nisso, a aplicação pode criar uma sessão local e considerar o usuário logado.

### O UserInfo Endpoint

Além das informações no ID Token, o OIDC define um UserInfo Endpoint. Usando o Access Token obtido, a aplicação pode fazer uma chamada a esse endpoint para obter mais informações sobre o perfil do usuário, caso precise de dados que não vieram no ID Token.

### Vantagens do OpenID Connect

1. **Padronização da Autenticação:** Fornece uma maneira padronizada e interoperável para que aplicações de terceiros autentiquem usuários, eliminando a necessidade de gerenciar senhas.
2. **Single Sign-On (SSO):** Facilita a implementação de SSO. Uma vez que o usuário está logado em seu Provedor de Identidade (como o Google), ele pode se autenticar em outras aplicações que confiam nesse provedor sem precisar digitar a senha novamente.
3. **Segurança Melhorada:** Centraliza a autenticação em provedores de identidade confiáveis (que geralmente têm segurança robusta, como autenticação de múltiplos fatores), enquanto a aplicação cliente nunca vê a senha do usuário.
4. **Experiência do Usuário (UX) Simplificada:** O processo de login e cadastro se torna muito mais rápido e fácil para o usuário final.

!!!!!! você usa o **OAuth 2.0** quando quer acessar dados de um usuário em outra plataforma. Você usa o **OpenID Connect** quando quer usar uma conta existente (como Google, Microsoft) para fazer login em sua própria aplicação.

## Autenticação com Google

Sign in with Google

Quando você usa o Google para fazer login em um site ou aplicativo de terceiros, você está vendo o OpenID Connect e o OAuth 2.0 em ação.

No cenário de autenticação, o Google atua como um **Provedor de Identidade (IdP)**. Isso significa que ele é a entidade confiável que gerencia a identidade dos usuários (seus logins e senhas) e fornece um serviço para que outras aplicações possam verificar quem é o usuário de forma segura.

A autenticação com Google é, na sua essência, uma implementação do padrão **OpenID Connect (OIDC)**. E como o OIDC é uma camada sobre o **OAuth 2.0**, o fluxo utiliza todos os papéis e conceitos escritos anteriormente no estudo.

**Como funciona?**

- **Início do Fluxo (Na Aplicação Cliente):**
    - Ao clicar no botão, a aplicação (o Cliente) cria uma solicitação de autenticação e redireciona seu navegador para a tela de login do Google.
    - Nessa solicitação, a aplicação envia informações cruciais, como:
        - `client_id`: O identificador único da aplicação, obtido no Google Cloud Console.
        - `redirect_uri`: A URL para a qual o Google deve te enviar de volta após o login. (Isso é pré-configurado por segurança).
        - `scope`: As permissões que a aplicação está pedindo. Para login, o escopo **`openid`** é obrigatório. Geralmente, também se pede `profile` e `email` para obter suas informações básicas de perfil.
        - `response_type=code`: Informa que a aplicação espera receber um código de autorização.
- **Autenticação e Consentimento (No Google):**
    - Você vê a familiar tela de login do Google. Você digita seu e-mail e senha. O Google te **autentica**.
    - Em seguida (especialmente na primeira vez), o Google mostra a **Tela de Consentimento**: "O 'Site de Anotações' gostaria de acessar seu nome, endereço de e-mail e foto de perfil".
    - Ao clicar em "Permitir", você está **autorizando** o Google a compartilhar essas informações com a aplicação.
- **Retorno do Código de Autorização:**
    - O Google redireciona seu navegador de volta para a `redirect_uri` da aplicação.
    - Anexado a essa URL, vem um **`authorization_code`** (um código temporário e de uso único). Ex: `https://app.com/callback?code=ABCD1234...`
- **Troca do Código por Tokens (Comunicação Servidor-a-Servidor):**
    - O navegador entrega esse código ao back-end da aplicação.
    - O back-end da aplicação faz uma requisição segura e direta para o *Token Endpoint* do Google. Nessa requisição, ele envia:
        - O `authorization_code` que acabou de receber.
        - Seu `client_id`.
        - Seu `client_secret` (uma "senha" da aplicação, que só o back-end conhece e mantém em segredo).
    - Esta etapa é crucial para a segurança, pois acontece fora do navegador do usuário.
- **Recebimento e Uso dos Tokens:**
    - O Google valida todas as informações e, se estiverem corretas, retorna os preciosos tokens para o back-end da aplicação:
        - **`ID Token` (um JWT):** Esta é a **prova da autenticação**. O back-end da aplicação **DEVE** validar a assinatura deste token para garantir que ele veio do Google e não foi alterado. Após a validação, ele extrai as informações (as *claims*) de dentro do token, como seu ID de usuário (`sub`), e-mail, nome e foto. Com base nisso, a aplicação pode criar uma conta para você ou encontrar sua conta existente e te logar no sistema.
        - **`Access Token`:** Esta é a **chave para a autorização**. Se a aplicação também pediu permissão para, por exemplo, ler seus eventos no Google Calendar (escopo `https://www.googleapis.com/auth/calendar.readonly`), ela usaria este *access token* para fazer chamadas à API do Google Calendar em seu nome.
        - **`Refresh Token` (Opcional):** Se a aplicação precisar manter o acesso offline por um longo período, ela também pode receber um *refresh token* para obter novos *access tokens* sem que você precise fazer login novamente.

## Como colocar em prática:

**o Google Workspace disponibiliza o passo a passo para implementarmos a autenticação em nosso site.**

**1.[Visão geral do Processo](https://developers.google.com/workspace/guides/auth-overview?hl=pt-br#process_overview)** 
**2.[Configurar o consentimento do OAuth](https://developers.google.com/workspace/guides/configure-oauth-consent?hl=pt-br#configure_oauth_consent)**

**3.[Credenciais de chave de API](https://developers.google.com/workspace/guides/create-credentials?hl=pt-br#api-key)**

**4.[Credenciais de ID do cliente OAuth](https://developers.google.com/workspace/guides/create-credentials?hl=pt-br#oauth-client-id)**

**5.[Credenciais da conta de serviço](https://developers.google.com/workspace/guides/create-credentials?hl=pt-br#service-account)**

Tutoriais em Video:

 [https://youtu.be/tgO_ADSvY1I?si=H9v-NW0MDx-mf13c](https://youtu.be/tgO_ADSvY1I?si=H9v-NW0MDx-mf13c)

[https://youtu.be/TjMhPr59qn4?si=AWMSdDDasNjDiuXp](https://youtu.be/TjMhPr59qn4?si=AWMSdDDasNjDiuXp)

Videos no YT q ajudaram a entender sobre autenticação:

[https://youtu.be/9JPnN1Z_iSY?si=73rtluMK3tPIvUJE](https://youtu.be/9JPnN1Z_iSY?si=73rtluMK3tPIvUJE) (**Autenticação explicada: quando usar Basic, Bearer, OAuth2, JWT e SSO)**

[https://youtu.be/GcVtElYa17s?si=QtPifdDbQerUkI1D](https://youtu.be/GcVtElYa17s?si=QtPifdDbQerUkI1D) (**API Authentication EXPLAINED! 🔐 OAuth vs JWT vs API Keys 🚀)**

[https://youtu.be/ZV5yTm4pT8g?si=uv8irEkCkHzNEynA](https://youtu.be/ZV5yTm4pT8g?si=uv8irEkCkHzNEynA) (**OAuth 2 explicado em termos simples)**