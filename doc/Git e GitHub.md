# Git e GitHub

# O que é o Git?

O Git é um sistema de controle de versão do código, ou seja, ele **gerencia o histórico de um projeto**. Sempre que fizermos uma alteração importante, criamos um **commit** que registra essa nova versão, isso é importante pois permite voltar atrás se algo der errado. Além disso, é possível fazer um **branch** (ramificação)  ****que serve para você **testar coisas novas** sem atrapalhar a versão principal. Se você gostar desse teste, pode implementar na versão principal utilizando o **merge** que une as duas versões.

- commit → registra nova versão.
- branch → cria uma linha do tempo paralela para testar sem interferir na versão principal do código.
- merge → combina o histórico de commits de outra branch com a branch atual
- push → salva a alteração do código da sua máquina no GitHub.
- pull → puxa o que está no GitHub pra sua máquina. Importante para projetos em equipe uma vez que outra pessoa pode ter atualizado o código no GitHub.

Em breve, vamos entender como utilizar isso na prática.

# O que é o GitHub?

É o lugar onde você guarda essas versões. Nada mais é do que um repositório onde seus projetos ficam salvos na nuvem, podendo ser públicos ou privados.

![image.png](image.png)

# Como utilizar o Git?

O Git funciona através de linhas de comando no terminal. Você passa os comandos no terminal (ou no Git Bash para Windows, já vem instalado junto ao Git) e ele executa. Como utilizaremos o Linux, os comandos serão passados no terminal. 

# Primeiras configurações do Git

Precisamos **salvar o email e o nome** que irá aparecer nos commits, para isso usamos os seguintes comandos: 

```bash
git config --global user.name "seu nome"
```

```bash
git config --global user.email "seu email"
```

**Para verificar se deu certo**, utilize os comandos:

```bash
git config user.name
```

```bash
git config user.email
```

Além disso, é importante conhecer outros comandos específicos para facilitar o uso do Git.

Utilize **pwd** para verificar em **qual pasta você está** atualmente:

```bash
pwd
```

Utilize **ls** para **listar os arquivos** da pasta atual:

```bash
ls
```

Utilize **cd** para **entrar em uma pasta**:

```bash
cd nome_pasta
```

Utilize **cd . .**  para **voltar uma pasta:**

```bash
cd . .
```

Utilize **mkdir** para **criar uma pasta**:

```bash
mkdir nova_pasta
```

Utilize **clear** para **limpar a tela do terminal.**

```bash
clear
```

# Como clonar um repositório do GitHub?

Como o próprio nome já diz, esse comando cria uma cópia exata de um repositório do GitHub na sua máquina.  

Vamos aprender a clonar um repositório para trabalhar no projeto. 

Primeiro, copie o URL do repositório que você deseja clonar. Entre na pasta onde você quer guardar o clone utilizando o comando já visto **cd.** Depois, utilize o comando:

```bash
git clone https://github.com/usuario/repositorio.git
```

Depois entre na pasta do repositório clonado utilizando novamente o cd.

# Branches e merge

Podemos criar uma branch a partir do comando abaixo:

```bash
git branch nome_branch
```

Alguns outros comandos que podem ser uteis:

```bash
git switch nova_branch #muda de branch
git switch -c nova_branch #CRIA A BRANCH E JA MUDA PRA ELA
git branch #lista branches locais
git branch  -d nome_branch #deleta branch 
git branch -m novo_nome #renomeia branch atual
git branch -a #lista todas as branches locais e remotas
git branch -v #mostra ultimo commit de cada branch
```

# Trabalhando com arquivos

Para verificar  se precisamos dar um commit, pull ou push, se há arquivos alterados, se o repositório não tem mudanças pendentes, etc, utilize o comando:

```bash
git status

git status -s #Mostra apenas um resumo 
```

# Entendendo o comando add

Antes de dar um commit, é necessário usar o comando add. Isso porque o Git possui uma área chamada “staging area” que serve para selecionar exatamente os arquivos que você quer dar um commit. Apenas os arquivos que você adicionar com o git add irão para o commit.

Antes de prosseguir, gostaria de deixar claro a diferença entre arquivo rastreado e não rastreado. Arquivos não rastreados são arquivos **novos** que você criou na pasta do projeto, mas ainda **não foram adicionados ao Git,** já arquivos rastreados são aqueles que já foi adicionado ou comitado.

```bash
git add <arquivo_1> <arquivo_2>

#extra 
git add -A #adiciona todas as alterações (arquivos novos, modificados e removidos)
git add -u #adiciona apenas arquivos já rastreados

```

# Entendendo o comando commit

O comando git commit é utilizado para salvar suas alterações no repositório local, deve ser feito após usar o comando anterior git add. Cada commit deve possuir uma breve descrição da alteração feita para que todos possam entender.

```bash
git commit -m "mensagem"

#extra
git commit -a -m #Adiciona as alterações em arquivos já rastreados e faz o commit
```

# Entendendo o comando push

O comando git push é usado para enviar suas alterações do repositório local para o remoto. No entanto, ele não envia os arquivos diretamente mas sim os commits, ou seja, deve ser utilizado os comandos git add e o git commit antes do git push.

```bash
git push 

#ou especificando repositório remoto e branch

git push <remote> <branch_name>
```

Se a branch que você está usando **não existe ainda no remoto**, você precisa configurar o Git para “ligar” a branch local à branch remota:

```bash
git push -u origin <branch_name>
```

Faça isso para que da próxima vez você só precisar utilizar o git push.

# Entendendo o comando merge

Esse comando serve para unir duas branches no Git. Supondo que você tenha uma branch principal e outra em que você está trabalhando atualmente, para juntar as duas você utiliza o comando merge.

O primeiro passo antes de dar um merge é **ir** para a branch principal ou **que vai receber as alterações**. Utilize o comando git switch para isso.

Agora, basta utilizar o comando:

```bash
git merge branch_alteracao
```

OBS: É importante **atualizar a branch** que vai ser alterada **antes de enviar a alteração**, pois pode ser que outra pessoa tenha mexido nela.  Para isso, faça:

```bash
git fetch origin #baixa todas as atualizações do remoto chamado origin 
git pull  #pega as alterações do remoto e mescla essas alterações na sua branch atual
```

# Abrir e comentar em uma issue

Para abrir uma issue, entre no repositório do GitHub pelo navegador. Na parte superior, clique em issues. No canto direito, clique em “new issue” e selecione o tipo de issue e faça as alterações necessárias, após isso basta clicar em “create”.

Para comentar em issue existente, procure por ela em issues e role a tela até a seção de comentários, digite algo e use Markdown para formatar: negrito, listas, links, código, etc. Depois, clique em comentar.

# Pull Request

O Pull Request (PR) é uma solicitação para que as alterações feitas em **uma branch de trabalho** sejam revisadas e depois implementadas na **branch principal (geralmente a main)**.

Para criar um Pull Request, é necessário ter feito o git push. 

Passo a passo:

Clique em Pull Request, depois em “New pull resquest”;

Depois, selecione a base branch que é onde você vai implementar sua mudança

Selecione também a compare branch, que é a branch contendo as alterações

Adicione o título contendo a explicação do que foi feito e por que.

Depois, crie a pull request.

Quando o PR é criado, alguém revisa seu código. Só após a aprovação, ele é **mergeado** na branch principal.