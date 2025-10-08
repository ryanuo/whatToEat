# whatToEat

一个基于今天吃什么？"的决策工具，帮助你快速选择合适的菜谱。

## 项目介绍

whatToEat 是一个基于 Nuxt 构建的单页应用，旨在解决日常饮食选择的困扰。通过提供丰富的菜谱数据，帮助用户随机选择或筛选适合的菜品，轻松解决"今天吃什么"的难题。

## 快速开始

### 在线体验

直接访问 [应用地址](https://eat.ryanuo.cc/) 体验（需替换为实际部署地址）

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

- **Netlify**：配置已包含在 `netlify.toml` 中，可直接连接 GitHub 仓库自动部署
- **Vercel**：兼容 Nuxt 应用，可直接导入部署
- **自建服务器**：构建后将 `.output/public` 目录内容部署到静态服务器

## 项目结构

- `app/components`：UI 组件
- `app/pages`：页面组件
- `app/types`：TypeScript 类型定义
- `app/utils`：工具函数
- `server/routes`：API 路由
- `public`：静态资源

## 数据来源

菜谱数据来源于远程 JSON 接口，通过 `server/api/recipes.ts` 进行获取和处理。

## 参考

- [菜谱](https://github.com/Anduin2017/HowToCook)
- [mcp-cook](https://github.com/worryzyy/HowToCook-mcp)

## 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。
