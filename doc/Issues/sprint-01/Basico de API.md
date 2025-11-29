# API

# Oque é uma API?

Uma **API (Application Programming Interface)** é um conjunto de funções prontas que simplificam a programação. Ela permite executar tarefas complexas com pouco código, sem que você precise saber como funcionam por dentro. Por exemplo, em C, a função `sqrt()` da API `math.h` calcula a raiz quadrada de um número para você, poupando o trabalho de criar todo o algoritmo do zero.

**Sem sqrt( )**

```c
#include <stdio.h> 

	double raiz_quadrada(double n) {
		if (n < 0) {
			printf("Erro: Não é possível calcular a raiz de um número negativo.\n");
			return -1.0;
		}
	  if (n == 0) {
		  return 0.0;
		}
	  double palpite = n / 2.0;
	  double precisao = 0.0000001;
	  while ((palpite * palpite - n) > precisao || (n - palpite * palpite) > precisao) {
	      palpite = (palpite + n / palpite) / 2.0;
	  }
	  return palpite
	}

int main(){

	printf("A raiz de 40 é: %f\n", raiz_quadrada(40.0);
	
	return 0;
}
```

**Com sqrt**

```c
#include <stdio.h> 
#include <math.h>

int main(){

	printf("A raiz de 40 é: %f\n", sqrt(40.0);
	
	return 0;
} 
```

# **Metáfora do Garçom**

Imagine a seguinte história: você entra em um restaurante com o objetivo de comer um prato específico. A primeira coisa que você faz é pegar o cardápio para ver quais são suas opções. Com o prato escolhido, você chama o garçom e faz seu pedido.

O garçom anota seu pedido e o leva para a cozinha, que é a responsável por preparar sua refeição. Em nenhum momento você tem contato direto com a cozinha ou entende como fazer o seu prato, mas minutos depois, ele retorna com seu prato pronto, exatamente como você pediu no cardápio.

Nessa história, cada coisa representa um elemento do uso da API:

- **O Cliente (Você)** 🤓 **→ O Software Cliente:** Representa o seu aplicativo, site ou qualquer software que precisa de uma informação ou serviço que não possui internamente.
- **O Cardápio** 📝**→ A Documentação da API:** É o manual de instruções. Assim como um cardápio, a documentação detalha todas as operações disponíveis, os dados que você precisa enviar (parâmetros) e o que receberá de volta.
- **O Garçom** 🤵 **→ A API:** O intermediário que faz a comunicação. Ele recebe seu pedido de forma padronizada, leva-o para a cozinha e depois retorna com o resultado pronto. A API é a interface que conecta seu aplicativo ao servidor.
- **A Cozinha** 🧑‍🍳 **→ O Servidor (Backend):** Onde a ação acontece. Representa o sistema complexo (servidor, banco de dados) que possui os dados e a lógica para processar as solicitações, funcionando de forma isolada do cliente.

![images.jpeg](https://github.com/unb-mds/2025-2-Squad-09/blob/28feb6bafdd6af715c50b48ebef4fff5debaa091/doc/Fotos/Basico%20de%20API%20fotos/images.jpeg)

# Local API x Remote API

Para aprofundar sobre APIs, é fundamental compreender a distinção entre suas duas principais categorias: as APIs Locais e as Remotas. 

## Local API

Uma API local é aquela cujas funcionalidades e recursos estão contidos na **mesma máquina** em que o aplicativo é executado. Portanto, ela não depende de uma conexão com a internet ou de um servidor externo para operar.

- **Bibliotecas - u**m exemplo clássico é a biblioteca `math.h` que usamos anteriormente. Todas as suas funções (como para calcular uma raiz quadrada ou um seno) já estão salvas no seu computador, sendo necessário apenas importar a biblioteca para utilizá-las.
- **APIs de Sistema Operacional:** Permitem que um software interaja diretamente com o sistema. É através delas que um programa consegue realizar tarefas como criar um arquivo no disco, desenhar uma janela na tela ou acessar periféricos como uma impressora.

## Remote API

Uma API remota, por outro lado, é aquela em que os recursos estão em um **servidor externo**, e o aplicativo precisa acessá-los através de uma rede, geralmente a internet. 

O funcionamento se baseia em um modelo de **requisição-resposta**:

1. O aplicativo cliente envia uma **requisição** (um pedido) ao servidor.
2. O servidor processa essa requisição.
3. O servidor retorna uma **resposta** com os dados solicitados.

Quase todos os aplicativos e sites usam API remotas, como o MAPS, Twiter, Banco do Brasil, etc etc…

# Conclusão

Em suma , as APIs são ferramentas essenciais na programação moderna que funcionam como "atalhos" para funcionalidades complexas. Vimos na prática como a simples chamada da função `sqrt()` da API `math.h` substitui um algoritmo inteiro, economizando tempo e simplificando o código.

A Metáfora do Garçom ilustra perfeitamente o seu papel: a API atua como um intermediário padronizado que nos permite obter um serviço (um prato pronto) sem precisarmos entender a complexidade do sistema por trás (a cozinha). Seja uma API Local, que nos ajuda a interagir com nosso próprio sistema, ou uma API Remota, que nos conecta a serviços poderosos pela internet, o objetivo é o mesmo: tornar o desenvolvimento mais eficiente.

Nos próximos documentos, nosso foco será exclusivamente nas **APIs Remotas**, explorando como elas permitem a comunicação e a integração entre os mais diversos sistemas no mundo conectado de hoje.
