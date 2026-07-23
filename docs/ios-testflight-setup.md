# iOS / TestFlight 打包指南（GitHub Actions + macOS）

本项目是 Capacitor 6 应用。iOS 的 `.ipa` 只能在 **macOS + Xcode** 上打包，因此我们用 **GitHub Actions 的 macOS runner** 来构建。工作流文件：`.github/workflows/ios-testflight.yml`。

- **兼容机型**：Deployment Target = **iOS 13.0**，覆盖 **iPhone X（iPhone 10）及以后**的所有机型。
- **Bundle ID**：`com.jeeducation.app`（来自 `capacitor.config.json`）。
- **App 名称**：JE Education。

---

## 两种模式（工作流自动切换）

| 模式 | 触发条件 | 结果 | 费用 |
|---|---|---|---|
| **未签名编译检查** | 未设置签名 Secrets | 仅验证 iOS 工程能否编译通过 | 免费 |
| **签名 + TestFlight** | 设置了 4 个签名 Secrets | 打出 `.ipa` 并上传到 TestFlight | 需 $99/年 Apple 账号 |

> **费用说明**：本仓库是**公开仓库**，GitHub Actions（含 macOS runner）**完全免费、无限分钟**。工作流仍然只在**手动触发或打 `v*` tag** 时运行，一是保持构建记录清晰，二是只有这两种触发方式能拿到签名 Secrets（**来自 fork 的 PR 永远拿不到**）。

> **公开仓库的安全须知**：`.env.*` 里的 `VITE_*` 变量本来就会被编译进前端 bundle 并公开部署，所以不算密钥。真正的密钥（Apple API Key 等）只放在 **GitHub Secrets**，不会出现在代码或日志里。**切勿**把 `.p8` / `.p12` / 描述文件提交进仓库（`.gitignore` 已拦截）。

---

## 第一步：把源码推到 GitHub（现在就能做）

当前源码仓库还没有远程地址。TestFlight 构建必须在**包含源码**的仓库里跑（不是现有的 `dist` 专用仓库）。

在 GitHub 新建一个**私有仓库**（例如 `jeeducation-mobile-app`），然后在 `D:\Web\JEEducation.App` 执行：

```bash
git remote add origin git@github.com:borllor/jeeducation-mobile-app.git
git add -A
git commit -m "Add iOS TestFlight workflow"
git push -u origin main
```

推送后，去仓库的 **Actions** 标签页，手动运行 “iOS build / TestFlight” → 这时会跑**未签名编译检查**，验证 iOS 工程没问题（0 成本）。

---

## 第二步：注册 Apple Developer Program（$99/年）

TestFlight 属于 App Store Connect，**必须**加入付费的 Apple 开发者计划才能使用：

1. 打开 <https://developer.apple.com/programs/enroll/>，用你的 Apple ID 加入（个人或公司，$99/年）。
2. 审核通过后（个人通常几小时～1天），登录 <https://appstoreconnect.apple.com>。
3. 在 **App Store Connect → App → 新建 App**：
   - 平台：iOS
   - Bundle ID：选 `com.jeeducation.app`（若列表没有，先去 developer.apple.com → Certificates, IDs & Profiles → Identifiers 注册这个 Bundle ID）
   - SKU：任意唯一字符串，例如 `jeeducation-app`

---

## 第三步：创建 App Store Connect API 密钥

用 API 密钥可以让 GitHub Actions **自动签名并上传**，无需手动导出证书。

1. App Store Connect → **Users and Access → Integrations → App Store Connect API**。
2. 点 **+** 生成密钥，Access 选 **App Manager**（或更高）。
3. 记录：
   - **Key ID**（如 `ABCD1234EF`）
   - **Issuer ID**（页面顶部的 UUID）
   - 下载 **`AuthKey_XXXXXXXXXX.p8`** 文件（**只能下载一次，务必保存**）
4. 记录你的 **Team ID**：developer.apple.com → Membership → Team ID（10 位，如 `9ABCDE1234`）。

---

## 第四步：在 GitHub 仓库设置 Secrets

仓库 → **Settings → Secrets and variables → Actions → New repository secret**，新建这 4 个：

| Secret 名称 | 值 |
|---|---|
| `APPSTORE_API_KEY_ID` | 上面的 Key ID |
| `APPSTORE_API_ISSUER_ID` | 上面的 Issuer ID |
| `APPSTORE_API_PRIVATE_KEY` | 把 `AuthKey_XXXX.p8` 文件用文本编辑器打开，**整段内容**（含 `-----BEGIN PRIVATE KEY-----` 到 `-----END PRIVATE KEY-----`）粘贴进去 |
| `APPLE_TEAM_ID` | 你的 10 位 Team ID |

设好后，工作流的 `HAS_SIGNING` 会自动变为 `true`，下次运行就会走**签名 + TestFlight** 路径。

---

## 第五步：打一个 TestFlight 构建

两种触发方式任选：

- **手动**：仓库 Actions → “iOS build / TestFlight” → Run workflow。
- **打 tag**：
  ```bash
  git tag v1.0.0
  git push origin v1.0.0
  ```

构建成功后：
1. 工作流会把 `.ipa` 上传到 App Store Connect / TestFlight。
2. 到 App Store Connect → 你的 App → **TestFlight** 标签页，等待处理（几分钟到半小时）。
3. 首次可能要求填写**出口合规（Export Compliance）**信息。
4. 在 **TestFlight → Internal Testing** 里把你自己的 Apple ID 加为**内部测试员**。
5. iPhone 上安装 **TestFlight** App（App Store 免费下载），用同一 Apple ID 登录，即可安装本 App 测试。

> 内部测试员（最多 100 人、需属于你的团队）无需 App 审核，上传后很快可测。外部测试则需要一次轻量的 Beta 审核。

---

## 版本号说明

- **Marketing 版本**（用户可见，如 `1.0.0`）：在工作流 `env.MARKETING_VERSION` 里改。
- **Build 号**：自动用 GitHub 的 `run_number`，保证每次上传都递增（TestFlight 要求 build 号唯一且递增）。

---

## 常见问题

- **“No suitable application records were found”**：说明还没在 App Store Connect 里用 `com.jeeducation.app` 建 App（见第二步）。
- **签名失败 / 找不到 Profile**：确认 API 密钥角色至少是 App Manager，且 Bundle ID 已在 Identifiers 里注册；工作流用了 `-allowProvisioningUpdates`，会自动创建所需的证书和描述文件。
- **想先在本机 Mac 上跑**：`npm run build && npx cap add ios && npx cap open ios`，在 Xcode 里选你的 Team 直接 Archive 也可以。
