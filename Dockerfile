FROM node:20.14.0-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build


FROM node:20.14.0-alpine

WORKDIR /app

COPY --from=build /app/dist dist
COPY --from=build /app/node_modules ./node_modules

RUN chown node:node ./

USER node

EXPOSE 3000

CMD ["node", "dist/main"]
