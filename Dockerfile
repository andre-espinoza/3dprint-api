# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.12.2

FROM node:${NODE_VERSION}-alpine

WORKDIR /3dprint-api

COPY . .

RUN npm install

RUN npm install nodemon

CMD npm run devstart

EXPOSE 3000

 
