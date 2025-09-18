# Agente de IA

Um dos desafios centrais do nosso projeto é a conversão de históricos acadêmicos, disponíveis em formato PDF, para dados estruturados que possam ser utilizados pelo nosso sistema. A extração manual é inviável, tornando imperativa a adoção de uma solução automatizada.

Para isso, analisamos diferentes abordagens tecnológicas, cada uma com seus méritos e desvantagens para o nosso caso de uso.

## Alternativas Analisadas

- **OCR Tradicional:** Converte o PDF em texto corrido, mas não entende o que cada informação significa, exigindo um código complexo para organizar os dados.
- **Plataformas em Nuvem (AWS/Azure):** São poderosas e especializadas, mas seu modelo de custo por documento as torna financeiramente inviáveis para o projeto.
- **Bibliotecas de Código:** Funcionam bem apenas com PDFs de layout fixo e não lidam com as inconsistências e variações entre os diferentes históricos.

---

## API do Gemini

Após a análise, a API do Gemini se revelou a solução mais equilibrada e alinhada aos objetivos do projeto **Integralizei UNB**. A decisão foi baseada em três fatores principais:

1. **Preço zero:** A plataforma oferece uma generosa camada de uso gratuito, o que nos permite desenvolver, testar e validar a solução completa sem a necessidade de um investimento financeiro.
2. **Inteligência Contextual e Desempenho:** Diferente do OCR tradicional, o Gemini consegue interpretar o contexto do documento. Podemos instruir o modelo a identificar e retornar especificamente as informações de que precisamos (como um conjunto de disciplinas com suas respectivas notas e créditos), recebendo uma resposta já estruturada. A velocidade de resposta dos modelos mais recentes também é um ponto crucial para garantir uma boa experiência ao usuário final.
3. **Simplicidade de Integração:** A API é bem documentada e possui uma biblioteca oficial para Python que simplifica drasticamente o processo de desenvolvimento. A capacidade de receber os dados em um formato padronizado como JSON elimina grande parte do trabalho de tratamento de dados, permitindo uma integração direta e eficiente com o backend da nossa aplicação.

Portanto, a adoção da API do Gemini não apenas soluciona o desafio técnico da extração de dados, mas o faz de uma maneira que otimiza nossos recursos, acelera o desenvolvimento e se alinha perfeitamente às restrições e objetivos do nosso projeto

---

## Como usar a API:

Este guia mostra os passos essenciais para configurar e utilizar a API do Google Gemini em um projeto Python, com um exemplo prático feito para nosso projeto.

### **Passo 1: Instalar a Biblioteca**

Primeiro, você precisa instalar a biblioteca oficial do Google. Abra o terminal na pasta do seu projeto e execute o seguinte comando:

```python
pip install -U google-genai
```

### **Passo 2: Gerar a chave de API (API Key)**

Para usar a API, você precisa de uma chave de autenticação.

1. Acesse o site do **Google AI Studio**: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Clique em "**Create API key**" e copie a chave gerada.

### **Passo 3: Exemplo Básico para Testar a Conexão**

Antes de trabalhar com PDFs, vamos fazer um teste simples para garantir que sua chave está funcionando. Crie um arquivo Python e adicione o seguinte código:

```python
from google import genai

client = genai.Client(api_key="SUA_CHAVE") #Coloque sua chave aqui

resposta = client.models.generate_content(
    model="gemini-2.0-flash", #Existem diversos modelos, utilizei esse como modelo
    contents="Porque 1 + 1 = 2 em uma frase" # Pode fazer qualquer pergunta
)

print(resposta.text)
```

### **Passo 4: Exemplo funcional para nosso projeto**

Agora vamos ao exemplo prático. Este código fará o upload de um arquivo PDF, enviará para a API com um prompt detalhado e retornará os dados das disciplinas em formato JSON.

```python
**from google import genai

client = genai.Client(api_key="SUA_CHAVE") #Sua chave

arquivo_enviado = client.files.upload(file="Gustavo_Historico_2025.1.pdf") #Nome do PDF

Prompt = """Você é um assistente especializado em analisar históricos acadêmicos da Universidade de Brasília (UnB). Analise o PDF fornecido e extraia as seguintes informações para CADA disciplina cursada:
        - O código da disciplina
        - O nome da disciplina
        - A nota obtida (SS, MS, MM, II, MI, SR)
        - A quantidade de horas

        Ignore informações pessoais como nome, matrícula ou CPF.
        Retorne os dados APENAS em formato JSON, dentro de uma lista chamada disciplinas. Não inclua nenhuma outra palavra ou explicação na sua resposta."""

resposta = client.models.generate_content(
    model="gemini-2.5-flash-lite",
    contents=[Prompt, arquivo_enviado]
)

print(resposta.text)**
```

# Conclusão

Em suma, a escolha da API do Gemini representa uma decisão estratégica que resolve o desafio central de extração de dados do projeto Integralizei UNB. Após a análise de alternativas que se mostraram inadequadas, seja pelo custo (plataformas em nuvem), pela rigidez (bibliotecas de código) ou pela falta de inteligência (OCR tradicional), a solução do Google se destacou. Ela oferece a combinação ideal de gratuidade, capacidade de interpretação contextual e simplicidade de implementação em Python, como demonstrado no guia prático. Essa escolha não apenas viabiliza uma funcionalidade crítica, mas também otimiza os recursos e acelera o ciclo de desenvolvimento do nosso sistema.
