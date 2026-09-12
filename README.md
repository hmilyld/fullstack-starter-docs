# fullstack-starter-docs

`create-fullstack-app` 的官方文档站，基于 **Astro 7 + Starlight**，中英双语、明暗双色，静态输出。

## 开发

```bash
npm install
npm run dev        # 本地开发 http://localhost:4321
npm run build      # 构建到 dist/（含 Pagefind 搜索索引）
npm run preview    # 预览构建产物
```

要求 Node.js ≥ 18。

## 目录

```
src/
├── content/docs/            # 中文（根语言，URL /）
│   ├── getting-started/     # 开始使用
│   ├── generated/           # 生成的项目
│   ├── features/            # 核心功能
│   ├── deployment/          # 部署与运维
│   ├── reference/           # 参考
│   ├── development/         # 维护脚手架
│   └── notes.md             # 注意事项与 FAQ
├── content/docs/en/         # 英文（URL /en/…，与中文一一对应）
├── components/StackBoard.astro  # 首页交互签名组件
├── styles/custom.css        # 设计令牌与 Starlight 主题覆盖
└── content.config.ts
```

- **新增页面**：在 `src/content/docs/` 建 `.md` / `.mdx`，并在 `astro.config.mjs` 的 `sidebar` 中登记（同时提供 `translations.en`）。
- **英文版**：在 `src/content/docs/en/` 建对应文件；页面内链需带 `/en` 前缀。

## 设计系统

视觉方向为「电路板 / 蓝图纸」：冷色靛蓝主色 + 铜色走线作为唯一强调色。

- 令牌定义在 `src/styles/custom.css`，明色为 `:root[data-theme='light']`，暗色为默认 `:root`。
- 主色 `--ff-copper`、`--ff-board`、`--ff-panel` 等 `--ff-*` 变量可按需调整。
- 字体使用自托管的 Space Grotesk（标题）、IBM Plex Sans（正文）、IBM Plex Mono（标签/数据）。
- 首页签名组件 `StackBoard` 会自动按 URL 判断中英文。

## 部署

`npm run build` 产出的 `dist/` 是纯静态站点，可部署到任意静态托管。上线前请在 `astro.config.mjs` 中设置 `site` 为最终域名，以便生成正确的 canonical 链接与 sitemap。

## 文档来源

内容依据 `fullstack-starter` 仓库的 `README.md`、`AGENTS.md` 与各模板实现整理。修改脚手架功能时，请同步更新本仓库对应页面。
