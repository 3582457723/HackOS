// =============== ハッキングミニゲーム ===============
export function startHackingMinigame(difficulty = 1) {
    const container = document.getElementById('minigame-container');
    const content = document.getElementById('minigame-content');
    
    container.classList.remove('hidden');
    
    // 難易度に応じたゲーム設定
    const config = {
        easy: { time: 10, patterns: 3, title: 'EASY - Pattern Match' },
        normal: { time: 8, patterns: 5, title: 'NORMAL - Sequence Lock' },
        hard: { time: 5, patterns: 8, title: 'HARD - Code Breaker' }
    };
    
    const level = ['easy', 'normal', 'hard'][Math.min(difficulty - 1, 2)];
    const settings = config[level];
    
    content.innerHTML = `
        <div style="text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
            <h2 style="color: var(--color-accent); margin-bottom: 20px;">${settings.title}</h2>
            
            <div style="margin-bottom: 20px;">
                <div id="minigame-timer" style="font-size: 36px; color: var(--color-danger); font-weight: bold; margin-bottom: 10px;">
                    ${settings.time}s
                </div>
                <div id="minigame-pattern" style="font-size: 24px; color: var(--color-text-primary); font-family: monospace; letter-spacing: 5px;">
                    ░ ░ ░ ░ ░
                </div>
            </div>
            
            <div id="minigame-input-area" style="margin-bottom: 20px;">
                <input type="text" id="minigame-answer" placeholder="Enter pattern..." 
                       style="background-color: var(--color-bg-darker); border: 2px solid var(--color-text-secondary); 
                              color: var(--color-text-primary); padding: 10px; font-size: 16px; width: 200px;">
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="minigame-submit" class="btn-login" style="width: auto;">SUBMIT</button>
                <button id="minigame-cancel" class="btn-login" style="width: auto;">CANCEL</button>
            </div>
        </div>
    `;
    
    // ゲームロジック
    let timeLeft = settings.time;
    let correctPattern = generatePattern(settings.patterns);
    let success = false;
    
    // タイマー
    const timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('minigame-timer').textContent = timeLeft + 's';
        
        if (timeLeft === 0) {
            clearInterval(timerInterval);
            endMinigame(false);
        }
    }, 1000);
    
    // サブミットボタン
    document.getElementById('minigame-submit').onclick = () => {
        const input = document.getElementById('minigame-answer').value;
        if (input === correctPattern) {
            success = true;
            clearInterval(timerInterval);
            endMinigame(true);
        } else {
            document.getElementById('minigame-answer').style.borderColor = 'var(--color-danger)';
            setTimeout(() => {
                document.getElementById('minigame-answer').style.borderColor = 'var(--color-text-secondary)';
            }, 300);
        }
    };
    
    // キャンセルボタン
    document.getElementById('minigame-cancel').onclick = () => {
        clearInterval(timerInterval);
        endMinigame(false);
    };
    
    // パターン表示
    const pattern = correctPattern.split('').map(c => {
        const code = c.charCodeAt(0);
        return code >= 48 && code <= 57 ? '█' : (code >= 65 && code <= 90 ? '▓' : '░');
    }).join(' ');
    document.getElementById('minigame-pattern').textContent = pattern;
    
    // 入力フォーカス
    document.getElementById('minigame-answer').focus();
}

function generatePattern(length) {
    let pattern = '';
    const chars = '0123456789ABCDEF';
    for (let i = 0; i < length; i++) {
        pattern += chars[Math.floor(Math.random() * chars.length)];
    }
    return pattern;
}

function endMinigame(success) {
    const container = document.getElementById('minigame-container');
    const content = document.getElementById('minigame-content');
    
    if (success) {
        content.innerHTML = `
            <div style="text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
                <h1 style="color: var(--color-success); font-size: 48px; margin-bottom: 20px;">✓ SUCCESS</h1>
                <p style="color: var(--color-success); font-size: 18px;">Access granted!</p>
                <button class="btn-login" onclick="document.getElementById('minigame-container').classList.add('hidden')" style="margin-top: 20px;">CLOSE</button>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div style="text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
                <h1 style="color: var(--color-danger); font-size: 48px; margin-bottom: 20px;">✗ FAILED</h1>
                <p style="color: var(--color-danger); font-size: 18px;">Connection lost</p>
                <button class="btn-login" onclick="document.getElementById('minigame-container').classList.add('hidden')" style="margin-top: 20px;">CLOSE</button>
            </div>
        `;
    }
    
    return success;
}

export default startHackingMinigame;
