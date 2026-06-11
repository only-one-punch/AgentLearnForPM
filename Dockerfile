# 这行启用 Dockerfile v1 语法，让下面的 BuildKit cache mount 写法可用。
# 它不是基础镜像，也不会进入最终镜像。
# syntax=docker/dockerfile:1

# =========================
# 1. base 阶段：公共基础环境
# =========================

# FROM 选择基础镜像。
# node:22-alpine 表示：使用已经装好 Node.js 22 的 Alpine Linux 小系统。
# AS base 给这个阶段起名叫 base，后面的 deps/builder 阶段可以复用它。
FROM node:22-alpine AS base

# WORKDIR 类似在容器里执行 cd /app。
# 如果 /app 不存在，Docker 会自动创建。
# 后面的 COPY/RUN/CMD 默认都以 /app 为当前目录。
WORKDIR /app

# ENV 设置环境变量。
# NEXT_TELEMETRY_DISABLED=1 用来关闭 Next.js 匿名遥测。
# 这个变量会存在于后续从 base 继承的阶段里。
ENV NEXT_TELEMETRY_DISABLED=1

# RUN 表示构建镜像时执行命令。
# apk 是 Alpine Linux 的包管理器，类似 Ubuntu 里的 apt。
# --no-cache 表示安装后不保留 apk 索引缓存，减少镜像体积。
# libc6-compat 提供 glibc 兼容层，一些 Node 原生依赖可能需要。
# 这里只保留 libc6-compat，避免在构建阶段安装不必要的系统工具。
RUN apk add --no-cache libc6-compat

# =========================
# 2. deps 阶段：安装项目依赖
# =========================

# 从 base 阶段继续，不重新准备 Node/系统依赖。
# 这个阶段只负责安装 node_modules。
FROM base AS deps

# ARG 是构建期变量，只在 docker build 阶段使用。
# NPM_CONFIG_REGISTRY 可以让我们临时指定 npm registry。
# 默认空字符串，表示使用 npm 默认 registry。
ARG NPM_CONFIG_REGISTRY=

# 只先复制 npm 依赖声明文件，不复制全部源码。
# 这样只要 package.json/package-lock.json 没变，npm ci 这一层就能复用 Docker 缓存。
COPY package.json package-lock.json ./

# RUN --mount=type=cache,target=/root/.npm 是 BuildKit 的缓存挂载。
# 它会缓存 npm 下载的包，加速后续构建，但不会把缓存写进最终镜像。
# 如果传了 NPM_CONFIG_REGISTRY，就把 npm registry 切到指定地址。
# npm ci 会严格按照 package-lock.json 安装依赖，适合 CI 和 Docker 构建。
RUN --mount=type=cache,target=/root/.npm \
  if [ -n "$NPM_CONFIG_REGISTRY" ]; then npm config set registry "$NPM_CONFIG_REGISTRY"; fi; \
  npm ci

# =========================
# 3. builder 阶段：构建 Next.js 应用
# =========================

# 从 base 阶段开始一个新的构建阶段。
# builder 负责复制源码并运行 npm run build。
FROM base AS builder

# NEXT_PUBLIC_BASE_PATH 是构建期变量。
# 这个项目线上挂在 /agent-pm 下，Next.js basePath 必须在构建时就知道。
# 如果不传，默认就是空字符串，表示应用挂在根路径 /。
ARG NEXT_PUBLIC_BASE_PATH=

# 把 ARG 写入 ENV，让 npm run build 时的 Node/Next.js 进程能读到 process.env.NEXT_PUBLIC_BASE_PATH。
# 这里的 ENV 只影响 builder 阶段和从它继承的构建动作，不代表最终运行时一定也有这个值。
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

# 从 deps 阶段复制已经安装好的 node_modules。
# 这样 builder 不需要重新 npm ci。
# --from=deps 表示来源不是本机文件，而是前面名叫 deps 的构建阶段。
COPY --from=deps /app/node_modules ./node_modules

# 把项目源码复制进 builder 阶段的 /app。
# 受 .dockerignore 控制，node_modules/.next/.env/数据库等不会被复制进去。
COPY . .

# 确保 public 和 .generated/knowledge 目录存在。
# 内容构建和 Next.js 构建过程中会使用这些目录。
RUN mkdir -p public .generated/knowledge

# 执行生产构建。
# npm run build 会先生成 Markdown 内容产物，再执行 next build，再准备 standalone 产物。
RUN npm run build

# =========================
# 4. runner 阶段：最终运行镜像
# =========================

# 最终镜像重新从 node:22-alpine 开始，而不是直接使用 builder。
# 好处是最终镜像更干净，只包含运行需要的文件，不包含完整源码和构建缓存。
FROM node:22-alpine AS runner

# 最终容器启动后也在 /app 下工作。
WORKDIR /app

# NODE_ENV=production 告诉 Node/依赖库当前是生产运行环境。
ENV NODE_ENV=production

# 继续关闭 Next.js 遥测。
ENV NEXT_TELEMETRY_DISABLED=1

# 容器内部服务监听的端口。
# docker-compose.yml 会把宿主机端口映射到这个容器端口。
ENV PORT=3000

# 让 Next.js server 监听容器内所有网卡。
# 如果只监听 localhost，Docker 端口映射可能访问不到服务。
ENV HOSTNAME=0.0.0.0

# 应用数据目录。
# docker-compose.yml 会把这个目录挂载到容器外，实现持久化。
ENV DATA_DIR=/app/data

# SQLite 数据库文件路径。
# 用户学习状态、登录数据等持久化数据会写到这里。
ENV DATABASE_PATH=/app/data/workbench.sqlite

# Markdown 构建后的知识库产物目录。
# 这里也可以挂载到容器外，方便刷新内容时保留稳定产物。
ENV GENERATED_CONTENT_DIR=/app/.generated/knowledge

# 运行时也保留这个变量，给服务端代码/链接生成读取。
# 注意：Next.js 静态资源路径仍然主要由 build 阶段的 NEXT_PUBLIC_BASE_PATH 决定。
ENV NEXT_PUBLIC_BASE_PATH=

# 安装最终运行阶段需要的少量系统工具。
# wget：Docker healthcheck 用它请求本机健康检查 URL。
# addgroup/adduser：创建非 root 用户 nextjs。
# mkdir：创建数据、备份和生成内容目录。
# chown：把 /app 目录权限交给 nextjs 用户，避免运行时写入权限问题。
RUN apk add --no-cache wget && \
  addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs && \
  mkdir -p /app/data /app/backups /app/.generated/knowledge && \
  chown -R nextjs:nodejs /app

# 复制 public 静态资源。
# --from=builder 表示从 builder 阶段复制。
# --chown=nextjs:nodejs 表示复制后文件归 nextjs 用户/ nodejs 组所有。
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# 复制内容构建生成的知识库 JSON/索引产物。
COPY --from=builder --chown=nextjs:nodejs /app/.generated ./.generated

# 复制 Next.js standalone 产物。
# standalone 目录里包含 server.js 和运行服务所需的最小 node_modules。
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 复制 Next.js 静态资源 chunk。
# 没有这一步，页面可能能返回 HTML，但 CSS/JS 静态资源会 404。
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 复制运维脚本，例如备份、恢复、内容刷新。
# 这些脚本不是启动必需，但容器运行后可能通过 docker compose exec 调用。
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

# 从这里开始，容器进程用 nextjs 用户运行，而不是 root。
# 这是生产容器的安全习惯。
USER nextjs

# EXPOSE 只是声明容器内部服务端口是 3000。
# 它不会自动开放宿主机端口；真正端口映射由 docker-compose.yml 的 ports 决定。
EXPOSE 3000

# CMD 是容器启动时执行的默认命令。
# server.js 来自上面的 .next/standalone 产物。
# 这条命令启动 Next.js 生产服务器。
CMD ["node", "server.js"]
