// 注册侧面板
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// 监听插件安装或更新
chrome.runtime.onInstalled.addListener(async () => {
    // 获取所有匹配的标签页
    const tabs = await chrome.tabs.query({
        url: [
            "*://*.deepseek.com/*",
            "*://*.yuanbao.tencent.com/*",
            "*://*.chatgpt.com/*",
            "*://*.gemini.google.com/*",
            "*://*.grok.com/*",
            "*://*.doubao.com/*",
            "*://*.kimi.com/*",
            "*://*.kimi.moonshot.cn/*"
        ]
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
        const isMatchingUrl = tab.url.includes('deepseek.com') || 
                            tab.url.includes('yuanbao.tencent.com') ||
                            tab.url.includes('chatgpt.com') ||
                            tab.url.includes('gemini.google.com') ||
                            tab.url.includes('grok.com') ||
                            tab.url.includes('doubao.com') ||
                            tab.url.includes('kimi.com') ||
                            tab.url.includes('kimi.moonshot.cn');
        
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
    const isMatchingUrl = tab.url.includes('deepseek.com') || 
                         tab.url.includes('yuanbao.tencent.com') ||
                         tab.url.includes('chatgpt.com') ||
                         tab.url.includes('gemini.google.com') ||
                         tab.url.includes('grok.com') ||
                         tab.url.includes('doubao.com') ||
                         tab.url.includes('kimi.com') ||
                         tab.url.includes('kimi.moonshot.cn');
    
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
    const isMatchingUrl = tab.url.includes('deepseek.com') || 
                         tab.url.includes('yuanbao.tencent.com') ||
                         tab.url.includes('chatgpt.com') ||
                         tab.url.includes('gemini.google.com') ||
                         tab.url.includes('grok.com') ||
                         tab.url.includes('doubao.com') ||
                         tab.url.includes('kimi.com') ||
                         tab.url.includes('kimi.moonshot.cn');
    
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