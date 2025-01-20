FROM node:20.9-alpine
WORKDIR /elearning/backend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
EXPOSE 4000