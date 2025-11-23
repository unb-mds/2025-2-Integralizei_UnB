+++
title = "Product Backlog 📋"
toc = true
+++

O Product Backlog é a nossa fonte única da verdade: uma lista ordenada de tudo o que é conhecido ser necessário no produto. Ele é dinâmico e evolui à medida que o projeto avança.
*Última atualização: 01 de Outubro de 2025*

---

## 🧗 ÉPICO 1: Análise de Histórico Pessoal e Predição de Vaga
*Este épico foca na jornada central do usuário: obter uma análise personalizada com base em seus dados acadêmicos.*

**US01: Cadastro de Novo Usuário**
> Como um **novo** estudante da UnB, eu quero **criar uma conta** na plataforma, para que eu possa ter um espaço seguro para enviar meu histórico e ver minhas análises.

**US02: Login de Usuário Existente**
> Como um estudante **já cadastrado**, eu quero **fazer login** na minha conta, para que eu possa acessar minhas análises anteriores ou enviar um novo histórico.

**US03: Upload do Histórico**
> Como um estudante logado, eu quero **encontrar uma seção e um botão para anexar meu arquivo** de histórico, para que eu possa iniciar o processo de análise de forma fácil e intuitiva.

**US04: Feedback de Processamento**
> Como um estudante que acabou de enviar seu histórico, eu quero **ver uma tela mostrando o progresso da análise**, para que eu saiba que o sistema está funcionando e tenha uma ideia de quanto tempo vai demorar.

**US05: Visualização do Dashboard**
> Como um estudante cujo histórico foi processado, eu quero **ver um painel (dashboard) com os dados extraídos do meu histórico**, para que eu possa confirmar que a leitura foi correta e ter uma visão geral da minha situação acadêmica.

**US06: Visualização de Métricas Principais**
> Como um estudante no meu painel, eu quero **ver meu IRA, percentual de integralização e número de matérias feitas em destaque**, para que eu possa entender rapidamente meu desempenho.

**US07: Listagem de Matérias Pendentes**
> Como um estudante planejando o próximo semestre, eu quero **ver uma lista das minhas matérias obrigatórias pendentes**, para que eu saiba o que preciso cursar para avançar no meu curso.

**US08: Sugestão de Matérias Optativas**
> Como um estudante buscando opções, eu quero **receber sugestões de matérias optativas**, para que eu possa descobrir disciplinas interessantes.

**US09: Predição de Chance na Vaga**
> Como um estudante analisando as matérias, eu quero **ver uma indicação da minha chance (ex: Alta, Média, Baixa) de conseguir a vaga**, para que eu possa tomar uma decisão informada e estratégica na matrícula.

---

## 💡 ÉPICO 2: Calculadora de Simulação de Semestre
*Este épico foca em dar ao usuário uma ferramenta proativa para planejar seus próximos passos acadêmicos.*

**US10: Acesso à Calculadora**
> Como um estudante logado, eu quero **encontrar e acessar a Calculadora de Simulação** para planejar meu próximo semestre de forma proativa.

**US11: Busca de Matérias para Simulação**
> Como um estudante na calculadora, eu quero **buscar e ver uma lista de matérias disponíveis** para adicionar à minha simulação.

**US12: Montagem da Simulação**
> Como um estudante montando minha grade, eu quero **poder adicionar e remover matérias** da minha lista de simulação, para que eu possa experimentar diferentes cenários.

**US13: Visualização do Resultado da Simulação**
> Como um estudante que adicionou matérias, eu quero **ver o total de créditos e meu novo percentual de integralização calculados automaticamente**.

**US14: Salvar Simulação**
> Como um estudante que montou uma simulação, eu quero **ter um botão para salvar essa simulação**, para que eu possa consultá-la mais tarde.

---

## 🔎 ÉPICO 3: Pesquisa e Comparação de Turmas
*Este épico foca em dar ao usuário o poder de explorar dados históricos do universo de turmas da UnB para tomar decisões mais inteligentes.*

**US15: Pesquisa de Matéria e Turmas**
> Como um estudante na tela de pesquisa, eu quero **buscar uma matéria pelo nome ou código**, para encontrar as diferentes turmas ofertadas.

**US16: Visualização de Estatísticas da Turma**
> Como um estudante que selecionou uma turma, eu quero **ver estatísticas agregadas**, como o IRA médio dos aprovados e a taxa de aprovação geral.

**US17: Visualização de "Ranking" Anônimo**
> Como um estudante analisando uma turma, eu quero **ver uma lista anônima dos alunos que conseguiram a vaga** no passado, para que eu possa comparar meu perfil com o deles.

**US18: Favoritar Turmas de Interesse**
> Como um estudante pesquisando, eu quero **poder favoritar as turmas que mais me interessam**, para que eu possa criar uma lista de desejos.

---

## ⚙️ Requisitos Globais (Não-Funcionais)
*Estes são requisitos de qualidade que se aplicam a múltiplas funcionalidades do sistema.*

**RNF01: Acurácia da Extração**
> O sistema deve garantir uma **acurácia superior a 95%** na extração de dados dos históricos em PDF.

**RNF02: Performance da Análise**
> O tempo total entre o upload do histórico e a exibição do resultado da análise deve ocorrer no intervalo de **2 a 15 segundos**.