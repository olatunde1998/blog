FROM node:20
ENV NODE_ENV=production
WORKDIR /
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001

CMD ["node", "server.ts"]