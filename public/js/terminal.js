// =============== ターミナルシステム ===============
import { executeCommand } from './commands.js';

let commandHistory = [];
let historyIndex = -1;

export function initializeTerminal(app) {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const clearBtn = document.getElementById('terminal-clear');
    
    // コマンド実行
    terminalInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const command = terminalInput.value.trim();
            terminalInput.value = '';
            
            if (command) {
                commandHistory.push(command);
                historyIndex = commandHistory.length;
                
                // コマンド表示
                addTerminalLine(command, 'input');
                
                // コマンド実行
                const result = await executeCommand(command, app);
                if (result) {
                    addTerminalLine(result, 'output');
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            historyIndex = Math.max(0, historyIndex - 1);
            if (commandHistory[historyIndex]) {
                terminalInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            historyIndex = Math.min(commandHistory.length, historyIndex + 1);
            terminalInput.value = commandHistory[historyIndex] || '';
        } else if (e.key === 'Tab') {
            e.preventDefault();
            // TAB補完機能（後で実装）
            showCommandHints(terminalInput.value);
        }
    });
    
    // ターミナルクリア
    clearBtn.addEventListener('click', () => {
        terminalOutput.innerHTML = '';
        addTerminalLine('Terminal cleared', 'info');
    });
    
    // 初期メッセージ
    addTerminalLine('[HackOS Terminal Ready]', 'success');
    addTerminalLine('Type "help" for available commands', 'info');
}

export function addTerminalLine(text, type = 'output') {
    const terminal = document.getElementById('terminal-output');
    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;
    
    // タイムスタンプ付き
    const now = new Date();
    const timestamp = `[${now.toLocaleTimeString()}]`;
    
    // ログレベルアイコン
    let logLevel = '';
    switch(type) {
        case 'info':
            logLevel = '<span class="log-level info">INFO</span>';
            break;
        case 'warning':
            logLevel = '<span class="log-level warn">WARN</span>';
            break;
        case 'error':
            logLevel = '<span class="log-level error">ERROR</span>';
            break;
        case 'success':
            logLevel = '<span class="log-level success">OK</span>';
            break;
        case 'input':
            line.innerHTML = `<span class="prompt">$ </span>${escapeHtml(text)}`;
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
            return;
        case 'output':
            line.innerHTML = escapeHtml(text);
            terminal.appendChild(line);
            terminal.scrollTop = terminal.scrollHeight;
            return;
    }
    
    if (logLevel) {
        line.innerHTML = `<span class="log-timestamp">${timestamp}</span> ${logLevel} <span class="log-message">${escapeHtml(text)}</span>`;
    } else {
        line.textContent = text;
    }
    
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

export function addTerminalTable(headers, rows) {
    const terminal = document.getElementById('terminal-output');
    const table = document.createElement('div');
    table.className = 'terminal-table';
    
    // ヘッダー
    const headerRow = document.createElement('div');
    headerRow.className = 'terminal-table-header';
    headers.forEach(h => {
        const cell = document.createElement('span');
        cell.className = 'terminal-table-cell';
        cell.textContent = h;
        headerRow.appendChild(cell);
    });
    table.appendChild(headerRow);
    
    // 行
    rows.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'terminal-table-row';
        row.forEach(cell => {
            const cellDiv = document.createElement('span');
            cellDiv.className = 'terminal-table-cell';
            cellDiv.textContent = cell;
            rowDiv.appendChild(cellDiv);
        });
        table.appendChild(rowDiv);
    });
    
    terminal.appendChild(table);
    terminal.scrollTop = terminal.scrollHeight;
}

// コマンド補完ヒント
function showCommandHints(partial) {
    const allCommands = [
        'help', 'ls', 'cd', 'pwd', 'cat', 'rm', 'mkdir', 'touch',
        'connect', 'disconnect', 'scan', 'porthack', 'sshcrack',
        'fileWipe', 'logMirror', 'traceBait', 'ramShield',
        'logout', 'clear', 'echo', 'history'
    ];
    
    const matching = allCommands.filter(cmd => cmd.startsWith(partial));
    
    if (matching.length > 0) {
        // TAB補完（簡易版）
        const terminalInput = document.getElementById('terminal-input');
        if (matching.length === 1) {
            terminalInput.value = matching[0] + ' ';
        } else {
            console.log('Matching commands:', matching.join(', '));
        }
    }
}

// ユーティリティ関数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ターミナルプロンプトの更新
export function updatePrompt(newPrompt) {
    const prompt = document.querySelector('.prompt');
    if (prompt) {
        prompt.textContent = newPrompt;
    }
}

// パスワード入力ダイアログ
export function requestPassword(prompt = 'Enter password: ') {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'popup-overlay';
        dialog.innerHTML = `
            <div class="popup-box">
                <div class="popup-title">PASSWORD REQUIRED</div>
                <div class="password-prompt">${prompt}</div>
                <input type="password" id="password-input" class="password-input-field" placeholder="••••••••">
                <div class="popup-buttons">
                    <button id="password-submit" class="btn-login" style="flex: 1;">SUBMIT</button>
                    <button id="password-cancel" class="btn-login" style="flex: 1;">CANCEL</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        const input = document.getElementById('password-input');
        input.focus();
        
        document.getElementById('password-submit').onclick = () => {
            const password = input.value;
            dialog.remove();
            resolve(password);
        };
        
        document.getElementById('password-cancel').onclick = () => {
            dialog.remove();
            resolve(null);
        };
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const password = input.value;
                dialog.remove();
                resolve(password);
            }
        });
    });
}

// ファイル一覧表示
export function displayFileList(files, currentDir = '/') {
    const terminal = document.getElementById('terminal-output');
    const fileList = document.createElement('div');
    fileList.className = 'file-list';
    
    // . と .. を表示
    const dotFiles = ['..', '.'];
    dotFiles.forEach(f => {
        const item = document.createElement('div');
        item.className = 'file-item directory';
        item.textContent = f;
        fileList.appendChild(item);
    });
    
    // ファイル表示
    files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';
        
        if (file.isDirectory) {
            item.classList.add('directory');
            item.textContent = `${file.name}/`;
        } else if (file.isExecutable) {
            item.classList.add('executable');
            item.textContent = `${file.name}*`;
        } else if (file.name.startsWith('.')) {
            item.classList.add('hidden');
            item.textContent = file.name;
        } else {
            item.textContent = file.name;
        }
        fileList.appendChild(item);
    });
    
    terminal.appendChild(fileList);
    terminal.scrollTop = terminal.scrollHeight;
}

// ディレクトリツリー表示
export function displayDirTree(tree, indent = 0) {
    const terminal = document.getElementById('terminal-output');
    const treeDiv = document.createElement('div');
    treeDiv.className = 'dir-tree';
    
    function renderTree(items, level = 0) {
        items.forEach((item, index) => {
            const line = document.createElement('div');
            line.className = 'tree-item';
            const prefix = '  '.repeat(level);
            const branch = index === items.length - 1 ? '└── ' : '├── ';
            
            if (item.children) {
                line.classList.add('directory');
                line.innerHTML = prefix + branch + item.name + '/';
                treeDiv.appendChild(line);
                renderTree(item.children, level + 1);
            } else {
                line.classList.add('file');
                line.innerHTML = prefix + branch + item.name;
                treeDiv.appendChild(line);
            }
        });
    }
    
    renderTree(tree);
    terminal.appendChild(treeDiv);
    terminal.scrollTop = terminal.scrollHeight;
}

export default initializeTerminal;
