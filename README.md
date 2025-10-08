# whatToEat

> 今天吃什么？的决策工具，帮助你快速选择合适的菜谱。

<img src="./public/og-image.png" alt="License">

## 项目介绍

whatToEat 是一个基于 Nuxt 构建的应用，旨在解决日常饮食选择的困扰。通过提供丰富的菜谱数据，帮助用户随机选择或筛选适合的菜品，轻松解决"今天吃什么"的难题。

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

## 数据来源

菜谱数据来源于远程 JSON 接口，通过 `server/api/recipes.ts` 进行获取和处理。

## 参考

- [菜谱](https://github.com/Anduin2017/HowToCook)
- [mcp-cook](https://github.com/worryzyy/HowToCook-mcp)

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
