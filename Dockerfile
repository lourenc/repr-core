FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .
RUN yarn

EXPOSE 3000

CMD ["yarn", "start"]