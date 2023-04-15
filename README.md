# blog（开发中...）

博客 v2

## 使用的技术

- Typescript
- 前端
  - 前台
    - Nuxt3、Vue3、Axios、Scss
  - 后台
    - React(未实现)
- 后端
  - NestJs、TypeORM、MySQL、Redis、Docker 等

## 准备

使用 pnpm 作为包管理工具，不推荐其他包管理工具安装

```shell
pnpm install
```

> 由于国内 npm 有点时好时坏，install 时最好开启 vpn，能够保证一次性安装完成

安装完成后执行以下脚本命令：

```shell
pnpm start:dev:api:env
```

第一次执行会报错（以后会修复）。  
解决办法：把 [apps/api/tmp/mysql/conf/my.cnf](./apps/api/tmp/mysql/conf/my.cnf) 和 [apps/api/tmp/redis/redis.conf](./apps/api/tmp/redis/redis.conf)
这两个目录改为文件（复制名字，然后新建文件把目录名字复制过去）。

## 启动

一个命令启动前后端项目

```shell
pnpm start:dev
```

在开发时偶尔会要重启前端或后端，这是最好分别启动前后端项目

启动前端项目

```shell
pnpm start:dev:front
```

启动后端项目

```shell
pnpm start:dev:api
```

## 部署（TODO）
