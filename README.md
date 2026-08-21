```markdown
# 🚀 EPlayerX 数据总控中枢 & 首页 CMS (EPlayerX DataHub)

> **全自动化、零维护、防强缓存的 EPlayerX 播放器云端数据大盘与首页配置调度中枢。**  
> 基于 **Cloudflare Workers + Cloudflare R2 + GitHub API** 构建，支持 6 大追剧周更表自动分发、TMDB/MDBList 多源数据脱水抓取、Telegram 机器人双向控制、**1~7天智能自由调度**，以及 **GitHub `config.ts` 智能代码增量合并 (V2 标准)**。

---

## ✨ 核心特性

- 📅 **六大追剧周更表合集**：内置 **动漫新番**、**国产追剧**、**国漫追番**、**韩剧周更**、**日剧周更**、**东南亚剧周更** 6 大按星期归类的动态合集。
- 📊 **四大权威评分与精准分级体系**：
  - 支持聚合 **TMDB、IMDb、Trakt、烂番茄 (Rotten Tomatoes)** 四大平台评分；
  - 自动提取中港台/欧美影视内容分级（如 `限`、`辅15`、`辅12`、`护`、`普`、`III`、`TV-MA`、`R` 等）。
- 🔑 **MDBList 多 API Key 自动顺延熔断**：
  - 环境变量支持填入多个 MDBList Key（以逗号隔开）；
  - 单号用满 1000 次触发限流（429/401）时，**系统自动秒级切换至备用 Key** 继续工作，大批量同步不中断。
- 🎯 **一键提取评分/图标/清空简介**：
  - 定向对勾选影片提取高清透明 Logo、带字剧照与纯净无字图；
  - **自动彻底抹除剧情简介（`overview` 等长文本）**，保持数据轻量无污染；
  - **100% 智能保留并补齐题材分类（`genre_ids` 动作/剧情/科幻标签）**。
- ⏱️ **LED 控制台 1~7 天自定义周期调度**：
  - 实时 LED 动态监视屏，显示待命/同步状态、时钟与执行进度；
  - 支持自由设定 **每 1~7 天间隔** 以及 **每日 00:00~23:00** 自动全量抓取；
  - 支持一键测试（`🚀 立即测`）与后台暂停/恢复（`⏸ 暂停`）。
- 🛡️ **分类隔离黑名单与资产库**：
  - 支持将指定影片加入“当前分类黑名单”，以后该分类拉取时自动跳过，绝不污染全局；
  - 支持可视化切换正标海报、纯净无字轮播海报、透明 Logo 与剧照背景。
- 🛠️ **定向入库引擎 (Direct Injection)**：支持直接输入名称/TMDB ID，或者直接粘贴包含“周一/星期一”的纯文本或 Excel 表格排期，智能识别一键入库。
- 🎨 **智能代码增量合并 (GitHub Sync - V2 标准)**：
  - 完美适配 V2 客户端标准（`poster-list` / `hero-list` / `collection-list`）；
  - 勾选模块自动更新/追加，取消勾选自动安全切除；
  - 100% 安全保护你在 GitHub 手写的其他原生 Block、自定义函数和类型。
- 📱 **iOS/iPad 协议级秒刷（反强缓存）**：
  - 自动递增 `HOME_CONFIG_V2_VERSION` 版本号，强制客户端清除本地旧布局缓存；
  - 协议层剥离 ETag 并注入 `no-cache` 头，彻底击穿 iOS 手机 WKWebView 硬盘强缓存。
- 🤖 **Telegram 机器人双向交互**：绑定 Telegram 机器人，发送 `/sync` 唤出多选菜单，全量同步完成后自动推送资产汇总明细。

---

## 🛠️ 架构说明

```
[ TMDB / MDBList / OMDb / 豆瓣 / Bangumi / Trakt ]
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

在 Cloudflare Worker 的 **Settings（设置） -> Variables and Secrets（变量和机密）** 中配置以下变量：

| 环境变量名称 | 是否必填 | 类型 | 说明与获取方式 | 示例值 |
| :--- | :---: | :--- | :--- | :--- |
| `ADMIN_SECRET` | **必填** | Secret | 后台控制台登录密码，以及 API 鉴权密钥（自定义设置）。 | `my_super_password_123` |
| `WORKER_URL` | **必填** | Text | 你的 Worker 自定义绑定域名或默认域名（用于生成图片与数据内链）。 | `https://homepage.eplayerx.cc.cd` |
| `GITHUB_REPO` | **必填** | Text | 你的 EPlayerX 首页代码仓库的路径（格式为 `用户名/仓库名`）。 | `6otho/eplayerx-homepage` |
| `GITHUB_PATH` | **必填** | Text | `config.ts` 在你的 GitHub 仓库中的相对路径。 | `src/config/config.ts` |
| `GITHUB_TOKEN` | **必填** | Secret | 用于推送代码到 GitHub 的 **Personal Access Token**。 | `ghp_xxxxxxxxxxxxxx` |
| `TMDB_ACCESS_TOKEN` | **必填** | Secret | TMDB API 读访问令牌（v4 Auth），用于抓取海报、剧照和 Logo。 | `eyJhbGciOiJIUzI1NiJ9...` |
| `MDBLIST_API_KEY` | 选填 | Secret | MDBList API Key（用于提取烂番茄/Trakt评分）。**支持多个 Key 用英文逗号 `,` 隔开实现自动顺延**。 | `key1_xxxx,key2_yyyy` |
| `OMDB_API_KEY` | 选填 | Secret | OMDb API Key（用于备用获取 IMDb 与烂番茄评分）。 | `a1b2c3d4` |
| `TRAKT_CLIENT_ID` | 选填 | Text | Trakt.tv API 客户端 ID（用于欧美剧集榜单抓取与评分备用）。 | `a1b2c3d4e5f6...` |
| `TG_BOT_TOKEN` | 选填 | Secret | Telegram 机器人的 Token（用于控制台交互与进度通知）。 | `123456789:ABCdefGhIJKlm...` |
| `TG_CHAT_ID` | 选填 | Text | 接收 Telegram 通知以及限制操作权限的你个人的 TG Chat ID。 | `987654321` |

---

## 📖 环境变量保姆级获取教程

### 1. 🔑 获取 `GITHUB_TOKEN`
1. 登录 GitHub，点击右上角头像 $\rightarrow$ **Settings**。
2. 滚动到左侧最底部，点击 **Developer settings** $\rightarrow$ **Personal access tokens** $\rightarrow$ **Tokens (classic)**。
3. 点击 **Generate new token** $\rightarrow$ **Generate new token (classic)**。
4. Note 填写 `EPlayerX-CMS`，Expiration 选择 `No expiration`（永不过期）。
5. 勾选 **`repo`** 权限（包含 `repo:status`, `repo_deployment`, `public_repo` 等全部子项）。
6. 点击最下方 **Generate token**，**立即复制生成的 `ghp_` 开头的字符串**（只显示一次！）。

### 2. 🎬 获取 `TMDB_ACCESS_TOKEN`
1. 打开 [TMDB 官网](https://www.themoviedb.org/) 并登录账号。
2. 点击右上角头像 $\rightarrow$ **账户设置 (Settings)** $\rightarrow$ 左侧菜单 **API**。
3. 在 API 页面中，找到 **API 读访问令牌 (v4 Auth)**（API Read Access Token）。
4. 复制那一长串以 `eyJhbGci...` 开头的超长密钥。

### 3. 🍅 获取与配置 `MDBLIST_API_KEY`（支持多 Key 自动故障顺延）
1. 注册并登录 [MDBList 官网](https://mdblist.com/)。
2. 进入个人中心 **Preferences**，复制你的 API Key。
3. **多账号配置技巧**：由于免费版每天限制 1000 次，你可以注册 2~3 个账号，在 Cloudflare 后台将多个 Key 用英文逗号 `,` 连接填入即可：
   ```text
   3abc123def456,7xyz789uvw012,9pqr345stu678
   ```
   系统会默认使用第 1 个 Key，一旦用完或触发限流（429 报错），**将自动无感顺延切换到下一个 Key**！

### 4. 🍿 获取 `OMDB_API_KEY`（选填）
1. 打开 [OMDb API 官网](https://www.omdbapi.com/apikey.aspx)。
2. 选择 **FREE**（每天 1000 次），输入邮箱即可收到专属 API Key。

### 5. 📺 获取 `TRAKT_CLIENT_ID`（选填）
1. 登录 [Trakt.tv](https://trakt.tv/)，打开 [Trakt API Applications](https://trakt.tv/oauth/applications)。
2. 点击 **NEW APPLICATION**，Name 填 `EPlayerX`，Redirect uri 填 `urn:ietf:wg:oauth:2.0:oob`。
3. 保存后即可复制生成的 **Client ID**。

### 6. 🤖 获取 `TG_BOT_TOKEN` 与 `TG_CHAT_ID`（选填）
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
2. 将项目代码复制并粘贴进入 `worker.js` 文件中。
3. 点击右上角 **Deploy（部署）**。

---

### 第三步：添加环境变量

1. 返回 Worker 项目设置页面，点击 **Settings** $\rightarrow$ **Variables and Secrets**。
2. 参照上方的《环境变量保姆级配置清单》，将 `ADMIN_SECRET`、`GITHUB_TOKEN`、`TMDB_ACCESS_TOKEN`、`MDBLIST_API_KEY` 等变量逐一填入。
3. 点击 **Save and Deploy（保存并部署）**。

---

### 第四步：绑定自定义域名（关键：解决 iOS 强缓存与域名硬编码）

1. 在 Worker 的 **Settings（设置）** $\rightarrow$ **Domains & Routes（域和路由）** 选项卡下，点击 **Add（添加）** $\rightarrow$ **Custom Domain（自定义域）**。
2. 输入你的域名（例如 `homepage.eplayerx.cc.cd`）。
3. 确保你的环境变量 `WORKER_URL` 的值与此域名完全一致：`https://homepage.eplayerx.cc.cd`。

---

## 🎮 控制台使用指南

### 1. 管理员登录与 LED 状态中枢
* 访问你的 Worker 域名，输入 `ADMIN_SECRET` 密码即可进入控制台。
* **LED 状态栏**：
  * `🗓️ 周期`：可自由切换 `每 1 天` 到 `每 7 天` 自动更新一次。
  * `⏰ 时间`：可选择每日在 `00:00` ~ `23:00` 哪一个整点启动。
  * `🚀 立即测`：立即全速跑完所有任务测试，不受天数限制。
  * `⏸ 暂停`：一键暂停/恢复后台自动轮询。

### 2. 评分提取与简介清空
* 勾选列表中的影片卡片（可多选），点击右上角 **`🎯 提取评分/图标/去简介`**：
  * 系统会自动提取该影片的烂番茄/Trakt/IMDb 评分、分级标签和 Logo；
  * **自动删除该条目的剧情简介字段**（保持列表精简，避免冗余大段文字）；
  * **完好保留动作/剧情等题材分类 (`genre_ids`)**。

### 3. 数据同步与分类隔离黑名单
* **单榜/批量同步**：支持单分类极速抓取或勾选多个榜单批量同步。
* **从列表移除 / 加入分类黑名单**：
  * 点击卡片上的红色垃圾桶：仅从当前大盘移除（下次全量同步可能会重新扫入）；
  * 点击卡片上的盾牌图标：**加入当前分类的黑名单**，后续后台自动同步时将永远跳过此片，且不影响其他分类收录。

### 4. 可视化多维选图器
卡片下方提供 4 组可视化按钮：
* **`轮播`**：手动指定用于精选卡片/大轮播的【纯净无字海报】；
* **`剧照`**：手动选择高清横版背景或带字剧照；
* **`竖`**：手动指定列表卡片专用的【官方艺术字正标海报】；
* **`标`**：手动选择或输入透明高清 Logo（也可放弃图片强制生成纯白 SVG 文字标）。

### 5. 排版与 GitHub 增量推送
1. 点击右上角 **`🎨 排版与智能同步`**。
2. 长按左侧 ☰ 上下拖动可调整前端卡片展示顺序，右侧下拉框可选择 `竖版海报 (poster-list)`、`精选大图 (hero-list)` 或 `新番日历合集 (collection-list)`。
3. 点击 **`智能同步推送至 GitHub`**，Worker 会全自动合并进 GitHub 仓库的 `config.ts`，并自动递增版本号！

---

## ❓ 常见问题排坑 (FAQ)

#### Q1：为什么推送成功后，手机 iOS 客户端里的合集没有立刻改变？
> **答**：EPlayerX 客户端会把首页布局保存在手机本地。后台在每次推送时会自动把 `HOME_CONFIG_V2_VERSION` 的版本号数值 `+1`。
> 确保 GitHub Actions / Vercel 的构建日志显示 **`Success`** 后，在手机上**将 EPlayerX App 上划退出后台彻底冷启动一次**，客户端检测到版本号增加，就会瞬间擦除旧缓存，展示最新布局！

#### Q2：MDBList 免费额度用完了怎么办？
> **答**：多注册一个 MDBList 账号，将获取的 Key 在环境变量 `MDBLIST_API_KEY` 中用英文逗号隔开填入（如 `key1,key2`）。系统在提取评分遇到限流时会自动无缝切换至下一个 Key。

#### Q3：推送后 GitHub 的 `config.ts` 打包报错或少逗号怎么办？
> **答**：本项目的后台内置了 **括号平衡算法** 与 **全局语法清洗引擎**，在提交给 GitHub 的最后一刻会自动剔除所有双逗号 `,,` 并补齐缺失的句尾逗号，保证生成的 TypeScript 语法 100% 绝对合法。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 许可证开源。特别感谢 [6otho/eplayerx-homepage](https://github.com/6otho/eplayerx-homepage) 项目提供的底层首页设计规范！
```
