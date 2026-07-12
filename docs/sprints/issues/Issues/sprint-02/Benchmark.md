Segue o benchmark dos principais players do mercado nos respectivos seguimentos pertinentes ao nosso projeto, seja em velocidade de processamento até previsão estatística. Um estudo em projetos anteriores tanto da matéria, quanto outros projetos será implementado em breve nesta mesma issue. 

Análise de benchmarks e referências, dividida pelas principais áreas do projeto, para orientar o desenvolvimento técnico e de produto.

---

## 1. Extração de Dados com IA (O "Motor" do Projeto)
*O desafio central é transformar um PDF não estruturado em dados precisos e utilizáveis. O benchmark aqui é puramente técnico e define a qualidade do seu principal ativo.*

* **Player: Google Document AI / Amazon Textract**
    * **Por que analisar?** São os líderes de mercado em extração de dados de documentos. Analisá-los define o *benchmark técnico* de qualidade e performance que seu sistema deve almejar.
    * **Pontos-chave a observar:**
        * Qual a precisão deles ao extrair tabelas de históricos (se possível testar)?
        * Como a documentação da API deles é estruturada?
        * Qual o modelo de precificação (por página, por API call)? Isso ajuda a avaliar a viabilidade de custo do seu projeto.

* **Player: Nanonets / Docparser**
    * **Por que analisar?** São ferramentas "prontas para uso" que resolvem o mesmo problema. Elas mostram como um produto final que faz extração de dados se apresenta para o cliente.
    * **Pontos-chave a observar:**
        * Como é a experiência do usuário ao treinar um modelo para um novo tipo de documento?
        * Qual o tempo de resposta (performance) para processar um documento?

---

## 2. Experiência de Upload (A "Porta de Entrada")
*A primeira interação do usuário com seu sistema precisa ser extremamente simples, rápida e confiável para que ele não desista no primeiro passo.*

* **Inspiração: WeTransfer**
    * **Por que analisar?** É a referência global em simplicidade para upload de arquivos. Ele removeu todas as barreiras e atritos possíveis do processo.
    * **Pontos-chave a observar:**
        * **Foco total:** A interface tem uma única e clara chamada para ação (call to action).
        * **Feedback visual:** O progresso do upload é claro, e a mensagem de sucesso é instantânea e recompensadora.
        * **Mínimo de passos:** O processo é concluído com o menor número de cliques imaginável.

---

## 3. Construção de Confiança e Coleta de Dados (O "Alicerce")
*O projeto só existe se os usuários confiarem na plataforma o suficiente para enviar seus históricos. O desafio aqui é de estratégia de produto e comunicação.*

* **Inspiração: Glassdoor**
    * **Por que analisar?** É o melhor exemplo de plataforma de dados colaborativos (crowdsourcing) baseada em confiança e anonimato. Eles convenceram milhões de pessoas a compartilhar dados sensíveis (salários).
    * **Pontos-chave a observar:**
        * **Proposta de valor "dê para receber":** Você contribui com seus dados anônimos para ter acesso a todos os outros dados.
        * **Garantia de anonimato:** A comunicação sobre como os dados são desvinculados do usuário é constante.
        * **Construção gradual de base:** Como eles incentivaram os primeiros usuários a contribuir quando a base de dados ainda era pequena?

* **Inspiração: Waze**
    * **Por que analisar?** Demonstra o poder do benefício em tempo real. Os usuários compartilham seus dados passivamente porque recebem um valor imediato e contínuo (a melhor rota).
    * **Pontos-chave a observar:**
        * O benefício para o usuário é instantâneo e claro.
        * A coleta de dados acontece em segundo plano, sem exigir esforço do usuário (no seu caso, o esforço é o upload, então o benefício precisa ser muito forte).

---

## 4. Apresentação da Previsão (A "Entrega de Valor")
*Esta é a tela mais importante do seu sistema. A forma como você comunica a probabilidade pode gerar confiança e clareza ou confusão e desconfiança.*

* **Inspiração: FiveThirtyEight**
    * **Por que analisar?** São mestres em comunicar incerteza e probabilidade para um público leigo. Eles transformam modelos estatísticos complexos em narrativas visuais fáceis de entender.
    * **Pontos-chave a observar:**
        * **Apresentação em camadas:** Oferecem um resumo visual claro (mapas, porcentagens grandes) e, ao mesmo tempo, permitem que o usuário explore os detalhes e a metodologia.
        * **Linguagem cuidadosa:** Nunca afirmam certezas, sempre usam termos como "chance", "probabilidade", "favorito para".

* **Inspiração: Google Flights / Kayak (Previsão de Preços)**
    * **Por que analisar?** Transformam uma previsão complexa em uma recomendação simples e acionável para o usuário ("É uma boa hora para comprar", "Os preços devem subir").
    * **Pontos-chave a observar:**
        * **Simplicidade da recomendação:** Usam indicadores de cor e textos curtos.
        * **Justificativa da previsão:** Frequentemente incluem uma pequena frase explicando o porquê daquela tendência.
