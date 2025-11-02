+++
title = "User Story Map 🗺️"
toc = true
+++

<style>
  .story-map-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* Cria 3 colunas de tamanho igual */
    gap: 20px; /* Espaço entre as colunas */
  }
  .story-map-column {
    background-color: #f9f9f9;
    border: 1px solid #eee;
    padding: 15px;
    border-radius: 8px;
  }
  /* Faz as colunas ficarem uma em cima da outra em telas pequenas (celulares) */
  @media (max-width: 768px) {
    .story-map-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

O User Story Map (Mapa de Histórias de Usuário) é a nossa principal ferramenta de planejamento. Ele organiza a jornada do estudante em grandes atividades e detalha as funcionalidades (histórias) necessárias para construir o produto, priorizando o que entrega mais valor primeiro.

O mapa é dividido horizontalmente em **Releases (Entregas)**, garantindo que a primeira versão do produto (MVP) já seja funcional e resolva o problema principal do usuário.

---

## (MVP - Produto Mínimo Viável)

Esta é a primeira versão do produto, focada na jornada essencial: o estudante pode se cadastrar, analisar seu histórico e planejar o próximo semestre.

**Espinha Dorsal (Atividades do Usuário):**
> **Acessar/Configurar Perfil** → **Analisar Situação Atual** → **Planejar Próximo Semestre**

<div class="story-map-grid">
  <div class="story-map-column">
    ### 🧗 Épico 1
    **Criar Conta e Fazer Login**
    
    - **US01:** Criar conta de novo usuário.
    - **US02:** Fazer login de usuário existente.
  </div>

  <div class="story-map-column">
    ### 📊 Épico 2
    **Enviar Histórico e Ver Análise**

    - **US03:** Encontrar botão para upload do histórico.
    - **US04:** Ver progresso da análise.
    - **US05:** Visualizar dashboard com dados extraídos.
    - **US06:** Ver métricas principais (IRA, etc.) em destaque.
    - **US07:** Listar matérias obrigatórias pendentes.
    - **US09:** Ver predição da chance na vaga.
  </div>

  <div class="story-map-column">
    ### 💡 Épico 3
    **Simular Grade Horária**

    - **US11:** Buscar matérias para a simulação.
    - **US12:** Adicionar e remover matérias.
    - **US13:** Ver resultado do cálculo (créditos, integralização).
    - **US14:** Salvar a simulação para consulta futura.
  </div>
</div>

---

## (Versão Futura)

Após o lançamento do MVP, esta entrega adiciona funcionalidades poderosas de pesquisa e descoberta, enriquecendo a experiência do usuário.

**Espinha Dorsal (Atividades do Usuário):**
> **Explorar Disciplinas da Universidade**

<div class="story-map-grid">
  <div class="story-map-column">
    ### 🔍 Épico 4
    **Pesquisar Turmas Específicas**

    - **US15:** Buscar matéria por nome ou código.
    - **US16:** Ver estatísticas da turma (taxa de aprovação, IRA médio).
    - **US17:** Ver "ranking" anônimo de alunos que conseguiram a vaga.
    - **US18:** Favoritar turmas de interesse.
  </div>
  <div class="story-map-column">
    </div>
  <div class="story-map-column">
    </div>
</div>