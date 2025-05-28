# Étape 1 : Build de l'application

FROM node:18 AS builder
 
WORKDIR /app
 
COPY package*.json ./

RUN npm install
 
COPY . .
 
RUN npm run build
 
# Étape 2 : Image de production

FROM node:18-alpine
 
WORKDIR /app
 
COPY --from=builder /app ./
 
ENV NODE_ENV production

EXPOSE 3000
 
CMD ["npm", "start"]

 