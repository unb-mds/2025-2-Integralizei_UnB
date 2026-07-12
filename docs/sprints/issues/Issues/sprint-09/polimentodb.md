# Integralizei UnB -- Atualização das Estatísticas de Integralização

## O que foi feito?

### 1. Ajuste no cálculo das estatísticas agregadas

Valores de média, mínimo e máximo foram convertidos de floats para
inteiros usando `int(round(valor))`.\
Exemplos: - 32.75 → 33
- 21.125 → 21
- 34.48 → 34

### 2. Atualização do código Python

O script `gerar_estatisticas_agregadas()` foi modificado para salvar os
valores já como inteiros no SQLite, garantindo maior consistência e
simplicidade na manipulação dos dados.

### 3. Resultado Final

-   Dados uniformes e limpos
-   Melhora na apresentação no frontend
-   Menos necessidade de conversões adicionais
