FROM node:12-alpine

WORKDIR /usr/src/app
COPY package*.json ./
COPY server.js ./
COPY config.js ./
RUN npm install
EXPOSE 3000
CMD ["node","server.js"]
