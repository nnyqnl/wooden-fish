// 获取DOM元素
const woodenFish = document.getElementById('woodenFish');
const mallet = document.getElementById('mallet');
const sessionCountElement = document.getElementById('sessionCount');
const todayCountElement = document.getElementById('todayCount');
const totalCountElement = document.getElementById('totalCount');
const prayOnceBtn = document.getElementById('prayOnce');
const autoPrayBtn = document.getElementById('autoPray');
const dataToggleBtn = document.getElementById('dataToggleBtn');
const counters = document.getElementById('counters');
const languageBtn = document.getElementById('languageBtn');
const languageDropdown = document.getElementById('languageDropdown');
const currentLanguageElement = document.getElementById('currentLanguage');

// 初始化计数
let sessionCount = 0; // 本次祈福（页面刷新重置）
let todayCount = 0;   // 今日祈福（每天重置）
let totalCount = 0;   // 总祈福（永久保存）

// 自动敲击相关变量
let autoPrayInterval = null;
let isAutoPraying = false;
const prayerSpeed = 800; // 固定速度（毫秒）

// 木鱼敲击音效（默认开启）
const woodSound = new Audio('wooden-fish.wav');
woodSound.volume = 0.4;

// 当前语言
let currentLanguage = localStorage.getItem('prayerLanguage') || 'zh-CN';

// 应用翻译
function applyTranslations() {
    const lang = translations[currentLanguage];
    
    // 更新页面元素
    document.getElementById('headerTitle').textContent = lang.title;
    document.getElementById('headerSubtitle').textContent = lang.subtitle;
    document.getElementById('sessionCountLabel').textContent = lang.sessionCountLabel;
    document.getElementById('todayCountLabel').textContent = lang.todayCountLabel;
    document.getElementById('totalCountLabel').textContent = lang.totalCountLabel;
    document.getElementById('instructionsText').textContent = lang.instructionsText;
    document.getElementById('prayOnceText').textContent = lang.prayOnceText;
    document.getElementById('footerText').textContent = lang.footerText;
    currentLanguageElement.textContent = lang.languageName;
    
    // 更新页面标题
    document.title = lang.pageTitle;
    
    // 更新 meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
        metaDescription.setAttribute('content', lang.metaDescription);
    }
    
    // 更新 Open Graph 标签
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', lang.pageTitle);
    if (ogDescription) ogDescription.setAttribute('content', lang.metaDescription);
    
    // 更新 Twitter 标签
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterTitle) twitterTitle.setAttribute('content', lang.title);
    if (twitterDescription) twitterDescription.setAttribute('content', lang.metaDescription);
    
    // 更新数据切换按钮文本
    const isShowingAll = counters.classList.contains('show-all');
    document.getElementById('dataToggleText').textContent = isShowingAll ? lang.dataToggleTextHide : lang.dataToggleTextShow;
    
    // 更新自动敲击按钮文本
    if (isAutoPraying) {
        document.getElementById('autoPrayText').textContent = lang.stopAutoPrayText;
    } else {
        document.getElementById('autoPrayText').textContent = lang.autoPrayText;
    }
    
    // 更新HTML lang属性
    document.documentElement.lang = currentLanguage;
    
    // 更新语言选择器中的活动状态
    document.querySelectorAll('.language-option').forEach(option => {
        if (option.dataset.lang === currentLanguage) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // 保存语言偏好
    localStorage.setItem('prayerLanguage', currentLanguage);
}

// 切换语言
function switchLanguage(langCode) {
    if (translations[langCode]) {
        currentLanguage = langCode;
        applyTranslations();
    }
}

// 从localStorage加载数据
function loadPrayerData() {
    // 加载总祈福次数
    const savedTotal = localStorage.getItem('totalPrayCount');
    if (savedTotal) {
        totalCount = parseInt(savedTotal);
    }
    
    // 加载今日祈福次数
    const today = new Date().toDateString(); // 获取今天的日期字符串
    const savedToday = localStorage.getItem('todayPrayData');
    if (savedToday) {
        const todayData = JSON.parse(savedToday);
        // 检查是否是今天的数据
        if (todayData.date === today) {
            todayCount = todayData.count;
        } else {
            // 不是今天的数据，重置今日计数
            todayCount = 0;
        }
    }
    
    // 更新显示
    updateCounters();
}

// 保存数据到localStorage
function savePrayerData() {
    // 保存总祈福次数
    localStorage.setItem('totalPrayCount', totalCount.toString());
    
    // 保存今日祈福数据
    const today = new Date().toDateString();
    const todayData = {
        date: today,
        count: todayCount
    };
    localStorage.setItem('todayPrayData', JSON.stringify(todayData));
}

// 更新计数器显示
function updateCounters() {
    sessionCountElement.textContent = sessionCount;
    todayCountElement.textContent = todayCount;
    totalCountElement.textContent = totalCount;
}

// 敲击木鱼动画 - 使用Promise确保动画同步
function hitWoodenFish() {
    return new Promise((resolve) => {
        // 添加敲击动画类
        woodenFish.classList.add('hit');
        mallet.classList.add('swing');
        
        // 播放音效
        woodSound.currentTime = 0;
        woodSound.play();
        
        // 增加计数
        sessionCount++;
        todayCount++;
        totalCount++;
        
        // 更新显示
        updateCounters();
        
        // 保存数据
        savePrayerData();
        
        // 添加一个小的视觉反馈
        const counterItems = document.querySelectorAll('.counter-item');
        counterItems.forEach(item => {
            item.style.transform = 'scale(1.05)';
            item.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                item.style.transform = 'scale(1)';
            }, 200);
        });
        
        // 移除动画类以便下次使用
        setTimeout(() => {
            woodenFish.classList.remove('hit');
        }, 150);
        
        setTimeout(() => {
            mallet.classList.remove('swing');
            resolve(); // 动画完成后resolve
        }, 300);
        
        // 如果祈福次数达到特殊数字，显示特殊效果
        if (totalCount % 108 === 0) {
            showSpecialEffect();
        }
    });
}

// 开始自动敲击 - 使用setTimeout递归调用确保动画同步
function startAutoPray() {
    if (isAutoPraying) return;
    
    isAutoPraying = true;
    autoPrayBtn.classList.remove('btn-secondary');
    autoPrayBtn.classList.add('btn-active');
    document.getElementById('autoPrayText').textContent = translations[currentLanguage].stopAutoPrayText;
    
    // 使用递归的setTimeout确保动画完成后再进行下一次敲击
    function scheduleNextHit() {
        if (!isAutoPraying) return;
        
        // 等待动画完成后再安排下一次
        hitWoodenFish().then(() => {
            if (isAutoPraying) {
                autoPrayInterval = setTimeout(scheduleNextHit, prayerSpeed);
            }
        });
    }
    
    // 开始第一次敲击
    scheduleNextHit();
}

// 停止自动敲击
function stopAutoPray() {
    if (!isAutoPraying) return;
    
    isAutoPraying = false;
    autoPrayBtn.classList.remove('btn-active');
    autoPrayBtn.classList.add('btn-secondary');
    document.getElementById('autoPrayText').textContent = translations[currentLanguage].autoPrayText;
    
    // 清除定时器
    if (autoPrayInterval) {
        clearTimeout(autoPrayInterval);
        autoPrayInterval = null;
    }
}

// 切换自动敲击状态
function toggleAutoPray() {
    if (isAutoPraying) {
        stopAutoPray();
    } else {
        startAutoPray();
    }
}

// 切换数据显示
function toggleDataDisplay() {
    const isShowingAll = counters.classList.contains('show-all');
    
    if (isShowingAll) {
        counters.classList.remove('show-all');
        document.getElementById('dataToggleText').textContent = translations[currentLanguage].dataToggleTextShow;
        dataToggleBtn.classList.remove('active');
    } else {
        counters.classList.add('show-all');
        document.getElementById('dataToggleText').textContent = translations[currentLanguage].dataToggleTextHide;
        dataToggleBtn.classList.add('active');
    }
}

// 特殊效果：当祈福次数达到108的倍数时
function showSpecialEffect() {
    const container = document.querySelector('.container');
    const originalBg = container.style.backgroundColor;
    
    // 闪烁金色光效
    container.style.transition = 'background-color 0.5s';
    container.style.backgroundColor = '#fff8dc';
    
    setTimeout(() => {
        container.style.backgroundColor = originalBg;
        
        // 添加金色粒子效果
        createGoldenParticles();
    }, 500);
}

// 创建金色粒子效果
function createGoldenParticles() {
    const container = document.querySelector('.content');
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = '✨';
        particle.style.position = 'absolute';
        particle.style.fontSize = Math.random() * 20 + 15 + 'px';
        particle.style.left = Math.random() * 80 + 10 + '%';
        particle.style.top = Math.random() * 80 + 10 + '%';
        particle.style.opacity = '0.8';
        particle.style.zIndex = '100';
        particle.style.pointerEvents = 'none';
        particle.style.animation = `floatUp ${Math.random() * 1 + 1}s ease-out forwards`;
        
        // 添加动画关键帧
        if (!document.querySelector('#particle-animation')) {
            const style = document.createElement('style');
            style.id = 'particle-animation';
            style.innerHTML = `
                @keyframes floatUp {
                    0% { transform: translateY(0) scale(1); opacity: 0.8; }
                    100% { transform: translateY(-60px) scale(0.5); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        container.appendChild(particle);
        
        // 移除粒子元素
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

// 检查并重置今天的数据（如果日期已变更）
function checkAndResetTodayData() {
    const today = new Date().toDateString();
    const savedToday = localStorage.getItem('todayPrayData');
    
    if (savedToday) {
        const todayData = JSON.parse(savedToday);
        if (todayData.date !== today) {
            // 日期已变更，重置今日计数
            todayCount = 0;
            updateCounters();
            // 立即保存新的今日数据
            const newTodayData = {
                date: today,
                count: todayCount
            };
            localStorage.setItem('todayPrayData', JSON.stringify(newTodayData));
        }
    }
}

// 事件监听
woodenFish.addEventListener('click', () => hitWoodenFish());
prayOnceBtn.addEventListener('click', () => hitWoodenFish());
autoPrayBtn.addEventListener('click', toggleAutoPray);
dataToggleBtn.addEventListener('click', toggleDataDisplay);

// 语言选择器事件
languageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    languageDropdown.classList.toggle('active');
});

document.querySelectorAll('.language-option').forEach(option => {
    option.addEventListener('click', () => {
        const langCode = option.dataset.lang;
        switchLanguage(langCode);
        languageDropdown.classList.remove('active');
    });
});

// 点击页面其他区域关闭语言选择器
document.addEventListener('click', () => {
    languageDropdown.classList.remove('active');
});

// 添加键盘支持：空格键敲击木鱼
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        hitWoodenFish();
    }
    
    // 按A键切换自动敲击
    if (event.code === 'KeyA') {
        event.preventDefault();
        toggleAutoPray();
    }
    
    // 按D键切换数据显示（仅移动端）
    if (event.code === 'KeyD' && window.innerWidth <= 900) {
        event.preventDefault();
        toggleDataDisplay();
    }
    
    // 按L键切换语言选择器
    if (event.code === 'KeyL') {
        event.preventDefault();
        languageDropdown.classList.toggle('active');
    }
});

// 页面加载时初始化
window.addEventListener('load', () => {
    // 加载语言设置
    const savedLang = localStorage.getItem('prayerLanguage');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
    } else {
        // 尝试根据浏览器语言自动选择
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('en')) {
            // 如果是英语，根据具体地区选择
            if (browserLang.includes('GB') || browserLang.includes('UK')) {
                currentLanguage = 'en-GB';
            } else {
                currentLanguage = 'en-US';
            }
        } else if (browserLang.startsWith('sv')) {
            currentLanguage = 'sv-SE';
        } else if (browserLang.startsWith('de')) {
            currentLanguage = 'de-DE';
        } else if (browserLang.startsWith('ru')) {
            currentLanguage = 'ru-RU';
        } else if (browserLang.startsWith('fr')) {
            currentLanguage = 'fr-FR';
        }
        // 注意：这里保留了zh-CN作为默认值，如果都不匹配会使用zh-CN
    }
    
    // 应用翻译
    applyTranslations();
    
    // 加载数据
    loadPrayerData();
    
    // 检查是否需要重置今日数据
    checkAndResetTodayData();
    
    // 根据屏幕宽度决定是否显示数据切换按钮
    if (window.innerWidth > 900) {
        dataToggleBtn.style.display = 'none';
    }
    
    // 显示一个简单的欢迎提示
    setTimeout(() => {
        const instructions = document.querySelector('.instructions');
        instructions.style.transition = 'all 0.5s ease';
        instructions.style.backgroundColor = 'rgba(255, 245, 215, 0.9)';
        instructions.style.boxShadow = '0 0 15px rgba(184, 148, 70, 0.2)';
        
        setTimeout(() => {
            instructions.style.backgroundColor = 'rgba(255, 249, 230, 0.9)';
            instructions.style.boxShadow = 'none';
        }, 2000);
    }, 1000);
});

// 监听窗口大小变化，调整UI
window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
        // PC端：显示所有数据，隐藏切换按钮
        counters.classList.add('show-all');
        dataToggleBtn.style.display = 'none';
    } else {
        // 移动端：只显示第一个计数器，显示切换按钮
        counters.classList.remove('show-all');
        dataToggleBtn.style.display = 'inline-flex';
        document.getElementById('dataToggleText').textContent = translations[currentLanguage].dataToggleTextShow;
        dataToggleBtn.classList.remove('active');
    }
});

// 页面关闭或刷新前保存数据
window.addEventListener('beforeunload', () => {
    savePrayerData();
});

// 移动端触摸优化：防止双击缩放
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);