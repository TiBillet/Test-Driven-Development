FROM ubuntu:22.04

# base
RUN apt-get update && apt-get install ca-certificates curl gnupg wget unzip sudo nano iputils-ping gcc g++ make apt-transport-https -yq

# node.js, npm
RUN NODE_MAJOR=20 \
    && curl -fsSL https://deb.nodesource.com/setup_$NODE_MAJOR.x | sudo bash - \
    && sudo apt-get install -y nodejs

WORKDIR /playwright

# install playwright
RUN npm init -y \
    && npm i -D @playwright/test@1.44.0 \
    && npm i -D @types/node@20.12.7 \
    && npx playwright install \
    && npx playwright install-deps

# tests
RUN npm i -S node-fetch@2.6.12 \
    && npm i -S ip@2.0.1
