FROM node:alpine

RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash

    
WORKDIR /app

COPY package*.json ./

RUN npm install -g ts-node

RUN npm install -g nodemon

RUN npm install

RUN chgrp -R 0 /app && chmod -R g=u /app

COPY . .

EXPOSE 3001

CMD ["nodemon", "start"]

# HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl --fail http://localhost:3001/ || exit 1