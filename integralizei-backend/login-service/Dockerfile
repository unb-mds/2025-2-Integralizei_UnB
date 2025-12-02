# 1. Base Node
FROM node:18-alpine

# 2. Diretório de trabalho
WORKDIR /app

# 3. Copia apenas os arquivos de dependência desse serviço
COPY package.json package-lock.json ./

# 4. Instala
RUN npm ci

# 5. Copia o código do serviço de login
COPY . .

# 6. Expõe a porta 3001 (Padrão de microsserviços de auth)
EXPOSE 3001

# 7. Roda o serviço
CMD ["npm", "run", "dev"]