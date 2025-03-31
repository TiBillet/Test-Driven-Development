FROM debian:12

# base
RUN apt-get update && apt-get install ca-certificates curl gnupg wget unzip sudo nano iputils-ping gcc g++ make apt-transport-https -yq

Run apt-get install libglib2.0-0 libnss3 libnspr4 libdbus-1-3 libatk1.0-0 libatk-bridge2.0-0 \
 libcups2 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libgbm1 libxkbcommon0\
 libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0 -yq

 # node.js, npm
RUN NODE_MAJOR=20 \
    && curl -fsSL https://deb.nodesource.com/setup_$NODE_MAJOR.x | sudo bash - \
    && sudo apt-get install -y nodejs

WORKDIR /playwright

# install playwright
RUN npm init -y \
    && npm i -D @playwright/test@1.51.1 \
    && npm i -D @types/node@20.12.7 \
    && npm i dotenv@16.3.1 \
    && npm i moment@2.29.4 \
    && npm i node-fetch@2.6.12 \
    && npm i slugify@1.6.6 \
    && npm i uuid@9.0.1 \
    && npx playwright install