+++
title = "Sprints do Projeto 🏃‍♂️"
date = "2025-09-22T13:35:00-03:00"
weight = 40
toc = true
draft = false
+++

Bem-vindo ao registro de Sprints do projeto **Integralizei UNB**.

Esta seção é dedicada a documentar o ciclo de desenvolvimento iterativo e incremental do nosso projeto. Cada sprint representa um período focado de trabalho com o objetivo de entregar um incremento de valor ao produto final.

---

### Nossa Metodologia de Sprints

Adotamos um framework ágil para garantir entregas contínuas e de alta qualidade. Nossas sprints são estruturadas da seguinte forma:

- **Duração:** Cada sprint tem a duração de uma semana, começando na segunda-feira e terminando no domingo.
- **Planejamento (Planning):** No início de cada sprint, a equipe se reúne para definir as metas e selecionar as tarefas do backlog que serão desenvolvidas.
- **Execução:** Durante a semana, a equipe trabalha nas tarefas definidas.
- **Revisão (Review):** Ao final da sprint, apresentamos o que foi concluído para validar o incremento de software.
- **Retrospectiva:** Após a revisão, a equipe discute o que correu bem, o que pode ser melhorado e define ações para o próximo ciclo.

### Histórico de Sprints

Abaixo está a lista de todas as sprints executadas no projeto, com links para seus respectivos planejamentos e resultados.

---
### Artigos da Seção

<ul>
  {{ range .Pages }}
    <li><a href="{{ .RelPermalink }}">{{ .Title }}</a></li>
  {{ end }}
</ul>
---
## DEBUG: Listando sub-páginas encontradas

<ul>
{{ range .Pages }}
    <li>Página Encontrada: <a href="{{ .RelPermalink }}">{{ .Title }}</a> (Arquivo: {{ .File.Path }})</li>
{{ end }}
</ul>
---