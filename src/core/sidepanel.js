// 当前激活标签页ID
let currentTabId = null;

// 全局状态：是否所有目录都已收起
let allCollapsed = false;

// 主动请求当前标签页大纲
function requestCurrentTabOutline() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
            currentTabId = tabs[0].id;
            // 清空大纲显示，防止串台
            const outlineContainer = document.getElementById('outline');
            if (outlineContainer) outlineContainer.innerHTML = '<div class="loading-state"><p>正在分析页面内容...</p></div>';
            chrome.tabs.sendMessage(currentTabId, {type: 'getOutline'});
        }
    });
}

// 侧边栏加载时请求大纲
window.addEventListener('load', () => {
    requestCurrentTabOutline();
    // 初始化一键操作按钮
    initializeToggleAllButton();
});

// 监听标签切换
chrome.tabs.onActivated && chrome.tabs.onActivated.addListener(requestCurrentTabOutline);
chrome.tabs.onUpdated && chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.active && changeInfo.status === 'complete') {
        requestCurrentTabOutline();
    }
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // 只处理当前激活标签页返回的消息
    if (sender.tab && sender.tab.id !== currentTabId) return;
    if (message.type === 'outline') {
        displayOutline(message.outline);
        // 显示网站类型
        const url = sender.tab && sender.tab.url ? sender.tab.url : '';
        const siteInfo = document.getElementById('site-info');
        if (siteInfo) {
            if (url.includes('deepseek.com')) {
                siteInfo.textContent = '当前网站: DeepSeek Chat';
            } else if (url.includes('yuanbao.tencent.com')) {
                siteInfo.textContent = '当前网站: 元宝 AI';
            } else if (url.includes('chatgpt.com')) {
                siteInfo.textContent = '当前网站: ChatGPT';
            } else if (url.includes('gemini.google.com')) {
                siteInfo.textContent = '当前网站: Google Gemini';
            } else if (url.includes('grok.com')) {
                siteInfo.textContent = '当前网站: Grok';
            } else if (url.includes('doubao.com')) {
                siteInfo.textContent = '当前网站: 豆包 AI';
            } else {
                siteInfo.textContent = '当前网站: 普通网页';
            }
        }
    } else if (message.type === 'updateReadingPosition') {
        highlightCurrentReadingPosition(message.elementId, message.elementText);
    }
});

// 高亮当前阅读位置
function highlightCurrentReadingPosition(elementId, elementText) {
    // 移除之前的高亮
    document.querySelectorAll('.outline-item').forEach(item => {
        item.classList.remove('current-reading');
    });
    
    // 只用id查找对应的大纲项
    const targetItem = document.querySelector(`.outline-item[data-element-id="${elementId}"]`);
    if (targetItem) {
        // 添加高亮样式
        targetItem.classList.add('current-reading');
        // 平滑滚动到当前项
        targetItem.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
        });
        // 更新阅读进度指示器
        updateReadingProgress(targetItem);
    }
}

// 更新阅读进度指示器
function updateReadingProgress(currentItem) {
    const allItems = document.querySelectorAll('.outline-item');
    const currentIndex = Array.from(allItems).indexOf(currentItem);
    const progress = ((currentIndex + 1) / allItems.length) * 100;
    
    // 更新进度条
    let progressBar = document.getElementById('reading-progress');
    if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'reading-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(90deg, #2196f3, #4caf50);
            transition: width 0.3s ease;
            z-index: 1000;
            width: 0%;
        `;
        document.body.appendChild(progressBar);
    }
    
    progressBar.style.width = `${progress}%`;
}

// 显示大纲
function displayOutline(outlineData) {
    const outlineContainer = document.getElementById('outline');
    
    // 检查是否有大纲数据
    if (!outlineData || outlineData.length === 0) {
        showErrorMessage(outlineContainer, '当前页面未找到可用的大纲内容，请打开你的对话');
        return;
    }

    outlineContainer.innerHTML = '';
    
    let currentQuestion = null;
    let questionAnswers = [];
    
    outlineData.forEach(item => {
        if (item.type === 'question') {
            // 如果有上一个问题，先渲染它
            if (currentQuestion) {
                renderQuestionGroup(currentQuestion, questionAnswers, outlineContainer);
            }
            // 开始新的问题组
            currentQuestion = item;
            questionAnswers = [];
        } else {
            // 收集问题的答案和子标题
            questionAnswers.push(item);
        }
    });
    
    // 渲染最后一个问题组
    if (currentQuestion) {
        renderQuestionGroup(currentQuestion, questionAnswers, outlineContainer);
    }
}

// 渲染问题组（问题及其答案）
function renderQuestionGroup(question, answers, container) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'question-group';
    
    // 创建问题元素
    const questionDiv = document.createElement('div');
    questionDiv.className = `outline-item ${question.level} ${question.type}`;
    questionDiv.setAttribute('data-element-id', question.id);
    
    // 创建展开/收起图标
    const toggle = document.createElement('span');
    toggle.className = 'toggle-icon';
    toggle.textContent = '▼';
    toggle.style.marginRight = '5px';
    toggle.style.cursor = 'pointer';
    questionDiv.appendChild(toggle);
    
    // 添加问题文本
    const text = document.createElement('span');
    text.textContent = question.text;
    questionDiv.appendChild(text);
    
    // 设置问题样式
    questionDiv.style.fontWeight = 'bold';
    questionDiv.style.color = '#1a73e8';
    
    // 创建答案容器
    const answersDiv = document.createElement('div');
    answersDiv.className = 'answers-container';
    answersDiv.style.display = 'block';
    
    // 添加问题点击事件（跳转）
    questionDiv.addEventListener('click', (e) => {
        if (e.target !== toggle) {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'scrollTo',
                    elementId: question.id
                });
            });
        }
    });
    
    // 添加展开/收起功能
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = toggle.textContent === '▼';
        toggle.textContent = isExpanded ? '▶' : '▼';
        answersDiv.style.display = isExpanded ? 'none' : 'block';
        
        // 检查是否所有目录都已收起
        updateGlobalCollapseState();
    });
    
    // 渲染所有答案和子标题
    answers.forEach(answer => {
        const answerDiv = document.createElement('div');
        answerDiv.className = `outline-item ${answer.level} ${answer.type}`;
        answerDiv.textContent = answer.text;
        answerDiv.setAttribute('data-element-id', answer.id);
        
        // 设置答案样式
        answerDiv.style.color = '#202124';
        
        // 添加答案点击事件
        answerDiv.addEventListener('click', () => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    type: 'scrollTo',
                    elementId: answer.id
                });
            });
        });
        
        answersDiv.appendChild(answerDiv);
    });
    
    groupDiv.appendChild(questionDiv);
    groupDiv.appendChild(answersDiv);
    container.appendChild(groupDiv);
}

// 初始化一键操作按钮
function initializeToggleAllButton() {
    const toggleAllBtn = document.getElementById('toggle-all-btn');
    if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', toggleAllDirectories);
    }
}

// 检查并更新全局收起状态
function updateGlobalCollapseState() {
    const allToggles = document.querySelectorAll('.toggle-icon');
    const allAnswersContainers = document.querySelectorAll('.answers-container');
    const toggleAllBtn = document.getElementById('toggle-all-btn');
    
    if (allToggles.length === 0) return;
    
    // 检查是否所有目录都已收起
    let allCurrentlyCollapsed = true;
    allToggles.forEach((toggle, index) => {
        const answersContainer = allAnswersContainers[index];
        if (answersContainer && answersContainer.style.display !== 'none') {
            allCurrentlyCollapsed = false;
        }
    });
    
    // 更新全局状态和按钮
    allCollapsed = allCurrentlyCollapsed;
    if (toggleAllBtn) {
        const icon = toggleAllBtn.querySelector('.icon');
        const text = toggleAllBtn.querySelector('.text');
        
        if (allCollapsed) {
            toggleAllBtn.classList.add('collapsed');
            icon.textContent = '▶';
            text.textContent = '展开所有';
        } else {
            toggleAllBtn.classList.remove('collapsed');
            icon.textContent = '▼';
            text.textContent = '收起所有';
        }
    }
}

// 一键收起/展开所有目录
function toggleAllDirectories() {
    const toggleAllBtn = document.getElementById('toggle-all-btn');
    const allToggles = document.querySelectorAll('.toggle-icon');
    const allAnswersContainers = document.querySelectorAll('.answers-container');
    
    allCollapsed = !allCollapsed;
    
    // 更新按钮状态
    if (toggleAllBtn) {
        const icon = toggleAllBtn.querySelector('.icon');
        const text = toggleAllBtn.querySelector('.text');
        
        if (allCollapsed) {
            toggleAllBtn.classList.add('collapsed');
            icon.textContent = '▶';
            text.textContent = '展开所有';
        } else {
            toggleAllBtn.classList.remove('collapsed');
            icon.textContent = '▼';
            text.textContent = '收起所有';
        }
    }
    
    // 更新所有目录状态
    allToggles.forEach((toggle, index) => {
        const answersContainer = allAnswersContainers[index];
        if (answersContainer) {
            if (allCollapsed) {
                toggle.textContent = '▶';
                answersContainer.style.display = 'none';
            } else {
                toggle.textContent = '▼';
                answersContainer.style.display = 'block';
            }
        }
    });
}

// 添加错误消息显示函数
function showErrorMessage(container, message) {
    container.innerHTML = `
        <div class="error-message" style="padding: 20px; color: #666;">
            <h3 style="margin-bottom: 10px; color: #333;">提示</h3>
            <p>${message}</p>
            <div style="margin-top: 15px;">
                <p>支持的网站类型：</p>
                <ul style="margin-top: 8px; padding-left: 20px;">
                    <li>
                        <a href="https://chat.deepseek.com/" target="_blank" style="color: #1a73e8; text-decoration: none;">
                            DeepSeek Chat
                        </a>
                    </li>
                    <li>
                        <a href="https://yuanbao.tencent.com/" target="_blank" style="color: #1a73e8; text-decoration: none;">
                            元宝 AI
                        </a>
                    </li>
                    <li>
                        <a href="https://chat.openai.com/" target="_blank" style="color: #1a73e8; text-decoration: none;">
                            ChatGPT
                        </a>
                    </li>
                    <li>
                        <a href="https://gemini.google.com/" target="_blank" style="color: #1a73e8; text-decoration: none;">
                            Google Gemini
                        </a>
                    </li>
                    <li>
                        <a href="https://grok.x.ai/" target="_blank" style="color: #1a73e8; text-decoration: none;">
                            Grok
                        </a>
                    </li>
                    <li>
                        <a href="https://doubao.com/" target="_blank" style="color: #1a73e8; text-decoration: none;">
                            豆包 AI
                        </a>
                    </li>
                </ul>
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #888;">
                点击网站名称可直接访问对应网站
            </p>
        </div>
    `;

    // 为链接添加悬停效果
    const links = container.getElementsByTagName('a');
    for (let link of links) {
        link.addEventListener('mouseover', () => {
            link.style.textDecoration = 'underline';
        });
        link.addEventListener('mouseout', () => {
            link.style.textDecoration = 'none';
        });
    }
} 