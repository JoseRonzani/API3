# Partimos de una imagen oficial y ligera
FROM node:20-alpine

# Creamos una carpeta de trabajo interna
WORKDIR /app

# Dependencias del sistema necesarias para compilar módulos nativos
# (bcrypt usa bindings nativos y en Alpine no siempre hay binarios
# precompilados, así que instalamos las herramientas de build)
RUN apk add --no-cache python3 make g++

# Copiamos solo los archivos de dependencias primero (mejor cache de Docker)
COPY package*.json ./

# Instalamos las dependencias de producción
RUN npm install --omit=dev

# Copiamos el resto de nuestro código (src, index.js, etc.)
COPY . .

# Exponemos el puerto que usa nuestra API
EXPOSE 3000

# Comando para prender el servidor
# (usamos "node index.js" directamente porque el package.json
# actual no define un script "start")
CMD ["node", "index.js"]
