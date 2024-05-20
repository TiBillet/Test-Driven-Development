FROM ubuntu:22.04

# base
RUN apt-get update && apt-get install ca-certificates curl gnupg wget unzip sudo nano iputils-ping gcc g++ make apt-transport-https x11-apps chromium-browser -yq

# node.js, npm
RUN NODE_MAJOR=20 \
    && curl -fsSL https://deb.nodesource.com/setup_$NODE_MAJOR.x | sudo bash - \
    && sudo apt-get install -y nodejs

# user
RUN export uid=1000 gid=1001
RUN mkdir -p /home/docker_user
RUN echo "docker_user:x:${uid}:${gid}:docker_user,,,:/home/docker_user:/bin/bash" >> /etc/passwd
RUN echo "docker_user:x:${uid}:" >> /etc/group
RUN echo "docker_user ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/docker_user
RUN chmod 0440 /etc/sudoers.d/docker_user
RUN chown ${uid}:${gid} -R /home/docker_user 

USER docker_user 
ENV HOME /home/docker_user

WORKDIR /home/docker_user/Playwright

COPY playwright.config.js playwright.config.js

# install playwright
RUN npm init -y \
    && npm i -D @playwright/test@1.44.0 \
    && npm i -D @types/node@20.12.7 \
    && npx playwright install \
    && npx playwright install-deps

# tests
RUN npm i -S node-fetch@2.6.12 \
    && npm i -S ip@2.0.1 
