# Análise Comparativa de Bancos de Dados (PostgreSQL, SQLite, MongoDB) para o Projeto Integralizei UnB

## O que é um Banco de Dados

Um **banco de dados** é uma coleção organizada de informações digitais,
onde os dados podem ser armazenados de forma estruturada e recuperados
de maneira eficiente.
Ele funciona como uma grande gaveta digital: o sistema de gerenciamento
do banco permite inserir, atualizar e consultar as informações de forma
rápida e confiável.

No contexto do **Integralizei UnB**, após a extração dos dados dos
históricos acadêmicos em PDF, essas informações precisam ser armazenadas
para consultas e análises pelo sistema.
O banco de dados é o componente que guarda os dados de alunos e
disciplinas e permite **consultas relacionais** (por exemplo, buscar
todas as disciplinas cursadas por um aluno ou comparar notas) de forma
rápida e organizada.

------------------------------------------------------------------------

## Vantagens e Desvantagens de Cada Banco de Dados

### PostgreSQL

**Vantagens**
- **Confiabilidade e escalabilidade:** reconhecido por sua robustez, é
capaz de lidar com grandes volumes de dados e muitos usuários
simultâneos.
- **Suporte completo a ACID e SQL avançado:** garante integridade dos
dados em operações complexas, suportando transações, junções entre
múltiplas tabelas, índices, funções armazenadas e outros recursos
avançados.
- **Extensibilidade e comunidade ativa:** software livre, extensível e
com ampla adesão a padrões SQL, facilitando integrações.

**Desvantagens**
- **Configuração mais complexa:** requer instalação de um serviço
dedicado e conhecimentos de administração para otimização e manutenção.\
- **Uso maior de recursos:** pode ter desempenho inferior a soluções
mais simples em aplicações pequenas, demandando mais memória e
processamento.

------------------------------------------------------------------------

### SQLite

**Vantagens**
- **Leve e simples:** não precisa de servidor; todo o banco fica em um
único arquivo, facilitando setup e backup.\
- **Portabilidade:** fácil de mover ou copiar, ideal para protótipos,
aplicações locais ou móveis.\
- **Bom desempenho em bases pequenas:** leitura e escrita rápidas quando
o volume de dados e o número de usuários são reduzidos.

**Desvantagens**
- **Baixa escalabilidade:** não foi projetado para grandes volumes ou
muitos acessos simultâneos; operações de escrita são serializadas.\
- **Recursos limitados:** não possui gerenciamento avançado de
usuários/permissões nem replicação nativa; conjunto de tipos de dados é
mais restrito.
- **Aplicação local:** em uso web multiusuário exige compartilhamento do
arquivo no servidor, sem autenticação nativa.

------------------------------------------------------------------------

### MongoDB

**Vantagens**
- **Flexibilidade de esquema:** banco NoSQL orientado a documentos
(JSON/BSON), permitindo evolução da estrutura sem migrações.
- **Escalabilidade horizontal:** suporta distribuição dos dados em
múltiplos servidores (sharding) de maneira relativamente simples.
- **Alto desempenho em grandes volumes:** ideal para operações de
escrita/leitura massivas quando não são necessárias transações
complexas.

**Desvantagens**
- **Modelo não relacional:** não possui joins nativos; muitas vezes é
necessário duplicar dados, o que dificulta manter consistência.
- **Transações ACID limitadas:** mesmo com melhorias recentes, não
alcança a robustez de bancos relacionais em integridade de dados.
- **Maior consumo de recursos:** exige mais memória e consultas
complexas podem ser mais trabalhosas de otimizar.

------------------------------------------------------------------------

## Tabela Comparativa

| Banco de Dados | Tipo               | Principais Vantagens                                                                                 | Principais Desvantagens                                                                                                                      |
|----------------|--------------------|------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|
| **PostgreSQL** | Relacional (SQL)   | • Confiável, escalável e **ACID** (dados consistentes mesmo com muitas transações)  <br>• Suporta consultas SQL complexas, múltiplas tabelas e recursos avançados (índices, funções, etc.)  <br>• Comunidade ativa e extensível (código aberto, multiplataforma) | • Requer mais recursos de hardware e configuração de servidor dedicada (mais “pesado”)  <br>• Complexo de configurar/manter; curva de aprendizado mais alta para iniciantes em SGBDs |
| **SQLite**     | Relacional (embarcado) | • **Leve** e zero-configuração (não precisa de servidor)  <br>• Banco em um único arquivo (alta portabilidade e backup simples)  <br>• Bom desempenho em bases pequenas/local (baixa latência de acesso) | • **Não escalável** para grandes volumes ou muitos usuários simultâneos (escritas não paralelas)  <br>• Conjunto de recursos limitado (menos tipos de dados e funcionalidades; sem gerenciamento avançado de usuários/permissões) |
| **MongoDB**    | NoSQL (Documentos) | • **Esquema flexível** (modelo JSON sem estrutura fixa, fácil evoluir dados)  <br>• **Escalabilidade horizontal** simples (distribuição dos dados em múltiplos servidores/nós)  <br>• Alta performance em leituras/escritas escaláveis com grandes volumes de dados (quando bem dimensionado) | • **Não relacional**: não há joins nativos (pode ocorrer duplicação de dados e dificuldade em manter consistência)  <br>• **Sem ACID completo**: transações multi-documento são limitadas, exigindo cuidado para integridade em operações complexas  <br>• Exigente em recursos (alto uso de memória) e consultas agregadas complexas podem ter implementação mais trabalhosa que em SQL |


## Recomendação Final

Para o **Integralizei UnB**, que lida com dados estruturados de
históricos acadêmicos e exige **consultas relacionais complexas**,
recomenda-se o uso de um **banco relacional SQL**.

-   **Por que não MongoDB?** Apesar da flexibilidade, a ausência de
    relacionamentos e a limitação em transações ACID dificultam manter a
    consistência dos dados.
-   **PostgreSQL vs SQLite:** O SQLite é simples e adequado a
    protótipos, mas não escala bem. O PostgreSQL, além de oferecer os
    recursos necessários, já prepara o projeto para crescer sem a
    necessidade de migração futura.

**Conclusão:** o **PostgreSQL** é a melhor escolha para o MVP do
Integralizei UnB, garantindo confiabilidade, integridade e
escalabilidade desde o início.
