# Agent PM Blog Docker Practice

这份文档用当前 Agent PM 博客项目来学习 Docker。目标不是背命令，而是理解一个真实 Next.js 项目如何被打包、运行、持久化和部署。

## 1. 这个项目里的 Docker 角色

| 文件 / 概念 | 在本项目里负责什么 |
|---|---|
| `Dockerfile` | 把源码、依赖、内容构建和 Next.js standalone 产物打成一个 image |
| `docker-compose.yml` | 定义容器怎么运行：端口、环境变量、数据卷、健康检查 |
| image | 一个可重复运行的应用包，例如 `agent-pm-knowledge-workbench:latest` |
| container | image 的运行实例，真正监听端口并处理请求 |
| volume / bind mount | 把 SQLite 数据、生成内容和备份放到容器外，避免重建镜像时丢数据 |
| healthcheck | 让 Docker 判断容器是否真的可用，而不只是进程还活着 |

## 2. 为什么 Next.js 的 basePath 要特别处理

线上入口是：

```text
http://118.145.157.107:3100/agent-pm
```

也就是说应用不是挂在域名根路径 `/`，而是挂在 `/agent-pm`。

Next.js 的 `basePath` 会影响静态资源地址、路由链接和客户端跳转，因此必须在构建阶段就传入：

```bash
NEXT_PUBLIC_BASE_PATH=/agent-pm
```

所以 `docker-compose.yml` 里同时有：

```yaml
build:
  args:
    NEXT_PUBLIC_BASE_PATH: ${NEXT_PUBLIC_BASE_PATH:-}
environment:
  NEXT_PUBLIC_BASE_PATH: ${NEXT_PUBLIC_BASE_PATH:-}
```

前者给 `next build` 用，后者给运行时服务端代码用。

## 3. 本地练习：构建并运行容器

在项目根目录创建一个只用于 Docker 本地练习的 env 文件：

```bash
cat > .env.docker.local <<'EOF'
APP_URL=http://127.0.0.1:3322/agent-pm
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3322/agent-pm
BETTER_AUTH_URL=http://127.0.0.1:3322/agent-pm
NEXT_PUBLIC_BASE_PATH=/agent-pm
HOST_PORT=3322
AUTH_SECRET=local-dev-secret-change-me
BETTER_AUTH_SECRET=local-dev-better-auth-secret-change-me
WORKBENCH_DATA_MOUNT=./data/docker-local
WORKBENCH_GENERATED_MOUNT=./data/docker-generated
WORKBENCH_BACKUP_MOUNT=./backups
REFRESH_ALLOW_GIT_PULL=false
EOF
```

启动：

```bash
docker compose --env-file .env.docker.local up -d --build
```

验证：

```bash
curl http://127.0.0.1:3322/agent-pm/api/health
open http://127.0.0.1:3322/agent-pm
```

停止：

```bash
docker compose --env-file .env.docker.local down
```

如果想连数据一起删除：

```bash
docker compose --env-file .env.docker.local down -v
```

注意：`down -v` 会删除 Docker 管理的 named volumes。使用本地目录 bind mount 时，目录文件仍在项目里，需要你自己清理。

## 4. 线上练习：和当前服务器拓扑对应起来

当前线上拓扑是：

```text
公网 :3100/agent-pm
  -> agent-harness nginx
  -> 宿主机 127.0.0.1:3317
  -> Agent PM app
```

如果改为 Docker 运行，容器应该监听内部 `3000`，宿主机只暴露本地 `3317`：

```text
container :3000
  -> host 127.0.0.1:3317
  -> nginx /agent-pm
```

线上 `.env` 里关键值应类似：

```dotenv
APP_URL=http://118.145.157.107:3100/agent-pm
NEXT_PUBLIC_APP_URL=http://118.145.157.107:3100/agent-pm
BETTER_AUTH_URL=http://118.145.157.107:3100/agent-pm
NEXT_PUBLIC_BASE_PATH=/agent-pm
HOST_PORT=3317
WORKBENCH_DATA_MOUNT=/opt/agent-pm-workbench/shared/data
WORKBENCH_GENERATED_MOUNT=/opt/agent-pm-workbench/shared/generated
WORKBENCH_BACKUP_MOUNT=/opt/agent-pm-workbench/shared/backups
```

## 5. 常用排查命令

看容器状态：

```bash
docker compose ps
```

看日志：

```bash
docker compose logs -f --tail=100 workbench
```

进入容器：

```bash
docker compose exec workbench sh
```

看镜像：

```bash
docker images | grep agent-pm
```

看数据卷：

```bash
docker volume ls
```

重新构建：

```bash
docker compose build --no-cache workbench
docker compose up -d
```

## 6. 你应该掌握的 8 个判断

1. `Dockerfile` 解决“如何构建镜像”。
2. `docker-compose.yml` 解决“如何运行一组容器”。
3. `image` 是包，`container` 是运行中的实例。
4. `ports` 左边是宿主机端口，右边是容器端口。
5. 数据库不能只放容器内部，必须挂 volume 或 bind mount。
6. `NEXT_PUBLIC_*` 在前端项目里经常是构建期变量。
7. 健康检查要打真实业务 URL，而不是只看进程是否存在。
8. Docker 不是自动部署工具，但它让部署脚本变得稳定。

