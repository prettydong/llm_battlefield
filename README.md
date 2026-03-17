<div align="center">

# 🦗 赛博蛐蛐斗兽场 🦗

### *Cyber Cricket Arena — LLM Gomoku Battlefield*

**让两个大语言模型在五子棋棋盘上你死我活，你只需要坐在观众席嗑瓜子。**

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 📖 这是什么？

**赛博蛐蛐斗兽场** 是一个 LLM（大语言模型）五子棋对战观赏平台。你可以配置任意两个兼容 OpenAI API 格式的大模型，让它们在 15×15 的棋盘上自动对弈，实时观看 AI 之间的博弈过程。

> 观战免费，结果不保。🍿

## ✨ 功能亮点

- 🎮 **LLM 自动对弈** — 配置两个 AI 的 API 地址、模型名和密钥，点击开始，坐等厮杀
- 🖥️ **实时观战** — 棋盘动态渲染每一步落子，实况日志滚动播放
- 💬 **弹幕系统** — 模拟直播间氛围，虚拟观众自动产生弹幕反应
- 🎁 **打赏系统** — 给蛐蛐送鲜花、鸡腿、火箭、钻石等虚拟礼物
- 👑 **贵宾席** — VIP 观众的专属发言展区
- 🧪 **Mock 模式** — 内置幽灵蛐蛐（Mock API），无需真实密钥即可测试完整流程
- 🌑 **深色极客美学** — Glassmorphism 毛玻璃 + 发光效果 + 流畅 CSS 动画

## 🏗️ 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Next.js 16](https://nextjs.org/) (Pages Router) |
| 前端 | React 19 + Vanilla CSS |
| 后端 | Next.js API Routes (Node.js) |
| 棋盘渲染 | SVG（带径向渐变、阴影滤镜） |
| 数据存储 | 内存存储（轻量 MVP，无数据库依赖） |
| LLM 通信 | OpenAI 兼容 Chat Completions API |

## 📂 项目结构

```
llm_arena/
├── components/
│   ├── Board.js          # SVG 棋盘组件（支持落子动画、胜负高亮）
│   ├── Danmaku.js        # 弹幕系统（自动生成观众反应）
│   ├── GiftPanel.js      # 虚拟礼物打赏面板
│   └── VipSection.js     # 贵宾席模块
├── lib/
│   ├── gomoku.js          # 五子棋核心逻辑（创建游戏、落子、胜负判定）
│   └── llm_runner.js      # LLM 通信驱动器（API 调用、响应解析、对战循环）
├── pages/
│   ├── index.js           # 大厅首页（对战列表、创建入口）
│   ├── new.js             # 新建对战配置面板
│   ├── games/[id].js      # 观战页面（棋盘 + 日志 + 弹幕 + 礼物）
│   └── api/
│       ├── games/         # 游戏 CRUD API
│       └── mock/          # 内置 Mock LLM 服务
├── styles/
│   └── globals.css        # 全局深色主题样式
└── package.json
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18
- **npm** >= 9

### 安装 & 启动

```bash
# 克隆仓库
git clone https://github.com/prettydong/llm_battlefield.git
cd llm_battlefield

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

服务启动后访问 [http://localhost:3000](http://localhost:3000) 即可进入斗兽场大厅。

### 使用 Mock 模式（无需 API Key）

1. 点击首页「**⚡ 召唤蛐蛐入场**」
2. 在配置页点击「**🧪 用幽灵蛐蛐测试**」按钮，自动填充 Mock 配置
3. 点击「**⚔ 开始厮杀！**」即可观看两只虚拟蛐蛐自动对弈

### 使用真实 LLM

在配置页填写以下信息：

| 字段 | 说明 | 示例 |
|------|------|------|
| 蛐蛐来源（API 地址） | OpenAI 兼容的 API Base URL | `https://api.openai.com/v1` |
| 蛐蛐品种（模型名） | 模型标识符 | `gpt-4o`、`deepseek-chat` |
| 入场凭证（密钥） | API Key | `sk-...` |

> 支持任何兼容 OpenAI Chat Completions 格式的 API，包括但不限于：
> OpenAI、DeepSeek、Moonshot (Kimi)、通义千问、智谱 GLM 等。

## 🎯 观战界面一览

观战页面采用三栏布局：

- **左栏**：选手信息面板 — 展示黑甲 / 白翎双方的模型名称、当前状态和战况统计
- **中栏**：15×15 SVG 棋盘 — 实时渲染落子，支持最后落子标记和五连高亮
- **右栏**：厮杀实况日志 — 每一步的 LLM 调用、响应和落子记录

底部三大互动区域：
- 🎁 **打赏区** — 送出虚拟礼物（鲜花 → 皇冠，丰俭由人）
- 💬 **弹幕区** — 模拟直播间弹幕，跟随对局节奏自动生成
- 👑 **贵宾席** — VIP 大佬专属发言

## 🔧 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/games` | 创建新对战 |
| `GET` | `/api/games` | 获取所有对战列表 |
| `GET` | `/api/games/:id` | 获取指定对战详情 |

### 创建对战请求示例

```json
{
  "players": {
    "black": {
      "baseUrl": "https://api.openai.com/v1",
      "model": "gpt-4o",
      "apiKey": "sk-xxx"
    },
    "white": {
      "baseUrl": "https://api.deepseek.com/v1",
      "model": "deepseek-chat",
      "apiKey": "sk-yyy"
    }
  }
}
```

## 📜 License

[MIT](LICENSE) — 蛐蛐无价，代码随便用。

---

<div align="center">

*Built with ☕ and 🦗 — 让 AI 卷起来*

</div>
