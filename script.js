// 家庭称呼问答器 - 交互逻辑

// 关系链条数据
let relationChainData = [];
// 关系链条中每一步的性别，用于判断当前人可选择的关系
let relationGenders = ['male']; // 默认起始性别为男性

// DOM元素引用（将在DOM加载完成后获取）
let genderRadios;
let relationButtons;
let backBtn;
let clearChainBtn;
let relationChain;
let relationDescription;
let submitBtn;

// API Key相关元素
let apiKeyInput;
let saveApiKeyBtn;
let clearApiKeyBtn;

// 弹出窗口相关元素
let resultModal;
let modalRelationChainText;
let modalMyCall;
let modalTheirCall;
let modalExplanation;
let modalBackBtn;
let modalCopyBtn;

// 初始化应用
function initApp() {
    // 获取DOM元素引用
    getDomElements();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 绑定API Key事件监听器
    bindApiKeyEventListeners();
    
    // 设置初始性别
    setGender('male');
    
    // 初始化关系按钮状态
    updateRelationButtonsStatus();
    
    // 绑定弹出窗口事件监听器
    bindModalEventListeners();
}

// 获取DOM元素引用
function getDomElements() {
    // 基本DOM元素
    genderRadios = document.querySelectorAll('input[name="gender"]');
    relationButtons = document.getElementById('relationButtons');
    backBtn = document.getElementById('backBtn');
    clearChainBtn = document.getElementById('clearChainBtn');
    relationChain = document.getElementById('relationChain');
    relationDescription = document.getElementById('relationDescription');
    submitBtn = document.getElementById('submitBtn');
    
    // API Key相关元素
    apiKeyInput = document.getElementById('apiKeyInput');
    saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    clearApiKeyBtn = document.getElementById('clearApiKeyBtn');
    
    // 弹出窗口相关元素
    resultModal = document.getElementById('resultModal');
    modalRelationChainText = document.getElementById('modalRelationChainText');
    modalMyCall = document.getElementById('modalMyCall');
    modalTheirCall = document.getElementById('modalTheirCall');
    modalExplanation = document.getElementById('modalExplanation');
    modalBackBtn = document.getElementById('modalBackBtn');
    modalCopyBtn = document.getElementById('modalCopyBtn');
}

// 绑定弹出窗口事件监听器
function bindModalEventListeners() {
    // 返回按钮点击事件
    modalBackBtn.addEventListener('click', hideResultModal);
    
    // 复制分享按钮点击事件
    modalCopyBtn.addEventListener('click', copyShareContent);
    
    // 点击遮罩层关闭弹出窗口
    resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal || e.target.classList.contains('modal-overlay')) {
            hideResultModal();
        }
    });
    
    // 按ESC键关闭弹出窗口
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resultModal.classList.contains('active')) {
            hideResultModal();
        }
    });
}

// 绑定事件监听器
function bindEventListeners() {
    // 性别选择事件
    genderRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            setGender(e.target.value);
        });
    });
    
    // 关系按钮点击事件
    relationButtons.addEventListener('click', (e) => {
        if (e.target.classList.contains('relation-btn')) {
            const relation = e.target.dataset.relation;
            addRelation(relation);
        }
    });
    
    // 回退按钮事件
    backBtn.addEventListener('click', backRelation);
    
    // 清空链条按钮事件
    clearChainBtn.addEventListener('click', clearChain);
    
    // 提交按钮事件
    submitBtn.addEventListener('click', submitRelationChain);
}

// 设置性别
function setGender(gender) {
    // 更新body类名
    document.body.className = gender;
    // 更新初始性别
    relationGenders = [gender];
    // 更新关系按钮状态
    updateRelationButtonsStatus();
}

// 根据关系和当前性别计算下一个人的性别
function getNextGender(currentGender, relation) {
    // 性别映射关系
    const genderMap = {
        '父亲': 'male',
        '母亲': 'female',
        '哥哥': 'male',
        '弟弟': 'male',
        '姐姐': 'female',
        '妹妹': 'female',
        '儿子': 'male',
        '女儿': 'female',
        '妻子': 'female',
        '丈夫': 'male'
    };
    
    return genderMap[relation] || 'male'; // 默认返回男性
}

// 更新关系按钮状态，根据当前人的性别禁用不允许的关系
function updateRelationButtonsStatus() {
    const currentGender = relationGenders[relationGenders.length - 1];
    const buttons = document.querySelectorAll('.relation-btn');
    
    buttons.forEach(button => {
        const relation = button.dataset.relation;
        
        // 判断是否需要禁用
        if ((currentGender === 'male' && relation === '丈夫') || 
            (currentGender === 'female' && relation === '妻子')) {
            button.disabled = true;
            button.classList.add('disabled');
        } else {
            button.disabled = false;
            button.classList.remove('disabled');
        }
    });
}

// 添加关系
function addRelation(relation) {
    if (!relation) {
        alert('请选择关系');
        return;
    }
    
    // 添加到关系链条数据
    relationChainData.push(relation);
    
    // 计算并添加下一个人的性别
    const currentGender = relationGenders[relationGenders.length - 1];
    const nextGender = getNextGender(currentGender, relation);
    relationGenders.push(nextGender);
    
    // 更新关系链条显示
    updateRelationChainDisplay();
    
    // 更新关系描述
    updateRelationDescription();
    
    // 更新关系按钮状态
    updateRelationButtonsStatus();
}

// 更新关系链条显示
function updateRelationChainDisplay() {
    try {
        // 直接通过document.getElementById获取元素，不依赖外部变量
        const relationChainElement = document.getElementById('relationChain');
        
        if (!relationChainElement) {
            console.error('relationChain元素未找到，ID为relationChain');
            return;
        }
        
        // 清空当前显示
        relationChainElement.innerHTML = '<span class="chain-node start-node">我</span>';
        
        // 添加关系节点
        relationChainData.forEach((relation, index) => {
            const nodeContainer = document.createElement('div');
            nodeContainer.className = 'chain-node relation-node';
            nodeContainer.innerHTML = `
                ${relation}
                <button class="remove-node" onclick="removeRelation(${index})">×</button>
            `;
            relationChainElement.appendChild(nodeContainer);
        });
    } catch (error) {
        console.error('更新关系链条显示时发生错误:', error);
        console.error('错误位置:', error.stack);
    }
}

// 更新关系描述
function updateRelationDescription() {
    try {
        // 直接通过document.getElementById获取元素，不依赖外部变量
        const relationDescriptionElement = document.getElementById('relationDescription');
        
        if (!relationDescriptionElement) {
            console.error('relationDescription元素未找到，ID为relationDescription');
            return;
        }
        
        if (relationChainData.length === 0) {
            relationDescriptionElement.textContent = '当前关系链：我';
        } else {
            const chainText = relationChainData.join('的');
            relationDescriptionElement.textContent = `当前关系链：我的${chainText}`;
        }
    } catch (error) {
        console.error('更新关系描述时发生错误:', error);
        console.error('错误位置:', error.stack);
    }
}

// 删除关系
function removeRelation(index) {
    // 从数据中删除
    relationChainData.splice(index, 1);
    relationGenders.splice(index + 1, 1);
    
    // 更新显示
    updateRelationChainDisplay();
    
    // 更新关系描述
    updateRelationDescription();
    
    // 更新关系按钮状态
    updateRelationButtonsStatus();
}

// 回退功能
function backRelation() {
    if (relationChainData.length > 0) {
        relationChainData.pop();
        relationGenders.pop();
        updateRelationChainDisplay();
        updateRelationDescription();
        updateRelationButtonsStatus();
    }
}

// 清空链条
function clearChain() {
    // 清空数据
    relationChainData = [];
    relationGenders = [document.querySelector('input[name="gender"]:checked').value];
    
    // 更新显示
    updateRelationChainDisplay();
    
    // 更新关系描述
    updateRelationDescription();
    
    // 更新关系按钮状态
    updateRelationButtonsStatus();
    
    // 隐藏结果弹出窗口（如果显示）
    hideResultModal();
}

// 构造提示词
function buildPrompt() {
    const gender = document.querySelector('input[name="gender"]:checked').value;
    const genderText = gender === 'male' ? '男性' : '女性';
    
    if (relationChainData.length === 0) {
        alert('请先添加关系链条');
        return null;
    }
    
    // 构建关系链条文本
    const relationText = relationChainData.join('的');
    
    // 构造提示词，明确要求返回JSON格式和解释长度限制
    const prompt = `我是一个${genderText}，请问：我的${relationText}，我应该称呼他/她为什么？他/她应该称呼我为什么？请详细解释为什么会有这样的称呼，解释说明长度请控制在200字以内。

请严格按照以下JSON格式返回结果，不要包含任何其他内容：
{
  "myCall": "我称呼对方的名称",
  "theirCall": "对方称呼我的名称",
  "explanation": "详细的解释说明（不超过200字）"
}`;
    
    return prompt;
}

// 提交关系链条
async function submitRelationChain() {
    const prompt = buildPrompt();
    if (!prompt) return;
    
    // 构建关系链条文本，用于显示在弹出窗口中
    const relationText = relationChainData.join('的');
    const fullRelationChain = relationText ? `我的${relationText}` : '我';
    
    // 先显示弹出窗口，显示加载状态
    const loadingResult = {
        myCall: '查询中...',
        theirCall: '查询中...',
        explanation: '正在查询，请稍候...'
    };
    displayResult(loadingResult);
    
    try {
        // 直接调用DeepSeek API
        const result = await callApi(prompt);
        
        // 更新弹出窗口内容
        displayResult(result);
    } catch (error) {
        console.error('查询失败:', error);
        // 使用模拟结果作为回退
        const mockResult = getMockResult();
        
        // 更新弹出窗口内容
        displayResult(mockResult);
    }
}

// 保存API Key到localStorage
function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('deepseekApiKey', apiKey);
        alert('API Key已保存');
    } else {
        alert('请输入API Key');
    }
}

// 清除API Key
function clearApiKey() {
    localStorage.removeItem('deepseekApiKey');
    apiKeyInput.value = '';
    alert('API Key已清除');
}

// 获取API Key
function getApiKey() {
    return localStorage.getItem('deepseekApiKey');
}

// 绑定API Key相关事件监听器
function bindApiKeyEventListeners() {
    // 保存API Key按钮点击事件
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    
    // 清除API Key按钮点击事件
    clearApiKeyBtn.addEventListener('click', clearApiKey);
    
    // 按Enter键保存API Key
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveApiKey();
        }
    });
    
    // 页面加载时，从localStorage加载API Key
    const savedApiKey = getApiKey();
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
}

// 调用真实API
async function callApi(prompt) {
    // 获取API Key
    const apiKey = getApiKey();
    
    if (!apiKey) {
        throw new Error('请先输入DeepSeek API Key');
    }
    
    const model = "deepseek-chat";
    
    // DeepSeek API的真实调用
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 500,
            temperature: 0.7
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API调用失败: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const resultText = data.choices[0].message.content.trim();
    
    // 解析结果
    return parseApiResult(resultText);
}

// 解析API返回的结果
function parseApiResult(resultText) {
    // 添加调试日志
    console.log('API原始返回结果:', resultText);
    
    // 尝试JSON解析
    try {
        const jsonResult = JSON.parse(resultText);
        
        // 验证JSON结构
        if (jsonResult.myCall && jsonResult.theirCall && jsonResult.explanation) {
            const parsedResult = {
                myCall: jsonResult.myCall.trim(),
                theirCall: jsonResult.theirCall.trim(),
                explanation: jsonResult.explanation.trim()
            };
            
            console.log('JSON解析成功:', parsedResult);
            return parsedResult;
        }
        console.log('JSON结构不完整，回退到文本解析');
    } catch (jsonError) {
        console.log('JSON解析失败，回退到文本解析:', jsonError.message);
    }
    
    // 回退到文本解析
    let myCall = '未知';
    let theirCall = '未知';
    let explanation = '未提供解释说明';
    
    const lines = resultText.split('\n');
    lines.forEach(line => {
        if (line.includes('我称呼对方：')) {
            myCall = line.replace('我称呼对方：', '').trim();
        } else if (line.includes('对方称呼我：')) {
            theirCall = line.replace('对方称呼我：', '').trim();
        } else if (line.includes('解释：')) {
            explanation = line.replace('解释：', '').trim();
        }
    });
    
    // 如果没有找到解释，将剩余内容作为解释
    if (explanation === '未提供解释说明') {
        const explanationIndex = resultText.indexOf('解释：');
        if (explanationIndex !== -1) {
            explanation = resultText.substring(explanationIndex + 3).trim();
        } else {
            explanation = resultText;
        }
    }
    
    const fallbackResult = {
        myCall,
        theirCall,
        explanation
    };
    
    console.log('文本解析结果:', fallbackResult);
    
    return fallbackResult;
}

// 获取模拟结果
function getMockResult() {
    // 模拟不同关系链条的结果
    const relationKey = relationChainData.join('-');
    
    // 模拟结果数据，包含解释说明
    const mockResults = {
        '父亲-父亲-妹妹-丈夫-弟弟': {
            myCall: '堂姑父',
            theirCall: '堂侄子',
            explanation: '您的父亲的父亲是您的爷爷，爷爷的妹妹是您的姑奶奶，姑奶奶的丈夫是您的姑爷爷，姑爷爷的弟弟是您的堂姑父。堂姑父是姑奶奶的丈夫的弟弟，因此他称呼您为堂侄子。'
        },
        '母亲-哥哥-女儿': {
            myCall: '外甥女',
            theirCall: '舅舅',
            explanation: '您的母亲的哥哥是您的舅舅，舅舅的女儿是您的外甥女。外甥女是舅舅的女儿，因此她称呼您为舅舅。'
        },
        '妻子-父亲-弟弟': {
            myCall: '叔岳父',
            theirCall: '侄女婿',
            explanation: '您的妻子的父亲是您的岳父，岳父的弟弟是您的叔岳父。叔岳父是妻子的叔叔，因此他称呼您为侄女婿。'
        },
        '父亲-妹妹-女儿': {
            myCall: '堂妹',
            theirCall: '堂哥',
            explanation: '您的父亲的妹妹是您的姑姑，姑姑的女儿是您的堂妹。堂妹是姑姑的女儿，因此她称呼您为堂哥。'
        },
        '母亲-母亲-弟弟': {
            myCall: '舅姥爷',
            theirCall: '外甥孙',
            explanation: '您的母亲的母亲是您的外婆，外婆的弟弟是您的舅姥爷。舅姥爷是外婆的弟弟，因此他称呼您为外甥孙。'
        },
        '儿子-女儿': {
            myCall: '孙女',
            theirCall: '爷爷',
            explanation: '您的儿子的女儿是您的孙女。孙女是您的孙子辈，因此她称呼您为爷爷。'
        },
        '哥哥-儿子': {
            myCall: '侄子',
            theirCall: '叔叔',
            explanation: '您的哥哥的儿子是您的侄子。侄子是您的兄弟的儿子，因此他称呼您为叔叔。'
        }
    };
    
    // 返回对应结果或默认结果
    const result = mockResults[relationKey];
    if (result) {
        return result;
    } else {
        // 获取当前性别
        let gender = 'male';
        const genderRadio = document.querySelector('input[name="gender"]:checked');
        if (genderRadio) {
            gender = genderRadio.value;
        }
        
        return {
            myCall: '亲戚',
            theirCall: '亲戚',
            explanation: '根据您提供的关系链条，对方是您的亲戚。' + 
                        '\n\n关系链条分析：' + 
                        '\n1. 您的初始性别为：' + (gender === 'male' ? '男性' : '女性') + 
                        '\n2. 关系链条：我的' + relationChainData.join('的') + 
                        '\n3. 由于没有匹配到具体的关系模板，因此称呼为"亲戚"。'
        };
    }
}

// 显示结果弹出窗口
function showResultModal(result) {
    try {
        // 直接通过document.getElementById获取元素，不依赖外部变量
        const resultModalElement = document.getElementById('resultModal');
        const modalRelationChainTextElement = document.getElementById('modalRelationChainText');
        const modalMyCallElement = document.getElementById('modalMyCall');
        const modalTheirCallElement = document.getElementById('modalTheirCall');
        const modalExplanationElement = document.getElementById('modalExplanation');
        
        // 检查所有元素是否存在
        if (!resultModalElement || !modalRelationChainTextElement || !modalMyCallElement || !modalTheirCallElement || !modalExplanationElement) {
            console.error('弹出窗口相关元素未找到：');
            console.error('resultModal:', resultModalElement);
            console.error('modalRelationChainText:', modalRelationChainTextElement);
            console.error('modalMyCall:', modalMyCallElement);
            console.error('modalTheirCall:', modalTheirCallElement);
            console.error('modalExplanation:', modalExplanationElement);
            return;
        }
        
        // 构建关系链条文本
        const relationText = relationChainData.join('的');
        const fullRelationChain = relationText ? `我的${relationText}` : '我';
        
        // 设置弹出窗口内容
        modalRelationChainTextElement.textContent = fullRelationChain;
        modalMyCallElement.textContent = result.myCall;
        modalTheirCallElement.textContent = result.theirCall;
        modalExplanationElement.textContent = result.explanation;
        
        // 显示弹出窗口
        resultModalElement.classList.add('active');
    } catch (error) {
        console.error('显示结果弹出窗口时发生错误:', error);
        console.error('错误位置:', error.stack);
    }
}

// 隐藏结果弹出窗口
function hideResultModal() {
    try {
        // 直接通过document.getElementById获取元素，不依赖外部变量
        const resultModalElement = document.getElementById('resultModal');
        
        if (!resultModalElement) {
            console.error('resultModal元素未找到，ID为resultModal');
            return;
        }
        
        resultModalElement.classList.remove('active');
    } catch (error) {
        console.error('隐藏结果弹出窗口时发生错误:', error);
        console.error('错误位置:', error.stack);
    }
}

// 显示结果
function displayResult(result) {
    // 显示弹出窗口
    showResultModal(result);
}

// 复制分享内容
function copyShareContent() {
    // 构建完整的分享内容
    const relationText = relationChainData.join('的');
    const fullRelationChain = relationText ? `我的${relationText}` : '我';
    
    const shareContent = `家庭称呼查询结果：

关系链条：${fullRelationChain}

我称呼对方：${modalMyCall.textContent}
对方称呼我：${modalTheirCall.textContent}

解释说明：
${modalExplanation.textContent}`;
    
    // 复制到剪贴板
    navigator.clipboard.writeText(shareContent)
        .then(() => {
            // 显示复制成功提示
            alert('复制成功！可以分享给朋友了。');
        })
        .catch(err => {
            console.error('复制失败:', err);
            alert('复制失败，请手动复制。');
        });
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', initApp);