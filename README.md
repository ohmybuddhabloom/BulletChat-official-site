# BuddhaChat 官网

[BuddhaChat](https://www.buddhachat.online/) 的官方落地页——一个根植于佛教智慧的冥想式 AI 体验。

## 技术栈

- **React 19** + **Vite 8**
- 滚动驱动视频主视觉（scroll-scrubbed video hero）
- 带物理动量的 3D 卡片轮播
- 响应式布局，基于 profile 的偏移量系统
- 无第三方动画库

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
npm run preview
```

## 测试

```bash
npm test
```

## 目录结构

```
src/
├── components/sunyata/   # 所有页面区块组件
├── content/              # 场景配置与故事数据
├── lib/                  # 滚动数学、响应式偏移、资源存储
├── pages/
│   ├── SunyataLanding.jsx   # 主落地页
│   └── StoryPage.jsx        # 故事阅读页（?story= 查询参数触发）
└── index.css             # 全局样式与动画
```

## 编辑器模式

URL 末尾添加 `?edit=1` 可开启可视化场景编辑器，用于调整布局、位置和内容。

## 性能说明

- 轮播区域的 RAF 循环通过 `IntersectionObserver` 门控——滚出视口时自动暂停
- 滚动视频使用 `1/30s` 缓动收敛阈值，大幅减少视频帧解码次数
- 噪点遮罩层使用 CSS `background-image` data URI（一次性光栅化），取代实时 SVG `feTurbulence` 计算
- `resize` 事件处理器加了 150ms 防抖，避免窗口拖动时的级联重渲染
