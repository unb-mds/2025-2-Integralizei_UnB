# Proposta de Funcionalidades com IA — Para Votação na Reunião

Sugestão de  **duas opções de funcionalidades** que utilizam **IA (Gemini)** no projeto.  
Durante a **reunião de amanhã**, o grupo deve **discutir** qual será implementada.  
O objetivo é escolher a opção **mais viável** e que traga **maior valor ao site** dentro do tempo disponível.

---

## Opção A — Chatbot Acadêmico com IA

### O que é
Um chat dentro do site onde o aluno pode tirar dúvidas sobre IRA, matérias, pré-requisitos e outras informações do curso.  
A IA (usando o **Gemini**) responde de forma simples e direta.

### Como fazer
1. Criar uma **caixinha de chat** no site (campo pra digitar e área pra mostrar as respostas).  
2. Quando o aluno perguntar algo, o site envia a pergunta pra **API do Gemini**.  
3. O Gemini responde e o site mostra a resposta pro aluno.  
4. Podemos guardar as últimas mensagens pra deixar a conversa mais natural.  

### O que dá pra perguntar
- “Como calcular meu IRA?”  
- “Quantos créditos faltam pra me formar?”  
- “Quais matérias têm pré-requisito?”  

### Pontos positivos
- Fácil de fazer e testar.  
- Usa a IA de forma visível e interessante.  
- Funciona com a API gratuita do Gemini.  
- Pode ser melhorado aos poucos (FAQ, botões, etc.).

### Pontos negativos
- Pode responder algo errado se a pergunta for confusa.  
- Precisa limitar o que a IA pode responder (pra não sair do tema).  

---

## Opção B — Recomendação de Matérias

### O que é
Um sistema que sugere matérias para o aluno cursar, levando em conta o histórico dele, notas e quais matérias faltam pra integralizar o curso.

### Como fazer
1. Criar uma **base de dados** com o histórico de matérias (disciplinas, notas, professores, créditos).  
2. Calcular o **IRA** e ver quais matérias o aluno ainda não fez.  
3. A IA (Gemini) analisa esses dados e sugere matérias que façam sentido pro aluno.  
4. Mostrar no site uma listinha com as sugestões e pequenas explicações (“Você ainda precisa dessa disciplina obrigatória”, por exemplo).

### O que dá pra mostrar
- Matérias obrigatórias que faltam.  
- Matérias optativas relacionadas com as que o aluno gosta.  

### Pontos positivos
- Bem útil e inteligente quando funciona.
- Ajuda o aluno a planejar melhor a matrícula.  

### Pontos negativos
- Bem mais difícil de fazer (precisa de muitos dados).  
- Demorado pra testar e ajustar.  
- Pode errar nas recomendações se os dados estiverem incompletos.  
- Não é fácil de mostrar algo “pronto” rápido.
