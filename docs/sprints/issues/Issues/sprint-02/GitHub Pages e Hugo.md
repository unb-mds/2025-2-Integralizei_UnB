# GitHub Pages e Hugo

# O que é hospedagem?

Um site é formado por diversos arquivos como o html, css, js, imagens e etc que precisam estar guardados em um local que chamamos de **servidor.** Quando estamos desenvolvendo uma página, o servidor é o nosso próprio computador, no entanto, para tornar o site público para qualquer pessoa da internet, precisamos colocar esses arquivos em um **servidor online**, isso é o que chamamos de hospedagem. O GitPages nada mais é do que um dos serviços de hospedagem.

# O que é o GitHub Pages?

Como falei, o GitHub Pages é um serviço gratuito de hospedagem de sites estáticos, ele usa os arquivos HTML, CSS e JavaScript do repositório e transforma isso em um site acessível na internet. 

# Colocando uma página no ar

## Passo 1:

- Vá até o repositório do projeto no GitHub
- Clique em Settings
- Procure a seção **Pages**
- Em **Source**, escolha a **branch** que vai ser publicada

## Passo 2:

- Você pode selecionar se os arquivos estão na raiz do repositório ou dentro de uma pasta
- Depois, clique em **Save**.

## Passo 3:

- O GitHub vai processar os arquivos e gerar uma URL.

# O que é o Hugo?

É um gerador de sites estáticos que possibilita utilizar temas prontos que já vem com estilos e funcionalidades configurados. Na prática, você escreve as informações do projeto em Markdown, o Hugo gera os arquivos estáticos necessários e o **GitHub Pages** hospeda esses arquivos e disponibiliza o site para acesso público. 

Para criar a estrutura do projeto com o Hugo, digite no terminal:

```bash
npm create thulite@latest meu-projeto -- --template doks
cd meu-projeto
npm install
npm run dev
```

Isso cria a base do site usando o tema **Doks**. Depois entre na pasta content e modifique os arquivos .md como desejar.

Para publicar utilize:

```bash
npm run build
```