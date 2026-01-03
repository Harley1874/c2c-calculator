# 使用官方 Bun 镜像作为基础
FROM oven/bun:1 as base
WORKDIR /app

# ==========================================
# Builder Stage: 构建应用
# ==========================================
FROM base as builder

# 1. 复制依赖描述文件
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/desktop/package.json ./apps/desktop/
COPY packages/shared/package.json ./packages/shared/

# 2. 安装依赖 (包括 devDependencies，因为需要构建)
RUN bun install --frozen-lockfile

# 3. 复制源代码
COPY . .

# 再次安装以确保本地 workspace 链接正确
RUN bun install

# 4. 生成 Prisma Client
# 注意：我们需要先生成 Shared 包，再生成 API 的 Prisma
WORKDIR /app/apps/api
RUN bunx prisma generate

# 5. 构建 Shared 包
WORKDIR /app/packages/shared
RUN bun run build

# 6. 构建 API
WORKDIR /app/apps/api
RUN bun run build
RUN ls -la dist || echo "dist not found" # Debug output

# ==========================================
# Runner Stage: 运行应用 (生产环境)
# ==========================================
FROM oven/bun:1-slim as runner
WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production

# 1. 复制 Production 依赖
# 为了简单，我们直接复制 builder 中的 node_modules
# (更优做法是重新只安装 prod 依赖，但 Monorepo 处理起来较繁琐)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules

# 2. 复制构建产物
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
# Shared 包的构建产物也需要
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

# 3. 暴露端口
EXPOSE 3000

# 4. 启动命令
# 启动前运行 migrate deploy 确保数据库结构最新
# 由于 Monorepo 编译可能导致目录结构嵌套，我们尝试查找 main.js
CMD ["sh", "-c", "cd apps/api && bunx prisma migrate deploy && node dist/main.js"]

