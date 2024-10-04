FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

# Ensure the application has permission to create and write to the error log file
RUN touch error_log.json && chmod 666 error_log.json

EXPOSE 3000

CMD [ "node", "app.js" ]