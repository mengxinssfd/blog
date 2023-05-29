FROM node:16.18-alpine
WORKDIR /apps

# api
COPY apps/api/dist /apps/api

# front
COPY apps/front/.output /apps/front
#修复nuxt打包element-plus后找不到/@popperjs/core包的问题
COPY apps/front/.output/server/node_modules/@sxzz/popperjs-es /apps/front/server/node_modules/@popperjs/core

# pm2
COPY deploy/tmp/pm2.config.js /apps

# npmrc
COPY .npmrc /apps

# deps
RUN yarn global add pm2
RUN (cd /apps/api && npx pnpm i)

CMD pm2 start /apps/pm2.config.js --no-daemon

# EXPOSE 3000 3001
