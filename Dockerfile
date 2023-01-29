FROM node:17

#Create app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

CMD ["node", "src/toxic-positivity.js"]

