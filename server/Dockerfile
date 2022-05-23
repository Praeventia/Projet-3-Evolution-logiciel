# PRODUCTION DOCKERFILE
# ---------------------
# This Dockerfile allows to build a Docker image of the NestJS application
# and based on a NodeJS 14 image. The multi-stage mechanism allows to build
# the application in a "builder" stage and then create a lightweight production
# image containing the required dependencies and the JS build files.
# 
# Dockerfile best practices
# https://docs.docker.com/develop/develop-images/dockerfile_best-practices/
# Dockerized NodeJS best practices
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
# https://www.bretfisher.com/node-docker-good-defaults/
# http://goldbergyoni.com/checklist-best-practice-of-node-js-in-production/

FROM ubuntu:focal-20220316 as init
RUN apt-get update
ENV DEBIAN_FRONTEND="noninteractive" TZ="America/New_York"
RUN apt-get install -y libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

FROM node:14 as builder
ENV NODE_ENV build
WORKDIR /home/node
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build \
    && npm prune --production


FROM node:14
ENV NODE_ENV production
WORKDIR /home/node
COPY --from=builder /home/node/package*.json ./
COPY --from=builder /home/node/node_modules/ ./node_modules/
COPY --from=builder /home/node/dist/ ./dist/
COPY ./default_avatar /home/node/default_avatar
COPY ./avatar /home/node/avatar
COPY ./concours /home/node/concours
COPY ./drawing /home/node/drawing
COPY ./gif /home/node/gif
EXPOSE 3000
CMD ["node", "dist/main.js"]