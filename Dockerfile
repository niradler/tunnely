FROM node:12.18-alpine
ENV NODE_ENV production
ENV PORT 8081
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 8081
CMD ["node", "server.js"]
