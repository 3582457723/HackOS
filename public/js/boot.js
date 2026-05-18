// =============== ブートシーンシステム ===============
export function initializeBoot(callback) {
    const bootLogs = document.getElementById('boot-logs');
    let bootSequence = 0;
    const totalSteps = 15;

    const bootMessages = [
        { level: 'info', message: 'HackOS Boot Loader v2.1 initializing...' },
        { level: 'info', message: 'CPU: Intel Core i7-12700K (12 cores) detected' },
        { level: 'info', message: 'RAM: 32GB DDR5 initialized' },
        { level: 'info', message: 'Storage: Samsung 990 Pro 2TB SSD ready' },
        { level: 'info', message: 'Loading bootloader.dll...' },
        { level: 'success', message: '[OK] bootloader.dll loaded' },
        { level: 'info', message: 'Loading x-server.sys...' },
        { level: 'success', message: '[OK] x-server.sys loaded (v4.2.1)' },
        { level: 'info', message: 'Initializing GPU drivers...' },
        { level: 'success', message: '[OK] NVIDIA RTX 4090 driver loaded' },
        { level: 'info', message: 'Loading kernel modules...' },
        { level: 'success', message: '[OK] Kernel v5.19.0 ready' },
        { level: 'info', message: 'Mounting filesystems...' },
        { level: 'success', message: '[OK] All filesystems mounted' },
        { level: 'success', message: 'Boot complete. Hacker console ready.' }
    ];

    function addBootLog(message, level = 'info') {
        const logLine = document.createElement('div');
        logLine.className = `boot-log-line boot-log-${level}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logLine.innerHTML = `<span class="log-timestamp">[${timestamp}]</span> ${message}`;
        
        bootLogs.appendChild(logLine);
        bootLogs.scrollTop = bootLogs.scrollHeight;
    }

    function showNextMessage() {
        if (bootSequence < bootMessages.length) {
            const msg = bootMessages[bootSequence];
            addBootLog(msg.message, msg.level);
            bootSequence++;
            
            setTimeout(showNextMessage, 400 + Math.random() * 200);
        } else {
            // ブート完了
            setTimeout(() => {
                callback(true);
            }, 1000);
        }
    }

    // ブート開始
    showNextMessage();
}

// X-Server風のブートグラフィックス
export function getASCIIArt() {
    return `
   __ __          __  ___  ___
  / // /___ _____/ /__/ _ \\/ _ \\
 / // / __ \`/ ___/ //_/ // / // /
/ // / /_/ / /__/ ,< / // / // /
\\_/_/\\__,_/\\___/_/|_/\\___/\\___/
    `;
}

// ブートエラーシーン
export function showBootError(errorMessage) {
    const bootLogs = document.getElementById('boot-logs');
    const errorLine = document.createElement('div');
    errorLine.className = 'boot-log-line boot-log-error';
    errorLine.textContent = `!!! CRITICAL ERROR: ${errorMessage}`;
    bootLogs.appendChild(errorLine);
    bootLogs.scrollTop = bootLogs.scrollHeight;
}

// カーネルパニック
export function kernelPanic() {
    const bootLogs = document.getElementById('boot-logs');
    bootLogs.innerHTML += `
        <div class="boot-log-line boot-log-error">
            ====================================
            KERNEL PANIC - not syncing
            ====================================
            System halted. Press any key to reboot.
        </div>
    `;
    bootLogs.scrollTop = bootLogs.scrollHeight;
}

// CUI風ブートシーン（x-server.sysなし）
export function initializeCUIBoot(callback) {
    const bootLogs = document.getElementById('boot-logs');
    bootLogs.innerHTML = '';
    
    const cuiMessages = [
        'HackOS CUI Mode (No X-Server)',
        'System loaded in terminal-only mode',
        'Graphics system unavailable',
        'Type "help" for available commands'
    ];
    
    let index = 0;
    function showNext() {
        if (index < cuiMessages.length) {
            const line = document.createElement('div');
            line.className = 'boot-log-line boot-log-info';
            line.textContent = cuiMessages[index];
            bootLogs.appendChild(line);
            bootLogs.scrollTop = bootLogs.scrollHeight;
            index++;
            setTimeout(showNext, 300);
        } else {
            setTimeout(() => callback(true), 500);
        }
    }
    
    showNext();
}
