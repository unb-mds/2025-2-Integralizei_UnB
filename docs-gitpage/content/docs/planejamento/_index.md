+++
title = "Planejamento do Projeto 🎯"
weight = 10 
+++

<style>
  .card-container-custom {
    display: grid;
    gap: 1rem; /* Espaço entre os cards */
  }
  .card-custom {
    display: flex; /* Alinha ícone e texto */
    align-items: center; /* Centraliza verticalmente */
    gap: 1rem; /* Espaço entre ícone e texto */
    padding: 1.25rem;
    border: 1px solid #e5e7eb; /* Borda cinza claro */
    border-radius: 0.75rem; /* Bordas arredondadas */
    background-color: #f9fafb; /* Fundo cinza bem claro */
    color: inherit;
    text-decoration: none;
    transition: all 0.2s ease-in-out;
  }
  .card-custom:hover {
    border-color: #3b82f6; /* Borda azul ao passar o mouse */
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    transform: translateY(-2px); /* Efeito de elevação */
  }
  .card-custom .icon {
    flex-shrink: 0; /* Impede que o ícone seja esmagado */
  }
  .card-custom .text-content .title {
    font-weight: 600;
    font-size: 1.1em;
    color: #111827; /* Cor do título */
  }
  .card-custom .text-content .description {
    font-size: 0.95em;
    color: #6b7280; /* Cor da descrição */
  }
</style>


Esta seção centraliza todos os artefatos de planejamento e estratégia do projeto **Integralizei UNB**. 

Ela serve como um ponto de partida para entender a visão do produto, a jornada do usuário, as decisões de arquitetura e as funcionalidades que serão desenvolvidas.

---

<div class="card-container-custom">
  <a class="card-custom" href="{{< relref "/docs/story-map" >}}">
    <div class="icon">🗺️</div>
    <div class="text-content">
      <div class="title">User Story Map</div>
      <div class="description">Nossa ferramenta visual para planejar a jornada do usuário e priorizar as funcionalidades.</div>
    </div>
  </a>

  <a class="card-custom" href="{{< relref "/docs/arquitetura" >}}">
    <div class="icon">🏗️</div>
    <div class="text-content">
      <div class="title">Documento de Arquitetura</div>
      <div class="description">A visão geral da nossa estrutura técnica, tecnologias e como os componentes se comunicam.</div>
    </div>
  </a>
  
 <a class="card-custom" href="{{< relref "/docs/planejamento/backlog.md" >}}">
    <div class="icon">📋</div>
    <div class="text-content">
      <div class="title">Product Backlog</div>
      <div class="description">A lista completa e priorizada de todas as Histórias de Usuário.</div>
    </div>
  </a>

 <div class="card-container">
  <a class="card-custom" href="{{< relref "/docs/arquitetura/adr001" >}}">
    <div class="icon">💡</div>
    <div class="text-content">
      <div class="title">Decisões de Arquitetura (ADRs)</div>
      <div class="description">O registro formal das decisões técnicas importantes que tomamos e suas justificativas.</div>
    </div>
  </a>
</div>