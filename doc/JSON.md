# JavaScript Object Notation

# O que é JSON?

O formato JSON (JavaScript Object Notation) é uma forma de escrever dados parecido com os objetos do JavaScript, que serve para trocar informações entre diferentes linguagens de programação de forma simples. Basicamente, ele pega vários dados complexos, por exemplo, um objeto que contém nome, idade, etc e transforma em uma linguagem de texto simples que é mais fácil de enviar por meio da internet, de modo que qualquer sistema pode "decodificar" essa string de volta para os dados originais.

# Pra que utilizar?

O JSON é um formato de dados muito leve e simples que é utilizado para **trocar informações entre sistemas computacionais**. Uma das aplicações do JSON é para representar dados estruturados de forma legível tanto para humanos quanto para máquinas, sendo uma forma muito comum de representar esses dados e transferir entre diferentes sistemas, como visto anteriormente.

As principais razões para a utilização do JSON se referem a **simplicidade** da sintaxe em comparação com outros formatos, a **legibilidade** já mencionada no parágrafo anterior, o fato dele poder ser implementado em d**iferentes linguagem de programação** (JavaScript, Java, PHP, Python, etc.) e a sua integração com a web, podendo ser usado para **troca de informações entre servidores e clientes** em aplicações web, inclusive em **APIs.** 

# Características do JSON

A principal característica do JSON é que ele armazena os dados apenas em formato de texto e segue a mesma estrutura de objetos do JavaScript, mas pode ser implementado em várias linguagens. 

É importante conhecer algumas regras do JSON para que se evite erros:

- Não pode conter funções, somente dados;
- Não pode conter comentários;
- Os textos (Strings) sempre devem vir entre aspas **duplas**.

## Conceitos e sintaxe

- Valores simples: São os dados básicos como string, número (somente inteiro ou float) e boleano. Exemplo:

```json
"nome": "Ana",
"idade": 20,
"altura": 1.65,
"estudante": true
```

- Objeto: São um conjunto de pares de **propriedade: valor.** Sempre começam e terminam com chaves{} e cada par é separado com vírgula. Exemplo:

```json
"endereco": {
  "cidade": "Brasilia",
  "cep": "01000-000"
}
```

- Vetor: Sempre começam e terminam com colchetes [ ] e cada item é separado por vírgula.

```json
"notas": [8, 7, 10]
```

- Valores especiais já definidos no JSON: null, true e false.

```json
"telefone": null
```

# JSON como banco de dados x Bancos relacionais

O JSON pode ser utilizado para armazenar dados de 2 formas principais. A primeira é para arquivos .json simples, que são apenas arquivos de textos que servem para coisas bem pequenas e não têm recursos de busca avançada, controle de acesso ou escalabilidade.

### Bancos NoSQL orientados a documentos

A segunda forma de utilizar o JSON é como formato nativo de armazenamento, cada registro é um documento JSON e a maior vantagem é a flexibilidade, uma vez que não é necessário que todos os registros possuam a mesma estrutura. Além disso, é possível lidar com muito mais dados ou usuários sem travar o sistema. No entanto, sua principal desvantagem é que nos bancos baseados em JSON (NoSQL), as buscas não conseguem cruzar dados de forma tão detalhada quanto no SQL, e as informações podem não ficar atualizadas em todos os lugares ao mesmo tempo.

# Vantagens e desvantagens

Como podemos perceber, o JSON é leve e flexível, se integra facilmente com APIs, é legível e agiliza o desenvolvimento em protótipos ou sistemas que mudam rápido. As suas desvantagens é que ele não garante a integridade dos dados, o seu desempenho pode abaixar dependendo da quantidade, e se várias pessoas tentarem mudar os mesmos dados ao mesmo tempo, podem ocorrer erros ou perdas de informação e os backups e manutenção são manuais.