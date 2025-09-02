# Arquitetura de Software

# Estudo de Flutter com foco na parte Web

---

## 1) O que é um Framework?

Um framework é uma estrutura de software com componentes, padrões e ferramentas reutilizáveis que agilizam e facilitam o desenvolvimento de aplicações, fornecendo uma base sólida e diretrizes para a criação de software de forma eficiente e organizada.

---

## 2) O que é o Flutter?

- **Flutter** é um framework **multiplataforma** criado pelo Google para construir UIs **nativas e performáticas** para **Android, iOS, Web e Desktop** usando uma única linguagem: **Dart**.
- Principais ideias:
    - **Widgets**: tudo na interface é um widget (botões, textos, layouts).
    - **Hot Reload**: salvou, a tela atualiza quase instantaneamente.
    - **Motor próprio de renderização**: não depende de componentes nativos para desenhar a UI.
    - **Dart**: linguagem moderna, tipada, com ótima performance (compila para nativo e para JavaScript).

---

## 3) Qual linguagem de programação o Flutter utiliza?

O Flutter usa a linguagem de programação de código aberto Dart, que também foi desenvolvida pelo Google. A linguagem Dart é otimizada para o desenvolvimento de interfaces de usuário e muitos dos pontos fortes dela são usados no Flutter.

---

## 4) Instalação no Windows ou Linux (foco em Web + VS Code)

[https://docs.flutter.dev/get-started/install](https://docs.flutter.dev/get-started/install)

> Lembrete: Nosso foco será trabalhar em aplicação Web, logo não será necessário instalar o Android Studio
> 

### 4.1. Flutter SDK no Windows

1. Baixe o Flutter SDK e extraia, por exemplo, em `C:\\src\\flutter`.
2. Adicione `C:\\src\\flutter\\bin` ao **PATH** do Windows, em *Variáveis do Ambiente*
3. Abra o Prompt/PowerShell e valide: ```bash
flutter --version

### 4.2 Flutter SDK no Linux

---

1. Baixar o Flutter SDK

Baixe a versão mais recente do Flutter SDK no [site oficial](https://docs.flutter.dev/get-started/install/linux) ou use o comando `wget`:

```bash
cd ~/Downloads
wget <https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.24.3-stable.tar.xz>

```

*(substitua a versão pelo link mais recente caso haja atualização).*

---

1. Extrair o SDK

Extraia o arquivo baixado no diretório desejado:

```bash
sudo tar xf flutter_linux_3.24.3-stable.tar.xz -C /opt

```

Agora o Flutter está em `/opt/flutter`.

---

1. Adicionar o Flutter ao PATH

Edite o arquivo de configuração do shell:

```bash
nano ~/.bashrc

```

Adicione a linha no final:

```bash
export PATH="$PATH:/opt/flutter/bin"

```

Salve e recarregue o terminal:

```bash
source ~/.bashrc

```

---

1. Verificar a instalação

Execute:

```bash
flutter doctor

```

Este comando verifica se o ambiente está configurado corretamente.

---

## 5) Ambiente VS Code

- Tenha o Visual Studio Code instalado
- Instale as extensões **Flutter** (Já acompanha o Dart)

---

### 5.1 Ativar suporte Web

No terminal do VS Code:

```
Flutter config --enable-web
Flutter devices

```

Você deve ver os navegadores listados como dispositivo Web.

---

## 6) Criando o primeiro projeto

No terminal do VS Code, na pasta onde deseja salvar seus projetos:

```
flutter create meu_app_web
cd meu_app_web

```

### 6.1 Rodar no navegador

Utilizaremos o Chrome como exemplo

```
flutter run -d chrome # Abrirá o app padrão do chrome

```

---

## 7) Estrutura de pastas

---

```
meu_app_web/
 ├─ android/
 ├─ ios/
 ├─ linux/
 ├─ macos/
 ├─ windows/
 ├─ web/
 ├─ lib/
 │   └─ main.dart
 ├─ test/
 ├─ pubspec.yaml
 └─ .gitignore

```

- **android/** e **ios/** → usados apenas se compilarmos para dispositivos móveis.
- **linux/**, **macos/**, **windows/** → usados para gerar apps de desktop.
- **web/** → contém configurações e arquivos necessários para rodar o app no navegador.
- **lib/** → onde fica o **código Dart principal** do seu projeto.
    - Dentro dela está o `main.dart`, que é o **ponto de entrada** do app Flutter.
- **test/** → lugar para escrever **testes unitários**.
- **pubspec.yaml** → arquivo de configuração do projeto, onde definimos dependências, assets (imagens, fontes etc.) e outras configs.
- **.gitignore** → define o que não deve ser enviado para o **Git/GitHub**.

---

## 8) Algumas entradas de usuários úteis

### 8.1 Switch

```dart
bool ligado = false;
Switch(
  value: ligado,
  onChanged: (v) => setState(() => ligado = v),
);

```

### 8.2 CheckBox

```dart
bool aceito = false;
CheckboxListTile(
  title: const Text('Aceito os termos'),
  value: aceito,
  onChanged: (v) => setState(() => aceito = v ?? false),
);

```

### 8.3 Radio

```dart
String? cor;
Column(
  children: ['Azul', 'Vermelho', 'Verde'].map((c) {
    return RadioListTile<String>(
      title: Text(c),
      value: c,
      groupValue: cor,
      onChanged: (v) => setState(() => cor = v),
    );
  }).toList(),
);

```

### 8.4 Slider

```dart
double valor = 50;
Slider(
  min: 0, max: 100, divisions: 10,
  value: valor,
  label: '${valor.round()}',
  onChanged: (v) => setState(() => valor = v),
);

```

---

## 9) Build de produção Web e publicação

```
Flutter build web

```

Esse comando gera a versão final de produção da aplicação Web, pronta para rodar no navegador