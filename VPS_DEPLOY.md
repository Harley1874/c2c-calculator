# VPS Docker 部署指南 (Ubuntu 22.04)

本指南针对 2核 2G 内存的 VPS 进行了优化，包含 Swap 配置以防止构建时内存不足。

## 1. 连接 VPS 并更新系统

```bash
# SSH 连接 (请替换为你的 IP)
ssh root@your_server_ip

# 更新系统软件包
apt update && apt upgrade -y
```

## 2. 配置 Swap (关键步骤)

2G 内存不足以支持 NestJS 的构建过程，我们需要添加 4G 的虚拟内存 (Swap)。

```bash
# 创建 4G 的 swap 文件
fallocate -l 4G /swapfile

# 设置权限
chmod 600 /swapfile

# 初始化 swap
mkswap /swapfile

# 启用 swap
swapon /swapfile

# 确认是否生效 (看到 /swapfile 即成功)
free -h

# 永久生效 (重启后依然有效)
echo '/swapfile none swap sw 0 0' | tee -a /etc/fstab
```

## 3. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 验证安装
docker --version
docker compose version
```

## 4. 获取代码

由于是私有仓库，建议使用 HTTPS Token 方式或 SSH Key 方式。这里演示 HTTPS 方式：

```bash
# 安装 git
apt install git -y

# 克隆仓库 (输入你的 GitHub 账号和 Token)
git clone https://github.com/Harley1874/c2c-calculator.git

# 进入目录
cd c2c-calculator
```

## 5. 配置环境变量

我们已经修改了 docker-compose.yml 支持环境变量。现在创建 `.env` 文件。

```bash
# 创建并编辑 .env 文件
nano .env
```

**粘贴以下内容 (请修改密码和密钥):**

```env
# 数据库配置
DB_ROOT_PASSWORD=your_strong_root_password
DB_NAME=c2c_calculator
DB_USER=c2c_user
DB_PASSWORD=your_strong_db_password
DB_PORT=3306

# API 配置
JWT_SECRET=please_change_this_to_a_random_long_string
```

*按 `Ctrl+O`, `Enter` 保存，`Ctrl+X` 退出。*

## 6. 启动服务

```bash
# 构建并后台启动
# 注意：第一次构建可能需要几分钟
docker compose up -d --build
```

**查看日志:**
```bash
docker compose logs -f api
```

如果看到 `Nest application successfully started`，说明启动成功。

## 7. 验证访问

现在你应该可以通过 `http://<你的VPS_IP>:3000` 访问后端 API 了。

- 尝试访问: `http://<你的VPS_IP>:3000/` (应该显示 "Hello World...")

## 8. (进阶) 配置 Nginx 反向代理和 HTTPS

为了让 Vercel 部署的前端能访问这个后端，你需要配置 HTTPS。建议安装 **Nginx Proxy Manager** (可视化面板) 或手动配置 Nginx + Certbot。

### 简单方案：Caddy (自动 HTTPS)

```bash
# 安装 Caddy
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy

# 配置反向代理 (将 api.example.com 替换为你的域名)
caddy reverse-proxy --from api.example.com --to localhost:3000
```

