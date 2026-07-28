# 🚀 EPlayerX 数据总控中枢 & 首页 CMS (EPlayerX DataHub)

> **全自动化、零维护、防强缓存的 EPlayerX 播放器云端数据大盘与首页配置调度中枢。**  
> 基于 **Cloudflare Workers + Cloudflare R2 + GitHub API** 构建，支持 6 大追剧周更表自动分发、TMDB 智能脱水抓取、Telegram 机器人双向控制，以及 **GitHub `config.ts` 智能代码增量合并**。

---

## ✨ 核心特性

- 📅 **六大追剧周更表合集**：内置 **动漫新番**、**国产追剧**、**国漫追番**、**韩剧周更**、**日剧周更**、**东南亚剧周更** 6 大按星期归类的动态合集。
- 🎯 **TMDB 智能脱水与图/标提取**：自动匹配高质量中文海报、透明 Logo、高清背景剧照，自带无 Logo 自动生成纯白 SVG 文字 Logo 退避机制。
- 🛠️ **无污染定向入库引擎**：支持直接输入名称/TMDB ID，或者直接粘贴包含“周一/星期一”的文本或 Excel 内容，智能正则解析并排期入库。
- 🎨 **智能代码增量合并 (GitHub Sync)**：
  - 勾选模块自动更新/追加；
  - 取消勾选自动切除删除；
  - 100% 安全保护你在 GitHub 手写的其他原生 Block、自定义函数和类型。
- 📱 **iOS/iPad 协议级秒刷（反强缓存）**：
  - 自动递增 `HOME_CONFIG_VERSION` 版本号，强制客户端清除本地旧布局缓存；
  - 协议层剥离 ETag 并注入 `no-cache` 头，彻底击穿 iOS 手机 WKWebView 硬盘强缓存。
- 🤖 **Telegram 机器人交互**：绑定 Telegram 机器人，直接在 TG 群发送 `/sync` 即可唤出交互式菜单控制云端数据抓取。

---

## 🛠️ 架构说明

```
[ TMDB / 豆瓣 / Bangumi / Trakt ]
              │
              ▼
    [ Cloudflare Workers ]  ◄── (网络协议层 禁用缓存) ──►  [ EPlayerX 播放器 (iOS/iPad/Web) ]
       │            │
       ▼            ▼
  [ Cloudflare R2 ]  [ GitHub API ] (智能增量更新 config.ts)
  (存储 JSON 列表)
```

---

## 🔑 环境变量（保姆级配置清单）

在 Cloudflare Worker 的 **Settings（设置） -> Variables（环境变量）** 中配置以下变量。请确保填写准确无误：

| 环境变量名称 | 是否必填 | 类型 | 说明与获取方式 | 示例值 |
| :--- | :---: | :--- | :--- | :--- |
| `ADMIN_SECRET` | **必填** | Secret | 后台控制台登录密码，以及 API 鉴权密钥（自定义设置）。 | `my_super_password_123` |
| `WORKER_URL` | **必填** | Text | 你的 Worker 自定义绑定域名或 Cloudflare 默认 Worker 域名（用于生成内部地址）。 | `https://homepage.eplayerx.cc.cd` |
| `GITHUB_REPO` | **必填** | Text | 你的 EPlayerX 首页代码仓库的路径（格式为 `用户名/仓库名`）。 | `6otho/eplayerx-homepage` |
| `GITHUB_PATH` | **必填** | Text | `config.ts` 在你的 GitHub 仓库中的相对路径。 | `src/config/config.ts` |
| `GITHUB_TOKEN` | **必填** | Secret | 用于推送代码到 GitHub 的 **Personal Access Token**。 | `ghp_xxxxxxxxxxxxxx` |
| `TMDB_ACCESS_TOKEN` | **必填** | Secret | TMDB API 读访问令牌（v4 Auth），用于抓取海报、剧照和 Logo。 | `eyJhbGciOiJIUzI1NiJ9...` |
| `TRAKT_CLIENT_ID` | 选填 | Text | Trakt.tv API 客户端 ID（用于欧美大片/热播欧美剧集抓取）。 | `a1b2c3d4e5f6...` |
| `TG_BOT_TOKEN` | 选填 | Secret | Telegram 机器人的 Token（用于控制台与通知交互）。 | `123456789:ABCdefGhIJKlm...` |
| `TG_CHAT_ID` | 选填 | Text |接收 Telegram 通知以及限制操作权限的你个人的 TG Chat ID。 | `987654321` |
| `GUEST_SECRET` | 选填 | Secret | 访客或备用受限权限凭证密钥（可设置为与 ADMIN_SECRET 一致或留空）。 | `guest_pass_123` |

---

## 📖 环境变量保姆级获取教程

### 1. 🔑 获取 `GITHUB_TOKEN`
1. 登录 GitHub，点击右上角头像 $\rightarrow$ **Settings**。
2. 滚动到左侧最底部，点击 **Developer settings** $\rightarrow$ **Personal access tokens** $\rightarrow$ **Tokens (classic)**。
3. 点击 **Generate new token** $\rightarrow$ **Generate new token (classic)**。
4. Note 填写 `EPlayerX-CMS`，Expiration 选择 `No expiration`（永不过期）。
5. 勾选 **`repo`** 权限（包含 `repo:status`, `repo_deployment`, `public_repo` 等）。
6. 点击最下方 **Generate token**，**立即复制生成的 `ghp_` 开头的字符串**（只显示一次！）。

### 2. 🎬 获取 `TMDB_ACCESS_TOKEN`
1. 打开 [TMDB 官网](https://www.themoviedb.org/) 并登录账号。
2. 点击右上角头像 $\rightarrow$ **账户设置 (Settings)** $\rightarrow$ 左侧菜单 **API**。
3. 在 API 页面中，找到 **API 读访问令牌 (v4 Auth)**（API Read Access Token）。
4. 复制那一长串以 `eyJhbGci...` 开头的超长密钥即可。

### 3. 📺 获取 `TRAKT_CLIENT_ID`（选填）
1. 登录 [Trakt.tv](https://trakt.tv/)，打开 [Trakt API Applications](https://trakt.tv/oauth/applications)。
2. 点击 **NEW APPLICATION**，Name 填 `EPlayerX`，Redirect uri 填 `urn:ietf:wg:oauth:2.0:oob`。
3. 保存后即可看到 **Client ID**，复制即可。

### 4. 🤖 获取 `TG_BOT_TOKEN` 与 `TG_CHAT_ID`（选填）
1. **获取 Token**：在 Telegram 中搜索 `@BotFather`，发送 `/newbot`，按照提示创建机器人，最后会获得一串 `123456789:ABC...` 的 Token。
2. **获取 Chat ID**：在 Telegram 中搜索 `@userinfobot`，点击 `/start`，它会立即回复你的数字 **Id**（如 `987654321`）。

---

## 🚀 保姆级部署指南

### 第一步：创建并绑定 Cloudflare R2 Bucket（存储桶）

1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 点击左侧菜单 **R2** $\rightarrow$ **创建存储桶 (Create Bucket)**。
3. 存储桶名称输入：`eplayerx-data`（也可自定义），点击创建。
4. 进入你的 Cloudflare Worker 项目，点击 **Settings（设置）** $\rightarrow$ **Bindings（变量绑定）**。
5. 在 **R2 存储桶绑定** 区域点击 **添加绑定 (Add binding)**：
   * **变量名称 (Variable name)**：必须填 **`R2_BUCKET`**
   * **R2 存储桶 (R2 Bucket)**：选择你刚才创建的 `eplayerx-data`。
6. 点击保存。

---

### 第二步：部署 Cloudflare Worker 代码

1. 进入你的 Worker 部署界面，点击 **Edit Code（编辑代码）**。
2. 将项目中的 **Part 1** 与 **Part 2** 代码按顺序拼接粘入 `worker.js` 文件中。
3. 点击右上角 **Deploy（部署）**。

---

### 第三步：添加环境变量

1. 返回 Worker 项目设置页面，点击 **Settings** $\rightarrow$ **Variables**。
2. 在 **Environment Variables** 栏点击 **Add（添加）**。
3. 参照上方的《环境变量保姆级配置清单》，将 `ADMIN_SECRET`、`GITHUB_TOKEN`、`TMDB_ACCESS_TOKEN` 等变量逐一填入。
4. 点击 **Save and Deploy（保存并部署）**。

---

### 第四步：绑定自定义域名（关键：解决 iOS 强缓存与域名硬编码）

为了保证 iOS/iPad 端能够无缝调取且不受 Workers 临时域名变动影响：
1. 在 Worker 的 **Triggers（触发器）** 选项卡下，点击 **Add Custom Domain（添加自定义域名）**。
2. 输入你的域名（例如 `homepage.eplayerx.cc.cd`）。
3. 确保你的环境变量 `WORKER_URL` 的值与此域名完全一致：`https://homepage.eplayerx.cc.cd`。

---

## 🎮 控制台使用指南

### 1. 管理员登录
访问你的 Worker 域名（例如 `https://homepage.eplayerx.cc.cd`），输入你在环境变量中设置的 `ADMIN_SECRET` 密码即可进入管理后台。

### 2. 同步与抓取数据
* **单榜同步**：切换到任意分类（如“韩剧追剧周更表”），点击右上角 **`⚡ 同步最新数据`**，Worker 会实时调用 TMDB/豆瓣 API 抓取最新片单并存入 R2 存储桶。
* **批量同步**：点击 **`📦 批量同步`**，可勾选多个分类一次性全自动抓取。

### 3. 排版与 GitHub 增量推送
1. 点击右上角 **`🎨 排版与增量合并`**。
2. 通过长按左侧 ☰ 拖拽调整分类的前后展示顺序。
3. **勾选/取消勾选**：
   * 勾选启用的模块：推送时会自动更新排版或追加进 GitHub 的 `config.ts`；
   * 取消勾选的模块：推送时会**精准从 GitHub 中删除**；
   * 你在 GitHub 手写加上的原生组件（如分类浏览/网络平台）：**100% 安全保留，绝不误删**。
4. 点击 **`增量合并推送至 GitHub`**，Worker 会全自动处理好 TypeScript 语法、递增版本号 `HOME_CONFIG_VERSION` 并提交给 GitHub！

### 4. 激活 Telegram 机器人交互
1. 点击顶部 Telegram 图标按钮 $\rightarrow$ 确认激活。
2. 打开 Telegram 找到你的机器人，发送 `/start` 绑完之后，发送 `/sync` 即可调出多选抓取卡片。

---

## ❓ 常见问题排坑 (FAQ)

#### Q1：为什么推送成功后，手机 iOS 客户端里的合集没有立刻改变？
> **答**：EPlayerX 客户端会把首页布局保存在手机本地。后台在每次推送时会自动把 `HOME_CONFIG_VERSION` 的版本号数值 `+1`。
> 确保 Vercel / GitHub Actions 的构建日志显示 **`Success`** 后，在手机上**将 EPlayerX App 上划退出后台彻底冷启动一次**，客户端检测到版本号增加，就会瞬间擦除旧缓存，展示最新布局！

#### Q2：推送后 GitHub 的 `config.ts` 打包报错或少逗号怎么办？
> **答**：本项目的后台内置了 **括号平衡算法** 与 **全局语法清洗引擎**，在提交给 GitHub 的最后一刻会自动剔除所有双逗号 `,,` 并补齐缺失的句尾逗号，保证生成的 TypeScript 语法 100% 绝对合法。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 许可证开源。特别感谢 [6otho/eplayerx-homepage](https://github.com/6otho/eplayerx-homepage) 项目提供的底层首页设计规范！
