# AI PageOutliner 浏览器扩展

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

## 安装方法

1. 在Chrome中以开发者模式加载解压的扩展
2. 访问支持的AI聊天平台即可使用

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
├── background.js
├── content.js
├── sidepanel.js
├── sidepanel.html
├── icon48.png
├── icon128.png
└── README.md
```

## 开发

1. 克隆代码仓库
2. 在Chrome开发者模式下加载扩展
3. 访问支持的AI聊天平台测试功能

## 已知问题

ChatGPT的深度研究的回答会出现整体目录对应错乱。

## 许可证

MIT License
