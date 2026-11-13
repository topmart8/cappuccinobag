# Cappuccino PR50 本机接续验收 — 2026-11-02

发布结论：HOLD，保持当前正式站。数据库拒绝访问，真实 CRM、附件、通知及内部收件均未验收；另有已上线版本同样存在的 Padel 原图缺失。以下本地模拟通过不等于真实接收通过。

## 当前版本与接续边界

- 实际源码目录：`D:\独立站资料\cappuccinobag-pr50`。这是现有仓库的独立 Git worktree，没有新建网站或初始化替代项目。
- 分支：`codex/b2b-growth-review-20261027`，沿用 [PR50](https://github.com/topmart8/cappuccinobag/pull/50)。
- 接手远端候选：`6d444a6c7a9da89558269bea3c9dd94fe4828bf7`。
- 最新 main / 当前正式站：`10f21a8f2c8031f7453a1cc5fe205b87e93fd7c1`，包含 PR57 Golf；部署 `dpl_2nk6ep1XBfqPPQLVk8R53BAx2eGY`，READY。
- 本地合入该 main 的提交：`2959754d2165c430254a4399a1ca09f07d6833cc`，无文本冲突。
- 本轮实际测试及构建的代码提交：`b4013fd7cef6b09572c58f4943e8739c55992636`。后续验收报告提交只增加文档，不改变已验收应用代码。
- 构建 ID：`_akxf_GdJlVVdz57Y77d7`。Next.js 实际安装、package.json 与锁文件均为 `16.3.0`；Node `24.22.2`、npm `11.19.1`。
- 原预览 `dpl_ALLUJ7ffzyS2aMcBzPgd7jkd7LXf` 属于旧候选 `6d444a6`。浏览器入口要求 Vercel 登录；未创建分享链接、关闭保护或把登录页 HTTP 200 当作网站验收。
- 已读取用户补充的 `D:\Downloads\Cappuccino_Six_Site_Unified_Execution_V3_20261101.md`，重点核对 §5.1。文件 SHA256：`F2A4D210D732EF8407601874740C3982F14F600DA1349C71DFE950614F65680E`。其中 SHA、测试数和授权记录按历史记录处理，没有覆盖当前代码。

## 实际改动与保存

除同步当前 main 的 Golf 变更外，只改了三个测试文件：

| 文件 | 改动原因 |
| --- | --- |
| `tests/golf-inquiry.test.mjs` | 不再用 PR50 已移除的 `showToast` 函数定位预填函数结尾；兼容 CRLF |
| `tests/homepage-rfq.test.mjs` | 读取文本时归一化 CRLF，避免 Windows 检出导致假失败 |
| `tests/release-recovery-boundaries.test.mjs` | 对当前检出文本归一化换行，保持原首页结构断言 |

没有重新设计首页、改动 Padel URL/标题、重写原获客内容或替换询盘入口。当前 main 的 Golf 子目录、导航、sitemap、产品链接和询盘预填均保留。MOQ 300 pcs per style 保留；现有条款允许低于标准 MOQ 的特殊提案进入人工评审，不代表订单或价格自动获准。

原 `cappuccino-padel-sprint` 的 17 项跟踪改动和 `cappuccinobag-site05-review` 的 15 项跟踪改动均保留，本任务没有编辑这些源文件。原备份未删除。没有 hard reset、强推或覆盖其他站。

PR56 head `7eddc4b4a9bca7c64fd7c4ef3cc946076d9cc6e3` 的共享文件为 `app/static-site.js`、`public/llms.txt`、`public/site/assets/script.js`。做过只读三方合并模拟，无文本冲突；未合并 PR56，文本无冲突不代表其全部业务验收完成。

后续发现另一项本机任务“核对三站项目基线与交接状态”也在接续。已发送明确的写入范围协调：本任务处理主站 PR50，该任务继续 PAVUKO；本任务不改 PAVUKO 源码，也不发布 Novlane/Eyewear。

## 命令与结果

| 命令 / 检查 | 当前结果 |
| --- | --- |
| `node --version` / `npm --version` / `npm ls next` | 24.22.2 / 11.19.1 / 16.3.0 |
| `node --import <no-network.mjs> --test tests/*.test.mjs` | 237/237 PASS，无未测脚本冒充通过 |
| `npm run lint` | PASS，`--max-warnings=0` |
| `npm run typecheck` | PASS；此脚本实际为 `next typegen`，不冒充独立 TypeScript 编译检查 |
| `npm run build -- --webpack` | PASS，正常生成 226/226 页，无字体或代码替代夹具 |
| `git diff --check` | PASS |
| 浏览器渲染 | 9 个主要路由 × 1440/360/390/430 = 36 个场景；四个缺图报告均指向同一旧素材 |
| 隔离表单与导航 | 27 组场景 PASS，100 次请求全部被模拟拦截，零真实提交 |
| 内链 | 9 页中抽出的 49 个唯一内部路径，GET 全部可达 |
| sitemap | 本地及正式站各 181 个 URL，无重复/非规范主机，均含 Golf |

初始跨盘 `node_modules` junction 导致 Windows webpack 路径和 SWC 绑定错误；已保留该 junction 并复制锁文件一致的现有依赖到本 worktree，未重复 npm 安装，也未改动原依赖目录。最终构建使用普通本地依赖，无 `--preserve-symlinks` 特例。复制记录为 21,416 文件、402.64 MB、0 失败。锁文件 SHA256：`3BA005B59A5DE2AD1CE12C868085E58DDAF70DF5027F6213F905F1BF76C2CE82`。

首次浏览器脚本误把“低于 MOQ 的人工评审提案”当作必须阻断的输入，已按现有明确条款纠正验收并完整复测；未为满足脚本改写业务规则。最初截图遇到 smooth-scroll 尚未结束，已用立即滚动并等待回到顶部刷新截图，避免把截图时的固定导航位置误判为实际遮挡。

## 浏览器范围和证据

检查路由：首页、Padel collection、Padel manufacturer、racket comparison、PDB001 产品页、原 OEM/ODM 页面、原 `/inquiry`、Golf、catalog。

原询盘和 Concept development / Tech Pack / Clubs-events / Existing-customer reorder 四种 Brief 在四种视口均验证：必填、邮箱格式、300 件条款及特殊提案人工评审、合法类型小附件、4 MB 超限、无效 JSON、错误回执编号、503 后保留输入及附件、重试复用编号、快速重复点击只发一次请求、通知异常时显示“已保存/需要复查”而不宣称邮件送达。产品型号/颜色预填、原 `/inquiry` 链接和三个手机宽度的 Padel 菜单 RFQ 跳转均通过。

所有写请求在浏览器中被隔离，后端测试使用显式 mock，服务器启动前清除 CRM/邮件/AI 相关环境变量。没有真实 CRM 写入、真实附件上传、内部/客户邮件或 WhatsApp 发送，也没有输出凭据。

证据目录：`C:\Users\Administrator\.codex\visualizations\2026\10\29\01a187f0-9dfc-7803-93c8-a77a35bda3bb\cappuccino-pr50-20261102`。

- `checks.json`、`tests.log`、`lint.log`、`typegen.log`、`build.log`
- `browser-results.json`、`internal-links.json`、`metadata-final.json`
- `1440-home.png`、`390-home.png`、`390-inquiry.png`、`390-golf-bags.png`、`390-padel-work-tote-backpack-pdb001.png`
- `390-brief-mock-notification-review.png`（只展示模拟回执）
- `public-and-brand.json`、`production-390-home.png`、`pavuko-1440-home.png`、`pavuko-390-home.png`

正式站无登录 GET 已核对首页、Golf、Padel collection 和原询盘，均 200，canonical 正确，允许索引。候选本机预览有 `X-Robots-Tag: noindex, nofollow, noarchive`，robots 阻止抓取。JSON-LD 可解析，所查页面各一个 H1，没有横向溢出。

性能为本机和公开站的单次、未节流诊断：首次正式站手机首页 LCP 约 8.69 s / CLS 0.0283；同次 Golf/Padel/询盘 LCP 约 1.51/2.41/1.97 s、CLS 0。初次本地首页桌面/手机约 2.25/0.73 s。采样受到本机负载、网络和缓存影响，未宣称 Core Web Vitals 达标、未测真实 INP/现场用户数据，也没有用此证明受保护候选的线上性能。

PAVUKO 仅做只读品牌检查：页眉/页脚 PAVUKO 字标、P 图标及元数据名称一致，未重新设计 Logo。截图拍摄时仍为 noindex 演示状态。另一任务随后改为明确邮件草稿模式，这些较早截图不证明其新版本发布就绪，新版本验收归该任务。

## 未通过、未执行与下一步

1. **数据库权限阻塞**：`cepsbgvvalcjkfnmynkw` 只读访问返回 permission denied，已停止该路径。没有换库、改 RLS、绕过权限或新增凭据。同编号 CRM 记录、附件对象、通知状态和实际内部收件均为“待验收”。须在合法访问恢复后按原副作用边界补证，不向真实客户发测试。
2. **原素材缺失**：`/assets/cappuccino-original-padel-technical-bag-v1.png` 在本地和现网均 404；当前 main 和候选都引用它，Git 历史未找到该文件。[PR53](https://github.com/topmart8/cappuccinobag/pull/53) 已记录相同旧问题。需要补回获准原图，不能拿其他产品图冒充原概念图。本轮未删除或篡改引用。
3. **其他未验证项**：受保护候选的在线浏览器、真实 CRM/邮件/附件、正式用户性能、物理手机/Safari；历史 HEVC 视频兼容问题不在本轮表单验收中，未虚报修复。
4. **发布未执行**：PR50 未转 ready，未合并，未生产部署；未批量合并其他 PR。Novlane 和 Eyewear 的未交付补丁没有猜造或重做。

剩余发布条件满足后，继续沿用原主站条件授权；发布前重新读 main、PR head、并发写入及当前生产版本，再按仓库保护规则 ready/merge/deploy，不代做审批。发布后做无登录回归。

## 预览与回退

本机主站预览：`http://127.0.0.1:3101/`，绑定本 worktree，保持运行。重启（PowerShell）：

```powershell
Set-Location 'D:\独立站资料\cappuccinobag-pr50'
$env:VERCEL_ENV = 'preview'
npm.cmd run start -- --hostname 127.0.0.1 --port 3101
```

该本地验收工作区没有生产环境文件；不要为复测添加生产凭据或提交真实询盘。当前运行记录及隔离启动脚本保存在证据目录 `cappuccino-server.json`、`start-previews.mjs`。

首选回退基线必须保留已上线 Golf：`10f21a8f2c8031f7453a1cc5fe205b87e93fd7c1` / `dpl_2nk6ep1XBfqPPQLVk8R53BAx2eGY`。旧 `6f2ccccb27eb53a94d1ca025429b3e3676a9b3c8` / `dpl_AAgfFdaMwuUgyzaAbqNXsmjj2Djq` 只作历史次级记录，不能无说明退回并丢失 Golf。当前无生产变更，所以本轮无需执行回退；未来仅在本次发布导致严重回归且核对无较新生产修改后，按已有安全回退授权使用记录版本。
