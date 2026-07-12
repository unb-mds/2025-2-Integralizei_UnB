### Ferramentas/Projetos que utilizam json como persistência de dados

---


| Projeto             | Tipo                        | Como utiliza JSON                                                                 | Link |
|---------------------|-----------------------------|-----------------------------------------------------------------------------------|------|
| **MongoDB**         | Banco de dados NoSQL        | Armazena documentos em BSON (variação binária de JSON), modelo lógico é JSON.      | [MongoDB](https://www.mongodb.com/) |
| **Apache CouchDB**  | Banco de dados NoSQL        | Persiste documentos em JSON e oferece API HTTP/RESTful para manipulação.           | [CouchDB](https://couchdb.apache.org/) |
| **Couchbase Server**| Banco multimodelo NoSQL     | Modelo nativo em JSON, consultas avançadas com SQL++ (N1QL).                       | [Couchbase](https://www.couchbase.com/) |
| **lowdb**           | Biblioteca JavaScript       | Usa um arquivo `db.json` como “mini banco” para persistência local.                | [lowdb](https://github.com/typicode/lowdb) |
| **JSON Server**     | Ferramenta para prototipagem| Cria rapidamente uma API REST fake a partir de um arquivo `db.json`.               | [JSON Server](https://github.com/typicode/json-server) |

---

## Vantagens observadas
- Flexibilidade de schema (não exige estrutura rígida).  
- Compatibilidade com a maioria das linguagens modernas.  
- Leitura e escrita fáceis, dados legíveis por humanos.  
- Escalabilidade em bancos como MongoDB e Couchbase.  
- Útil tanto em produção (MongoDB, Couchbase, CouchDB) quanto em protótipos (lowdb, JSON Server).  

## Limitações observadas
- Arquivos JSON simples não escalam bem para grandes volumes de dados.  
- Ferramentas como lowdb e *SON Server não são adequadas para produção.  
- Bancos maiores (ex.: MongoDB) podem exigir mais configuração e cuidado com performance.  
- Flexibilidade em excesso pode gerar inconsistência de dados sem padronização.  

---

