# 1. Base Node
FROM node:18-alpine

# 2. Diretório de trabalho
WORKDIR /app

# 3. Copia apenas os arquivos de dependência desse serviço
COPY package.json ./
# (Removemos o package-lock.json daqui por enquanto pois você o deletou)

# 4. Instala (USANDO INSTALL AGORA)
RUN npm install

# 5. Copia o código do serviço de login
COPY . .

# 6. Expõe a porta 3001
EXPOSE 3001

# 7. Roda o serviço
CMD ["npm", "run", "dev"]