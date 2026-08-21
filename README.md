# 🚀 EPlayerX DataHub

> **全自动化、零维护、防强缓存的 EPlayerX 播放器云端数据大盘与首页配置调度中枢。**
>
> 基于 **Cloudflare Workers + Cloudflare R2 + GitHub API** 构建，支持 6 大追剧周更表自动分发、TMDB / MDBList 多源数据抓取、Telegram 机器人双向控制、**1～7 天自定义周期调度**，以及 GitHub `config.ts` **智能代码增量合并（V2 标准）**。

---

## ✨ 核心特性

### 📅 六大追剧周更表

内置 6 大按星期归类的动态影视合集：

* 🎌 动漫新番
* 🇨🇳 国产追剧
* 🎨 国漫追番
* 🇰🇷 韩剧周更
* 🇯🇵 日剧周更
* 🌴 东南亚剧周更

支持自动抓取、整理、同步和更新。

---

### 📊 四大评分与精准分级体系

聚合多个影视数据平台：

* **TMDB**
* **IMDb**
* **Trakt**
* **Rotten Tomatoes（烂番茄）**

同时自动提取中港台及欧美地区影视分级，例如：

```text
限
辅15
辅12
护
普
III
TV-MA
R
```

---

### 🔑 MDBList 多 API Key 自动顺延

支持配置多个 MDBList API Key：

```text
key1,key2,key3
```

当当前 Key 遇到：

* `429 Too Many Requests`
* `401 Unauthorized`
* API 配额耗尽

系统会自动切换到下一个 Key，避免大批量同步任务因为单个 API Key 限流而中断。

---

### 🎯 一键提取评分 / 图标 / 清空简介

支持对勾选影片批量执行数据处理：

* 获取 IMDb 评分
* 获取 Trakt 评分
* 获取 Rotten Tomatoes 评分
* 获取高清透明 Logo
* 获取带字剧照
* 获取纯净无字图片
* 自动提取影视分级
* 自动清除 `overview` 等剧情简介字段
* 保留并补齐 `genre_ids`

例如：

```json
{
  "genre_ids": [
    18,
    35,
    878
  ]
}
```

即使清空简介，也不会影响动作、剧情、科幻等题材分类。

---

### ⏱️ LED 控制台与 1～7 天自定义调度

内置实时 LED 状态控制台。

支持：

* 每 **1～7 天**自动执行
* 每日 **00:00～23:00** 任意整点执行
* 实时显示执行状态
* 显示当前时间
* 显示任务进度
* `🚀 立即测`
* `⏸ 暂停 / 恢复`

`🚀 立即测` 可以无视当前周期设置，直接执行完整同步任务，方便部署后的功能测试。

---

### 🛡️ 分类隔离黑名单

每个影视分类拥有独立黑名单。

例如：

```text
国产追剧
├── 正常影片
├── 正常影片
└── 黑名单影片
```

将影片加入某个分类的黑名单后：

* 后续该分类自动同步时跳过
* 不影响其他分类
* 不污染全局数据
* 无需修改原始数据源

---

### 🎨 五维影视资产库

支持可视化管理不同用途的影视图片：

| 类型    | 用途                 |
| ----- | ------------------ |
| `轮播`  | 精选卡片 / 大轮播纯净无字竖海报  |
| `剧照`  | 高清横版背景 / 带字剧照      |
| `竖`   | 列表卡片官方艺术字正标海报      |
| `标`   | 透明高清 Logo          |
| `SVG` | 无图片时自动生成纯白 SVG 文字标 |

---

### 🛠️ 定向入库引擎

支持多种入库方式：

#### 方式一：影片名称

```text
进击的巨人
```

#### 方式二：TMDB ID

```text
1399
```

#### 方式三：直接粘贴周更表

例如：

```text
周一
进击的巨人
星期一
某某电视剧

周二
某某动漫
```

#### 方式四：Excel

直接粘贴包含：

```text
周一
星期一
周二
星期二
```

等关键词的排期表，系统会自动识别星期并完成分类入库。

---

### 🎨 GitHub 智能代码增量合并

采用 **GitHub Sync V2** 标准。

完整支持：

```text
poster-list
hero-list
collection-list
```

核心特性：

* 勾选模块 → 自动更新 / 追加
* 取消勾选 → 自动安全移除
* 保留 GitHub 中其他原生 Block
* 保留自定义函数
* 保留自定义 TypeScript 类型
* 不覆盖用户手写代码
* 自动进行语法清洗
* 自动检查括号平衡
* 自动递增版本号

目标是只修改 EPlayerX DataHub 管理的代码区域，不破坏其他自定义内容。

---

### 📱 iOS / iPad 协议级防强缓存

针对 EPlayerX iOS / iPad / Web 客户端的首页缓存问题进行处理。

每次 GitHub 同步后自动递增：

```ts
HOME_CONFIG_V2_VERSION
```

同时 Worker 网络层：

* 剥离 ETag
* 注入 `no-cache`
* 防止旧配置长期驻留
* 强制客户端重新获取最新配置

从而尽可能避免 WKWebView 硬盘缓存导致首页配置无法及时更新。

---

### 🤖 Telegram 双向控制

绑定 Telegram Bot 后，可以直接通过 Telegram 控制同步任务。

例如：

```text
/sync
```

机器人会返回交互式菜单。

同步完成后自动推送：

* 成功数量
* 失败数量
* 更新分类
* 影视资产汇总
* 执行结果

---

# 🏗️ 系统架构

```text
┌──────────────────────────────────────────────┐
│                  数据源                      │
│                                              │
│ TMDB / MDBList / OMDb / 豆瓣 / Bangumi / Trakt│
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│            Cloudflare Workers                │
│                                              │
│  ├─ 数据抓取                                 │
│  ├─ 数据清洗                                 │
│  ├─ 评分聚合                                 │
│  ├─ 图片处理                                 │
│  ├─ 黑名单管理                               │
│  ├─ 定时任务                                 │
│  ├─ Telegram Bot                             │
│  └─ GitHub 增量同步                          │
└───────────────┬────────────────┬─────────────┘
                │                │
                ▼                ▼
       ┌────────────────┐  ┌──────────────────┐
       │ Cloudflare R2  │  │    GitHub API    │
       │                │  │                  │
       │ JSON 数据存储  │  │ config.ts 更新   │
       └────────────────┘  └────────┬─────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │ EPlayerX 客户端  │
                           │ iOS / iPad / Web  │
                           └──────────────────┘
```

---

# 🔑 环境变量

进入：

**Cloudflare Worker → Settings → Variables and Secrets**

配置以下变量。

| 变量                  |  必填 | 类型     | 说明                            |
| ------------------- | :-: | ------ | ----------------------------- |
| `ADMIN_SECRET`      |  ✅  | Secret | 后台登录密码及 API 鉴权密钥              |
| `WORKER_URL`        |  ✅  | Text   | Worker 完整访问地址                 |
| `GITHUB_REPO`       |  ✅  | Text   | GitHub 仓库，格式：`用户名/仓库名`        |
| `GITHUB_PATH`       |  ✅  | Text   | `config.ts` 在仓库中的路径           |
| `GITHUB_TOKEN`      |  ✅  | Secret | GitHub Personal Access Token  |
| `TMDB_ACCESS_TOKEN` |  ✅  | Secret | TMDB API v4 Read Access Token |
| `MDBLIST_API_KEY`   |  ❌  | Secret | MDBList API Key，支持多个 Key      |
| `OMDB_API_KEY`      |  ❌  | Secret | OMDb API Key                  |
| `TRAKT_CLIENT_ID`   |  ❌  | Text   | Trakt Client ID               |
| `TG_BOT_TOKEN`      |  ❌  | Secret | Telegram Bot Token            |
| `TG_CHAT_ID`        |  ❌  | Text   | Telegram Chat ID              |

### 配置示例

```text
ADMIN_SECRET=your_admin_password

WORKER_URL=https://homepage.your-domain.com

GITHUB_REPO=your_username/your_repo

GITHUB_PATH=src/config/config.ts

GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

TMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9...

MDBLIST_API_KEY=key1,key2,key3

OMDB_API_KEY=your_omdb_key

TRAKT_CLIENT_ID=your_trakt_client_id

TG_BOT_TOKEN=123456789:ABCxxxxxxxxxxxx

TG_CHAT_ID=123456789
```

> ⚠️ `GITHUB_TOKEN`、`TMDB_ACCESS_TOKEN`、`MDBLIST_API_KEY`、`TG_BOT_TOKEN` 等敏感信息必须使用 **Secret**，不要直接写入 Worker 源代码或提交到 GitHub。

---

# 📖 API Key 获取教程

## 1. GitHub Token

登录 GitHub：

[GitHub](https://github.com/?utm_source=chatgpt.com)

进入：

```text
Settings
→ Developer settings
→ Personal access tokens
→ Tokens (classic)
→ Generate new token
→ Generate new token (classic)
```

建议：

```text
Note:
EPlayerX-CMS
```

权限至少需要：

```text
repo
```

生成后立即复制 Token。

> ⚠️ GitHub Token 通常只会完整显示一次，请妥善保存。

---

## 2. TMDB Access Token

进入：

[TMDB](https://www.themoviedb.org/?utm_source=chatgpt.com)

登录后：

```text
头像
→ Settings
→ API
→ API Read Access Token
```

复制类似以下格式的 Token：

```text
eyJhbGciOiJIUzI1NiJ9...
```

---

## 3. MDBList API Key

进入：

[MDBList](https://mdblist.com/?utm_source=chatgpt.com)

登录后进入：

```text
Preferences
```

找到 API Key。

### 多 Key 配置

多个 Key 使用英文逗号分隔：

```text
key_1,key_2,key_3
```

系统默认使用第一个 Key。

当前 Key 发生限流后自动切换：

```text
Key 1
  ↓
429 / 401 / 配额耗尽
  ↓
Key 2
  ↓
429 / 401 / 配额耗尽
  ↓
Key 3
```

---

## 4. OMDb API Key

进入：

[OMDb API](https://www.omdbapi.com/apikey.aspx?utm_source=chatgpt.com)

选择：

```text
FREE
```

填写邮箱后获取 API Key。

---

## 5. Trakt Client ID

进入：

[Trakt](https://trakt.tv/?utm_source=chatgpt.com)

然后进入：

[Trakt API Applications](https://trakt.tv/oauth/applications?utm_source=chatgpt.com)

创建 Application：

```text
Name:
EPlayerX

Redirect uri:
urn:ietf:wg:oauth:2.0:oob
```

保存后即可获取：

```text
Client ID
```

---

## 6. Telegram Bot

### 获取 Bot Token

在 Telegram 搜索：

```text
@BotFather
```

发送：

```text
/newbot
```

按照提示创建机器人。

最终获得：

```text
123456789:ABCxxxxxxxxxxxx
```

---

### 获取 Chat ID

在 Telegram 搜索：

```text
@userinfobot
```

发送：

```text
/start
```

即可获取数字格式的 Chat ID：

```text
123456789
```

---

# 🚀 部署指南

## 第一步：创建 Cloudflare R2 Bucket

登录：

[Cloudflare Dashboard](https://dash.cloudflare.com/?utm_source=chatgpt.com)

进入：

```text
R2
→ Create Bucket
```

例如创建：

```text
eplayerx-data
```

名称可以自行修改。

---

## 第二步：绑定 R2

进入 Worker：

```text
Worker
→ Settings
→ Bindings
→ Add binding
```

选择：

```text
R2 Bucket
```

配置：

```text
Variable name:
R2_BUCKET

R2 Bucket:
eplayerx-data
```

保存。

> ⚠️ Worker 代码使用的绑定变量名称必须是 `R2_BUCKET`。

---

## 第三步：部署 Worker

进入 Worker 的代码编辑页面：

```text
Edit Code
```

将项目 Worker 代码完整复制到：

```text
worker.js
```

然后：

```text
Deploy
```

---

## 第四步：配置环境变量

进入：

```text
Settings
→ Variables and Secrets
```

按照环境变量表配置。

至少需要：

```text
ADMIN_SECRET
WORKER_URL
GITHUB_REPO
GITHUB_PATH
GITHUB_TOKEN
TMDB_ACCESS_TOKEN
```

如果需要对应功能，再配置：

```text
MDBLIST_API_KEY
OMDB_API_KEY
TRAKT_CLIENT_ID
TG_BOT_TOKEN
TG_CHAT_ID
```

最后点击：

```text
Save and Deploy
```

---

## 第五步：绑定自定义域名

进入：

```text
Settings
→ Domains & Routes
→ Add
→ Custom Domain
```

例如：

```text
homepage.your-domain.com
```

绑定完成后，确保：

```text
WORKER_URL
```

与实际 Worker 地址完全一致：

```text
https://homepage.your-domain.com
```

---

# 🎮 控制台使用指南

## 1. 管理员登录

打开：

```text
https://your-worker-domain.com
```

输入：

```text
ADMIN_SECRET
```

进入管理控制台。

---

## 2. LED 状态控制

### 🗓️ 周期

设置自动同步周期：

```text
每 1 天
每 2 天
每 3 天
...
每 7 天
```

### ⏰ 时间

选择每天执行的整点：

```text
00:00
01:00
02:00
...
23:00
```

### 🚀 立即测

立即执行完整同步。

不受当前设置的周期限制。

适合：

* 首次部署测试
* 修改配置后测试
* 手动强制更新

### ⏸ 暂停

暂停后台自动同步。

再次点击即可恢复。

---

# 🎯 评分、图标与简介处理

勾选需要处理的影片后，点击：

```text
🎯 提取评分/图标/去简介
```

系统会自动：

```text
IMDb
├─ 评分
│
Trakt
├─ 评分
│
Rotten Tomatoes
├─ 评分
│
TMDB
├─ Logo
├─ 剧照
├─ 海报
└─ 分级
```

同时：

```text
删除 overview
保留 genre_ids
```

从而减少 JSON 数据体积，同时保证题材分类正常使用。

---

# 🛡️ 数据同步与黑名单

## 单榜同步

可以单独同步某一个分类。

例如：

```text
国产追剧
```

只更新该分类。

---

## 批量同步

勾选多个分类后，可以一次性执行：

```text
动漫新番
国产追剧
国漫追番
韩剧周更
日剧周更
日剧周更
东南亚剧周更
```

---

## 🗑️ 从列表移除

点击：

```text
🗑️
```

只会将影片从当前列表移除。

下一次全量同步时，如果数据源仍然包含该影片，它可能再次出现。

---

## 🛡️ 加入黑名单

点击：

```text
🛡️
```

影片会加入当前分类黑名单。

之后该分类自动同步时：

```text
数据源
  ↓
发现影片
  ↓
检查黑名单
  ↓
命中
  ↓
跳过
```

不会影响其他分类。

---

# 🖼️ 五维图片管理

每个影视卡片下方提供图片选择器。

### `轮播`

用于：

```text
精选卡片
大轮播
```

推荐选择：

```text
纯净无字竖版海报
```

### `剧照`

用于：

```text
横版背景
Hero 背景
带字剧照
```

### `竖`

用于：

```text
普通列表卡片
poster-list
```

选择官方艺术字正标海报。

### `标`

用于：

```text
透明 Logo
标题 Logo
```

如果没有合适 Logo，可以使用：

```text
纯白 SVG 文字标
```

---

# 🎨 排版与 GitHub 智能同步

进入：

```text
🎨 排版与智能同步
```

左侧可以调整模块顺序。

支持拖拽：

```text
☰
```

上下移动模块。

右侧可以选择模块类型：

```text
poster-list
hero-list
collection-list
```

---

## GitHub 增量同步

点击：

```text
智能同步推送至 GitHub
```

Worker 会自动：

1. 获取 GitHub 当前 `config.ts`
2. 分析现有代码结构
3. 定位 EPlayerX V2 模块
4. 根据当前控制台配置生成新模块
5. 合并到原始代码
6. 保留其他原生 Block
7. 保留自定义函数
8. 保留自定义类型
9. 清理异常语法
10. 检查括号平衡
11. 自动递增 `HOME_CONFIG_V2_VERSION`
12. 提交到 GitHub

---

# 🔄 数据同步流程

完整同步流程：

```text
        ┌─────────────┐
        │   定时触发   │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │ 获取影视排期 │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │ 分类 / 黑名单 │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │ TMDB 数据抓取 │
        └──────┬──────┘
               │
               ▼
      ┌──────────────────┐
      │ MDBList / OMDb    │
      │ Trakt 评分补全    │
      └────────┬─────────┘
               │
               ▼
        ┌─────────────┐
        │ 图片 / Logo  │
        │ 分级 / 类型  │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │ 数据清洗压缩 │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │ Cloudflare R2│
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │ GitHub Sync  │
        └──────┬──────┘
               │
               ▼
        ┌─────────────┐
        │ config.ts    │
        │ 增量更新     │
        └─────────────┘
```

---

# 📱 iOS / iPad 缓存刷新机制

每次成功同步后：

```text
HOME_CONFIG_V2_VERSION
```

自动递增：

```text
100
↓
101
↓
102
↓
103
```

同时 Worker 响应层处理：

```text
ETag
no-cache
Cache-Control
```

避免客户端继续使用旧数据。

### 如果客户端仍然没有更新

确认：

1. GitHub Actions 已成功
2. Vercel / Cloudflare 构建已完成
3. `config.ts` 已经更新
4. `HOME_CONFIG_V2_VERSION` 已递增
5. 完全退出 EPlayerX App
6. 重新打开 App

> iOS / iPad 客户端可能需要彻底冷启动后才能重新加载最新首页配置。

---

# 🤖 Telegram 控制

配置：

```text
TG_BOT_TOKEN
TG_CHAT_ID
```

后，可以通过 Telegram 触发同步。

发送：

```text
/sync
```

机器人返回可操作菜单。

同步过程中可以查看：

```text
当前分类
当前任务
执行进度
成功数量
失败数量
```

同步完成后自动发送结果汇总。

---

# ❓ FAQ

## Q1：为什么 GitHub 推送成功，iOS 首页却没有马上变化？

EPlayerX 客户端会缓存首页布局。

DataHub 每次同步都会自动递增：

```text
HOME_CONFIG_V2_VERSION
```

同时 Worker 会处理 HTTP 缓存。

首先确认：

```text
GitHub Actions → Success
```

以及：

```text
Vercel / Cloudflare → 部署成功
```

然后彻底退出 EPlayerX App，再重新打开。

---

## Q2：MDBList 免费额度用完怎么办？

配置多个 API Key：

```text
key1,key2,key3
```

系统会按照：

```text
Key 1
↓
Key 2
↓
Key 3
```

自动顺延。

---

## Q3：GitHub `config.ts` 推送后出现格式异常怎么办？

DataHub 内置代码安全处理机制，包括：

* 括号平衡检查
* 代码结构识别
* 全局语法清洗
* 异常逗号清理
* 模块增量合并

正常情况下只修改 DataHub 管理的模块，不会覆盖 GitHub 中其他自定义代码。

---

## Q4：必须配置所有 API Key 吗？

不需要。

最基础运行只需要：

```text
ADMIN_SECRET
WORKER_URL
GITHUB_REPO
GITHUB_PATH
GITHUB_TOKEN
TMDB_ACCESS_TOKEN
```

以下属于增强功能：

```text
MDBLIST_API_KEY
OMDB_API_KEY
TRAKT_CLIENT_ID
TG_BOT_TOKEN
TG_CHAT_ID
```

---

## Q5：R2 Bucket 名称必须叫 `eplayerx-data` 吗？

不必须。

Bucket 名称可以自定义。

但 Worker Binding 的变量名称必须保持：

```text
R2_BUCKET
```

---

# 📁 推荐项目结构

```text
EPlayerX-DataHub/
│
├── worker.js
├── README.md
├── LICENSE
│
└── docs/
    ├── deployment.md
    └── api.md
```

如果项目只有一个 Worker，也可以直接保持：

```text
worker.js
README.md
LICENSE
```

---

# 🔐 安全注意事项

请勿将以下内容直接提交到 GitHub：

```text
GITHUB_TOKEN
TMDB_ACCESS_TOKEN
MDBLIST_API_KEY
OMDB_API_KEY
TG_BOT_TOKEN
ADMIN_SECRET
```

推荐使用 Cloudflare：

```text
Settings
→ Variables and Secrets
→ Secrets
```

保存。

尤其不要在：

* GitHub README
* Worker 源代码
* 截图
* Telegram 消息
* Issue
* Commit

中公开 API Token。

---

# 📄 License

本项目基于 **MIT License** 开源。

底层首页设计规范参考：

[6otho/eplayerx-homepage](https://github.com/6otho/eplayerx-homepage?utm_source=chatgpt.com)

感谢原项目提供的 EPlayerX 首页设计规范与基础结构。

---

## ⭐ EPlayerX DataHub

```text
Cloudflare Workers
        +
Cloudflare R2
        +
GitHub API
        +
TMDB / MDBList / Trakt / OMDb
        +
Telegram Bot
        ↓
EPlayerX DataHub
        ↓
全自动影视数据同步
        ↓
EPlayerX 首页智能更新
```

**一次部署，自动运行。**
