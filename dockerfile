FROM node:22-alpine3.21

WORKDIR /usr/src/app

# Copiar archivos de configuración de npm
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

EXPOSE 3001
