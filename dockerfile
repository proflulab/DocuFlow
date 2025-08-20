# 使用官方 Node.js 镜像作为构建环境
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

# 首先复制包管理文件以利用 Docker 缓存层
COPY package.json package-lock.json* ./

# 安装依赖（包括 devDependencies，因为需要构建）
RUN npm install

# 复制项目文件
COPY . .

# 构建应用
RUN npm run build

# 使用更小的基础镜像来运行应用
FROM node:22-alpine AS runner

# 设置工作目录
WORKDIR /app

# 从构建阶段复制构建输出和依赖
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

# 环境变量
ENV NODE_ENV=production
ENV PORT=8080

# 使用非 root 端口
EXPOSE 8080

# 启动命令
CMD ["npm", "start"]