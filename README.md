# blog（开发中...）

博客 v2

## 使用的技术

- Typescript
- 前端
  - 前台
    - Nuxt3、Vue3、Axios、Scss
  - 后台
    - React(未开始)
- 后端
  - NestJs、TypeORM、MySQL、Redis、Docker 等

## 项目结构

项目使用 monorepo 结构，前后端项目是在/apps 目录下，一些共用的代码放在/packages 下

```text
├── apps
|  ├── api                  // 后端服务
|  ├── admin                // 前端后台（未开始）
|  └── front                // 前端前台
├── packages
|  ├── apis                 // 接口请求函数，当有多个前端项目时可省略相同部分请求代码
|  ├── dtos                 // 接口验证类；供后端验证数据类型，供前端ts类型约束用
|  ├── entities             // typeorm mysql实体，供后端生成表格，供前端ts类型约束用
|  └── permission-rules     // 账号权限规则，前后端都可用
```

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
这两个目录改为文件（复制名字后删除该目录，然后新建空白文件把名字粘贴上去）。

## 配置

需要设置好配置，否则不可启动。  
新建
[apps/api/src/env/.env.local](./apps/api/src/env/.env.local)文件，然后按以下配置填入数据

```dotenv
# root账户配置
ROOT_USERNAME=
ROOT_PASSWORD=

# 微信小程序登录配置 需要在.env.local上配置覆盖
MINI_PROGRAM_APPID=
MINI_PROGRAM_SECRET=

# openai配置 需要在.env.local上配置覆盖
OPENAI_API_KEY=

# 阿里云oss配置
OSS_REGION=
OSS_ACCESS_KEY_ID=
OSS_ACCESS_KEY_SECRET=
OSS_BUCKET=
OSS_CNAME=
OSS_ENDPOINT=

# redis配置
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
```

> - root 账号是必填的；
> - redis 如果未设置（默认设置为空）可不填；
> - 如果小程序不需要登录可随意填写；

其他的暂时没有也可随意填写一些数据先启动，不可留空（除了 redis），但后期部署一定要有，否则部分功能会受限

## 启动

### 整体启动

一个命令启动前后端项目

```shell
pnpm start:dev
```

### 分离启动

在开发时偶尔会要只重启前端或后端，这时最好分别启动前后端项目

启动前端项目

```shell
pnpm start:dev:front
```

启动后端项目

```shell
pnpm start:dev:api
```

## 部署（TODO）
