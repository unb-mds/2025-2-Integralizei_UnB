# 1. Base Python
FROM python:3.12-slim

# 2. Configurações de Ambiente
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 3. Instalação de dependências do sistema (incluindo Poppler e LibPQ para Postgres)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    poppler-utils \
    netcat-traditional \
    && rm -rf /var/lib/apt/lists/*

# 4. Configura a raiz do projeto no container
WORKDIR /app

# 5. Instala dependências Python (o requirements.txt está na raiz do backend)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 6. Copia todo o código do backend
COPY . .

# 7. MUDA o diretório de trabalho para a pasta do Flask
WORKDIR /app/formulario-flask

# 8. Expõe a porta 5000
EXPOSE 5000

# 9. Comando para rodar (simulando o "python app.py")
# Usamos o python direto ou flask run. Vamos manter o padrão que você usa.
CMD ["python", "app.py"]