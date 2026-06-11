# GitHub + Docker Compose 自动部署

这份文档描述这个项目的推荐部署方式：

```text
本地改代码
  -> git commit
  -> git push 到 GitHub main
  -> GitHub Actions 登录服务器
  -> 服务器 git pull 最新代码
  -> docker compose up -d --build
```

## 1. 服务器准备

登录服务器：

```bash
ssh root@118.145.157.107
```

安装基础工具。如果服务器已经装过，可以跳过：

```bash
apt update
apt install -y git curl docker.io docker-compose-plugin
systemctl enable --now docker
```

创建部署目录：

```bash
mkdir -p /opt/agent-pm-blog
```

## 2. 让服务器可以拉 GitHub 仓库

在服务器生成一把专门用于拉代码的 SSH key：

```bash
ssh-keygen -t ed25519 -C "agent-pm-blog-deploy" -f ~/.ssh/agent-pm-blog-deploy -N ""
```

查看公钥：

```bash
cat ~/.ssh/agent-pm-blog-deploy.pub
```

去 GitHub 仓库：

```text
Settings -> Deploy keys -> Add deploy key
```

粘贴刚才的公钥。只需要读取代码，不要勾选写权限。

然后在服务器配置 SSH 使用这把 key：

```bash
cat >> ~/.ssh/config <<'EOF'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/agent-pm-blog-deploy
  IdentitiesOnly yes
EOF

chmod 600 ~/.ssh/config
ssh -T git@github.com
```

第一次连接会问是否信任 GitHub，输入 `yes`。

## 3. 第一次克隆项目

```bash
cd /opt
git clone git@github.com:only-one-punch/AgentLearnForPM.git agent-pm-blog
cd /opt/agent-pm-blog
```

## 4. 创建生产环境变量

生产环境变量不要提交到 GitHub，直接放服务器。

```bash
cp .env.example .env.production
vim .env.production
```

最少需要确认这些值：

```env
APP_URL=http://118.145.157.107:3322/agent-pm
NEXT_PUBLIC_APP_URL=http://118.145.157.107:3322/agent-pm
BETTER_AUTH_URL=http://118.145.157.107:3322/agent-pm
NEXT_PUBLIC_BASE_PATH=/agent-pm
HOST_PORT=3322
```

如果你要挂到已有 Nginx 的 `/agent-pm` 路径下，`NEXT_PUBLIC_BASE_PATH=/agent-pm` 要保留。

## 5. 手动跑一次部署

```bash
cd /opt/agent-pm-blog
BRANCH=main ENV_FILE=.env.production bash scripts/server-deploy.sh
```

验证：

```bash
curl http://127.0.0.1:3322/agent-pm/api/health
curl -I http://127.0.0.1:3322/agent-pm
```

## 6. 配置 GitHub Actions 自动部署

这个项目已经包含：

```text
.github/workflows/deploy.yml
scripts/server-deploy.sh
```

你需要在 GitHub 仓库里配置 Secrets：

```text
Settings -> Secrets and variables -> Actions -> New repository secret
```

需要添加：

```text
SSH_HOST=118.145.157.107
SSH_USER=root
SSH_PRIVATE_KEY=用于登录服务器的私钥内容
```

可选添加 Variables：

```text
DEPLOY_PATH=/opt/agent-pm-blog
```

注意：`SSH_PRIVATE_KEY` 是 GitHub Actions 登录服务器用的私钥，不是服务器拉 GitHub 的 deploy key。最好单独创建一把用于 CI/CD 登录服务器的 key。

## 7. 以后怎么更新

本地改完代码后：

```bash
git add .
git commit -m "Update blog"
git push origin main
```

推送到 `main` 后，GitHub Actions 会自动：

1. 安装依赖
2. 运行测试
3. 构建项目
4. SSH 到服务器
5. 在服务器 `git pull`
6. 执行 `docker compose --env-file .env.production up -d --build`
7. 检查健康接口

## 8. 常用排查命令

服务器上查看容器：

```bash
cd /opt/agent-pm-blog
docker compose --env-file .env.production ps
```

查看日志：

```bash
docker compose --env-file .env.production logs -f workbench
```

手动重新部署：

```bash
cd /opt/agent-pm-blog
BRANCH=main ENV_FILE=.env.production bash scripts/server-deploy.sh
```

如果 `git pull` 失败，通常是服务器没有配置好 GitHub deploy key，或者服务器上的部署目录被手动改过导致不能 fast-forward。
