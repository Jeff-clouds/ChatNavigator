// 注册侧面板
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

const SUPPORTED_URL_PATTERNS = [
    "*://*.deepseek.com/*",
    "*://*.deepseek.ai/*",
    "*://*.yuanbao.tencent.com/*",
    "*://*.chatgpt.com/*",
    "*://*.doubao.com/*",
    "*://*.gemini.google.com/*",
    "*://*.grok.com/*",
    "*://*.kimi.com/*",
    "*://*.moonshot.cn/*"
];

const SUPPORTED_URL_SNIPPETS = [
    "deepseek.com",
    "deepseek.ai",
    "yuanbao.tencent.com",
    "chatgpt.com",
    "doubao.com",
    "gemini.google.com",
    "grok.com",
    "kimi.com",
    "moonshot.cn"
];

function isSupportedUrl(url = '') {
    return SUPPORTED_URL_SNIPPETS.some(snippet => url.includes(snippet));
}

// 监听插件安装或更新
chrome.runtime.onInstalled.addListener(async () => {
    // 获取所有匹配的标签页
    const tabs = await chrome.tabs.query({
        url: SUPPORTED_URL_PATTERNS
    });
    
    // 为每个匹配的标签页注入content script
    for (const tab of tabs) {
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: [
                    'src/config/selectors.js',
                    'src/utils/common.js',
                    'src/core/pipeline.js',
                    'src/core/content.js'
                ]
            });
        } catch (err) {
            console.error(`Failed to inject content script into tab ${tab.id}:`, err);
        }
    }
});

// 当标签页更新时，注入content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const isMatchingUrl = isSupportedUrl(tab.url);
        
        if (isMatchingUrl) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: [
                    'src/config/selectors.js',
                    'src/utils/common.js',
                    'src/core/pipeline.js',
                    'src/core/content.js'
                ]
            });
        }
    }
});

// 添加标签页切换监听器
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const isMatchingUrl = isSupportedUrl(tab.url);
    
    if (isMatchingUrl) {
        // 注入 content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [
                    'src/config/selectors.js',
                    'src/utils/common.js',
                    'src/core/pipeline.js',
                    'src/core/content.js'
                ]
        });
        
        // 触发大纲提取
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                if (typeof extractAndSendOutline === 'function') {
                    extractAndSendOutline();
                }
            }
        });
    }
});

// 监听插件图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
    const isMatchingUrl = isSupportedUrl(tab.url);
    
    if (isMatchingUrl) {
        // 注入 content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: [
                    'src/config/selectors.js',
                    'src/utils/common.js',
                    'src/core/pipeline.js',
                    'src/core/content.js'
                ]
        });
        
        // 触发大纲提取
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                // 手动触发一次大纲提取
                if (typeof extractAndSendOutline === 'function') {
                    extractAndSendOutline();
                }
            }
        });
    }
});

// 处理快捷键命令
chrome.commands.onCommand.addListener((command) => {
    switch (command) {
        case 'toggle_outline':
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'toggle_outline' });
            });
            break;
        case 'next_heading':
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'next_heading' });
            });
            break;
        case 'prev_heading':
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'prev_heading' });
            });
            break;
    }
}); 
