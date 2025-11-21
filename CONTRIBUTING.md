# Como Contribuir com o Integralizei UnB

Olá! Ficamos muito felizes pelo seu interesse em contribuir. Toda ajuda é bem-vinda, desde a correção de um simples erro de digitação até a implementação de uma nova funcionalidade complexa.

Para garantir que o processo seja tranquilo para todos, por favor, siga estas diretrizes.

## Como Posso Ajudar?

Existem várias formas de contribuir:

* **Reportando Bugs:** Se encontrar um problema, por favor, [abra uma issue](https://github.com/unb-mds/2025-2-Integralizei_UnB/issues/new/choose) e descreva o problema com o máximo de detalhes possível.
* **Sugerindo Melhorias:** Tem uma ideia para uma nova funcionalidade ou uma melhoria? [Abra uma issue](https://github.com/unb-mds/2025-2-Integralizei_UnB/issues/new/choose) para discutirmos.
* **Escrevendo Código:** Se você quer corrigir um bug ou implementar uma funcionalidade, siga os passos abaixo.

## Guia para Contribuição de Código

### Preparando o Ambiente

1.  **Fork o projeto:** Clique no botão "Fork" no canto superior direito da página do repositório. Isso criará uma cópia do projeto na sua conta do GitHub.

2.  **Clone o seu fork:**
    ```bash
    git clone https://github.com/SEU-USUARIO/2025-2-Integralizei_UnB.git
    cd 2025-2-Integralizei_UnB
    ```

3.  **Adicione o repositório original como "upstream":**
    ```
    bashgit remote add upstream https://github.com/unb-mds/2025-2-Integralizei_UnB.git
    ```

4.  **Instale as dependências:**
    ```
    bash
    npm install
    ```

### Fazendo as Alterações

1.  **Mantenha seu fork atualizado:**
    ```bash
    git pull upstream main
    ```

2.  **Crie uma branch para sua feature:** Escolha um nome descritivo.
    ```bash
    # Para uma nova funcionalidade:
    git checkout -b feature/nome-da-feature

    # Para uma correção de bug:
    git checkout -b fix/descricao-do-bug
    ```

3.  **Faça suas alterações:** Escreva o código, faça as correções e, o mais importante, **adicione ou atualize os testes** correspondentes.

4.  **Commit suas mudanças:** Escreva uma mensagem de commit clara e concisa.
    ```bash
    git add .
    git commit -m "feat: Adiciona nova funcionalidade X"
    # ou
    git commit -m "fix: Corrige problema Y no componente Z"
    ```

5.  **Push para a sua branch:**
    ```bash
    git push origin feature/nome-da-feature
    ```

### Abrindo o Pull Request

1.  **Abra um Pull Request (PR):** Vá para o seu fork no GitHub e clique no botão "Compare & pull request".

2.  **Preencha o template do PR:** Descreva o que você fez, por que fez e como os revisores podem testar sua alteração. Se seu PR resolve uma issue existente, mencione-a com `Resolve #123`.

3.  **Aguarde a revisão:** Os mantenedores do projeto irão revisar seu código. Eles podem pedir algumas alterações. Após a aprovação, seu PR será mesclado ao projeto principal. Parabéns e muito obrigado!
