# Resumo da Arquitetura

> Este documento apresenta um resumo da arquitetura do projeto Integralizei UnB.  
> Para a documentação completa e detalhada, consulte [documentação](./documentacao.md).

## Escopo do Sistema

O sistema permite que alunos enviem seus históricos acadêmicos para calcular **integralização** e **IRA**, verificar se podem cursar matérias com professores específicos e receber recomendações de matérias optativas.

## Componentes Principais

### Cliente (Front-end)
- Interface usada pelos alunos (navegador ou app).
- Envia históricos e exibe resultados (IRA, integralização, recomendações, status de matérias).
- **Responsabilidade:** interação com o usuário e envio de requisições ao servidor.

### Servidor / Orquestrador (Back-end)
- Recebe históricos enviados pelo cliente.
- Coordena o fluxo: envia à API externa → recebe dados → processa integralização, ranqueamento e validações → responde ao cliente.
- **Responsabilidade:** controlar o fluxo de processamento de forma centralizada, evitando microserviços complexos.

### API Externa (Gemini)
- Recebe históricos acadêmicos e retorna dados estruturados.
- **Responsabilidade:** extração confiável de informações do PDF.

### Banco de Dados
- Armazena históricos, resultados de integralização, escolhas de matérias e recomendações.
- **Responsabilidade:** persistência e consulta rápida de dados para análises futuras.

## Comunicação e Fluxo de Dados

1. O cliente envia o histórico.
2. O servidor orquestra o envio à API Gemini.
3. Recebe os dados extraídos e consulta o banco para informações históricas e agregadas.
4. Calcula integralização, valida pré-requisitos e gera recomendações.
5. Responde ao cliente com resultados e sugestões.

## Padrões e Decisões Relevantes

- **Arquitetura em Camadas (Layered Architecture):** organiza código em Apresentação → Lógica de Negócio → Serviços → Acesso a Dados.
- **Modelo Cliente-Servidor:** separação entre interface do usuário e processamento do servidor.
- **Orquestrador de Serviços no Backend:** fluxo centralizado de processamento, simples e de fácil manutenção.
- Desacoplamento entre extração de dados (API externa) e processamento interno (back-end).
