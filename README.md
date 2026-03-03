# AI_Chat_outline 浏览器扩展

[![Star History Chart](https://api.star-history.com/svg?repos=Jeff-clouds/ChatNavigator&type=Date)](https://star-history.com/#Jeff-clouds/ChatNavigator&Date)

一个Chrome扩展，为AI对话平台自动生成大纲，支持快速导航和阅读位置定位。

## 功能特点

- 自动为AI对话生成大纲
- 支持多个AI对话平台
- 实时更新大纲内容
- 点击即可快速导航
- 智能阅读位置检测与高亮显示
- 阅读进度指示器

## 支持的网站

- DeepSeek Chat (`*.deepseek.com`)
- 腾讯元宝 AI (`*.yuanbao.tencent.com`)
- ChatGPT (`*.chatgpt.com`)
- Google Gemini (`*.gemini.google.com`)
- Grok (`*.grok.com`)
- 豆包 AI (`*.doubao.com`)
- Kimi (`*.kimi.com`)

## 📥 下载安装

### 方式一：应用商店安装（推荐）

- **Chrome 用户**：[前往 Chrome 应用商店下载](https://chromewebstore.google.com/detail/ai-chatnavigator/oaojjennjgmfnegjgnbikipnnddoiomg)
- **Edge 用户**：[前往 Edge 插件商店下载](https://microsoftedge.microsoft.com/addons/detail/ai-chatnavigator/nimemminahdhnacieiaejaohgkehcned)

### 方式二：手动安装（开发者模式）

如果您想体验最新开发版功能：

1. 克隆本项目到本地：
   ```bash
   git clone https://github.com/Jeff-clouds/ChatNavigator.git
   ```
2. 直接加载项目目录即可，无需额外构建步骤。

3. 打开 Chrome/Edge 浏览器，进入扩展管理页 (`chrome://extensions/` 或 `edge://extensions/`)。
4. 开启右上角的 **"开发者模式"**。
5. 点击 **"加载已解压的扩展程序"**，选择本项目文件夹。

## 使用方法

1. 点击扩展图标打开侧边栏
2. 在支持的页面上会自动生成大纲
3. 点击任意问题或标题可跳转到对应位置
4. 使用箭头按钮（▼/▶）展开/折叠答案部分

## 快捷键

- `Ctrl+Shift+O`：打开/关闭侧边栏
- `Alt+O`：展开/折叠所有大纲项
- `Alt+J`：跳转到下一个标题
- `Alt+K`：跳转到上一个标题

## 文件结构

```
├── manifest.json
├── README.md
├── ARCHITECTURE.md
├── CHANGELOG.md
├── privacy-policy.md
├── .gitignore
├── public/
│   └── assets/
│       ├── icon128.png
│       ├── icon48.png
│       ├── alipay.png
│       └── wechat-pay.jpg
├── src/
│   ├── config/
│   │   └── selectors.js
│   ├── core/
│   │   ├── background.js
│   │   ├── content.js
│   │   ├── pipeline.js
│   │   ├── sidepanel.html
│   │   └── sidepanel.js
│   └── utils/
│       └── common.js

```

## 开发

1. 克隆代码仓库
2. 在Chrome开发者模式下加载扩展
3. 访问支持的AI聊天平台测试功能

## 已知问题

ChatGPT的深度研究的回答会出现整体目录对应错乱。

## 赞赏

如果您觉得此项目对您有帮助，请考虑给我一杯咖啡 ☕️。

<img src="public/assets/wechat-pay.jpg" width="200" height="200" />
<img src="public/assets/alipay.png" width="200" height="200" />

## 许可证

MIT License