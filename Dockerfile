# Node base image
FROM node:20

# Arbeitsverzeichnis
WORKDIR /app

# package.json zuerst (für caching)
COPY package*.json ./

# Dependencies installieren
RUN npm install

# Rest des Codes kopieren
COPY . .

# Port (dein Server läuft z.B. auf 3001)
EXPOSE 3001

# Start command
CMD ["node", "src/index.js"]