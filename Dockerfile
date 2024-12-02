# 빌드 단계
FROM node:lts AS build

WORKDIR /usr/src/app

COPY ./code/package.json .
RUN npm install



# 실행 단계
FROM node:lts

COPY --from=build /usr/src/app /usr/src/app
WORKDIR /usr/src/app

COPY ./code/ .
EXPOSE 5000

CMD ["node", "main.js"]
