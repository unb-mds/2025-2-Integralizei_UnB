# 📝 Requisitos Mensuráveis do Sistema

Este documento lista os requisitos funcionais e não-funcionais do projeto, transformados em critérios mensuráveis (SMART) para facilitar o desenvolvimento, teste e aceitação.

---

## 1. Requisitos Funcionais Mensuráveis ✅

Os requisitos funcionais definem **o que o sistema deve fazer**. Eles são transformados em critérios de aceitação binários e métricas de desempenho.

| Requisito Original | Requisito Mensurável/Critério de Aceite | Métrica de Sucesso |
| :--- | :--- | :--- |
| **Login com Conta no Google** | O usuário deve conseguir realizar o login e autenticação no sistema usando uma conta válida do Google em **menos de 3 segundos**. | **Disponibilidade do Login:** 100% de sucesso nos testes de integração com a API do Google. |
| **Recebimento do histórico** | O sistema deve aceitar o upload de arquivos PDF de histórico escolar no formato padrão da instituição e iniciar o processamento. | **Formatos Suportados:** Suporte a, no mínimo, 1 formato de PDF da instituição. **Taxa de Upload:** Sucesso em 99% dos uploads. |
| **Tutorial de como baixar seu histórico** | Uma seção de ajuda interativa deve ser exibida **abaixo da área de upload**, detalhando o passo a passo para baixar o histórico. | **Localização e Conteúdo:** Tutorial visível e completo conforme o design de interface, contendo, no mínimo, 3 etapas claras. |
| **Cálculo da integralização/IRA retroativas** | O sistema deve calcular a integralização e o Índice de Rendimento Acadêmico (IRA) para **qualquer semestre anterior** contido no histórico. | **Acurácia:** A diferença entre o IRA/Integralização calculados e os valores oficiais (se presentes) ou esperados deve ser **zero** (100% de acerto). |
| **Divisão das matérias por professor** | A tela de visualização deve exibir todas as matérias cursadas agrupadas, permitindo a **filtração** e **visualização única** por nome de professor. | **Funcionalidade de Agrupamento:** 100% das matérias processadas devem ser associadas a um professor e agrupáveis por ele. |
| **Sistema de rankeamento** | O sistema deve exibir o **ranking do usuário** em relação aos demais usuários, baseado no IRA, em uma tela dedicada e de fácil acesso. | **Tempo de Geração do Ranking:** O ranking deve ser gerado e exibido em **menos de 5 segundos** para até 1.000 usuários. |
| **Calcular a média de integralização e IRA** | O sistema deve exibir a média ponderada atualizada de integralização e IRA na tela principal do usuário. | **Consistência:** Os valores devem ser recalculados em **tempo real** após qualquer atualização (ex: Reciclagem de histórico). |
| **Pesquisa de matérias** | Deve haver um campo de busca que permita filtrar matérias por **nome**, **código** ou **professor**, exibindo resultados em tempo real. | **Latência da Busca:** Resultados devem ser exibidos em **menos de 500 milissegundos** após o terceiro caractere digitado. |
| **Recomendações: obrigatórias e optativas** | O sistema deve exibir uma lista de **5 a 10** sugestões de matérias obrigatórias pendentes e **5** optativas, com base no fluxo e histórico. | **Relevância:** Taxa de aceitação/clique nas recomendações deve ser mensurada (ex: Média de **15%** de cliques nas matérias recomendadas). |
| **Cálculo de integralização futura** | O usuário deve poder simular a inclusão de matérias futuras, e o sistema deve recalcular o IRA e a integralização projetados. | **Número de Simulações:** Suporte a, no mínimo, **5** simulações diferentes em uma única sessão. |
| **Armazenamento de dados** | Os dados processados devem ser armazenados de forma persistente, permitindo que o usuário acesse seu dashboard a qualquer momento. | **Durabilidade dos Dados:** Garantia de persistência de dados de **99.999%** (ou 5 noves de durabilidade). |
| **Reciclagem de histórico** | O sistema deve permitir que o usuário faça o upload de um histórico mais recente, **substituindo** os dados anteriores. | **Integridade da Substituição:** 100% dos dados antigos devem ser **removidos/sobrescritos** pelos novos dados no upload. |
| **Favoritar matérias** | O usuário deve conseguir marcar e desmarcar matérias como favoritas e visualizá-las em uma lista separada. | **Funcionalidade:** Taxa de falha ao favoritar/desfavoritar: **0%**. A lista de favoritos deve ser carregada em **menos de 2 segundos**. |

---

## 2. Requisitos Não Funcionais Mensuráveis ⚙️

Os requisitos não funcionais definem os **critérios de qualidade e restrições** do sistema.

| Categoria | Requisito Mensurável | Métrica e Critério de Aceite Refinado |
| :--- | :--- | :--- |
| **Compatibilidade** | Navegador | O sistema deve passar em **100%** dos testes de regressão (e2e) e responsividade de layout na **versão mais recente do Google Chrome**. |
| **Segurança** | Proteção de Dados | Todos os dados de análise devem ser anonimizados (sem identificação pessoal) antes do processamento. A comunicação com o servidor deve ser criptografada via **TLS 1.2** ou superior. |
| **Performance** | Extração de Dados | A acurácia na extração de dados-chave (nome da matéria, código, nota, carga horária) do PDF deve ser **superior a 95%** em um *dataset* de teste com, no mínimo, **50 históricos diferentes**. |
| **Performance** | Tempo de Resposta | O tempo médio (latência) entre o upload do histórico e a exibição do dashboard deve ser: $$2 \text{ segundos} \leq T_{resposta} \leq 15 \text{ segundos}$$ para **95%** dos usuários (percentil 95). |
| **Usabilidade** | Interface | A interface deve atingir uma pontuação de **Facilidade de Uso (SUS)** de, no mínimo, **75** em um teste de usabilidade com, pelo menos, **10 usuários-alvo**. O design deve seguir o padrão **Material Design**. |

## 3. Requisitos Fora de Escopo ❌

O sistema deliberadamente **não** irá implementar as seguintes funcionalidades:

* Salvar dados sensíveis (o sistema não deve armazenar dados como CPF, telefone, etc.).
* Avaliação de professores.

***

