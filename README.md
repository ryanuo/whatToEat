# whatToEat

<p align="center">
  <img src="./public/logo.png" width="120" alt="whatToEat logo" />
</p>

> 今天吃什么？的决策工具，帮助你快速选择合适的菜谱。

## 项目介绍

whatToEat 是一个基于 Nuxt 构建的应用，旨在解决日常饮食选择的困扰。通过提供丰富的菜谱数据，帮助用户随机选择或筛选适合的菜品，轻松解决"今天吃什么"的难题。

## 功能特性

- 🎲 **随机抽菜**：老虎机式高速轮换，一键定格今日菜品，菜名点击直达图文菜谱
- 🎨 **换肤与主题色**：5 套手绘背景 + 5 组主题色自由搭配，本地记忆选择
- 🧁 **分类筛选**：气泡式选择弹窗，按菜系缩小抽取范围，空选即全部
- 📺 **视频做法**：一键搜索 B 站视频教程，页面内弹窗直接播放（移动端为底部抽屉）
- ✨ **AI 助手**：自然语言点菜（支持语音输入）、抽中菜品自动生成劝吃文案；基于 [models.dev](https://models.dev) 搜索选择任意 OpenAI 兼容厂商，API Key 仅存本地浏览器
- 📱 **全端适配**：响应式布局，键盘焦点与无障碍支持

<img src="./public/og-image.png" alt="License">

## 快速开始

### 在线体验

直接访问 [体验](https://eat.ryanuo.cc/)

### 本地运行

1. 克隆仓库

```bash
git clone https://github.com/ryanuo/whatToEat.git
cd whatToEat
```

2. 安装依赖

```bash
pnpm install
```

3. 启动开发服务器

```bash
pnpm dev
```

4. 在浏览器中访问 `http://localhost:3000`

## 构建部署

### 构建生产版本

```bash
pnpm build
```

### 预览构建结果

```bash
pnpm preview
```

### 部署选项

[![Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/ryanuo/whatToEat)
[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ryanuo/whatToEat)

### Docker 部署

默认使用镜像内置的菜谱数据（构建时打包仓库内的 `public/recipes.json`）。如需指向自定义菜谱源，设置 `RECIPES_URL` 环境变量（支持 base URL 或完整 `recipes.json` URL）：

```bash
RECIPES_URL=http://your-recipes-host:5000 docker compose up -d --build
```

### Docker 部署（服务器不构建：从 GHCR 拉镜像运行）

仓库提交到 GitHub 后，会通过 GitHub Actions 自动构建并发布镜像到 GHCR。

在服务器上部署（无需构建）：

```bash
docker pull ghcr.io/ryanuo/whattoeat:latest

docker run -d --name whattoeat \
    -p 3000:3000 \
    ghcr.io/ryanuo/whattoeat:latest
```

## 数据来源

菜谱数据由 `scripts/crawl.py` 每周从 [HowToCook](https://github.com/Anduin2017/HowToCook) 抓取生成 `public/recipes.json`（通过 GitHub Actions 自动提交）。服务端接口 `server/routes/api/recipes.ts` 默认读取本地内置数据，也可通过 `RECIPES_URL` 环境变量指向自定义菜谱源。

## 参考

- [菜谱](https://github.com/Anduin2017/HowToCook)
- [mcp-cook](https://github.com/worryzyy/HowToCook-mcp)

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
