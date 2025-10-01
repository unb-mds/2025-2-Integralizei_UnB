+++
title = "Requisitos do Projeto"
date = "2025-09-22T10:45:35-03:00"
type = "page"
+++

## Funcionais ✅
*O que o sistema deve fazer.*

- [x] Login com Conta no Google
- [x] Recebimento do histórico
- [x] Tutorial de como baixar seu histórico (abaixo do upload do histórico)
- [x] Cálculo da integralização/IRA retroativas (semestres anteriores)
- [x] Divisão das matérias por professor
- [x] Sistema de rankeamento
- [x] Calcular a média de integralização e IRA
- [x] Pesquisa de matérias
- [x] Recomendações: obrigatórias e optativas
- [x] Cálculo de integralização futura
- [x] Armazenamento de dados
- [x] Reciclagem de histórico
- [x] Favoritar matérias

---

## Fora de Escopo ❌
*O que o sistema deliberadamente **não** fará.*

- Montar grade e fluxo
- ChatBot
- Salvar dados sensíveis
- Avaliação de professores

---

## Não Funcionais ⚙️
*Os critérios de qualidade e restrições do sistema.*

| Categoria | Requisito | Critério de Aceite |
| :--- | :--- | :--- |
| **Compatibilidade** | Navegador | O sistema deve ser totalmente funcional na versão mais recente do Google Chrome. |
| **Segurança** | Proteção de Dados | Todos os dados de análise devem ser processados de forma anônima e segura, com criptografia em trânsito. |
| **Performance** | Extração de Dados | Acurácia na extração de dados do PDF deve ser **superior a 95%**. |
| **Performance** | Tempo de Resposta | O tempo entre o upload e a exibição dos resultados deve estar no intervalo:<br>**A = {x ∈ ℤ | 2 ≤ x ≤ 15}**, em segundos. |
| **Usabilidade** | Interface | A interface deve ser intuitiva, com clareza visual e organização lógica das informações. |