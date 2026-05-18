// =============== デスクトップシステム ===============
export function initializeDesktop(app) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // タブシステム
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // タブボタンの状態更新
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // コンテンツの表示/非表示
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-${tabName}`).classList.add('active');
        });
    });
    
    // 左パネルのノートシステム
    initializeMemoryTaskbar(app);
}

function initializeMemoryTaskbar(app) {
    const quickNoteInput = document.getElementById('quick-note');
    const memoryNotes = document.getElementById('memory-notes');
    
    // メモ保存機能
    quickNoteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const noteText = quickNoteInput.value.trim();
            if (noteText) {
                addNoteToMemory(noteText, memoryNotes);
                quickNoteInput.value = '';
            }
        }
    });
    
    // 保存済みメモを復元
    const savedNotes = JSON.parse(localStorage.getItem('hackosx_notes') || '[]');
    savedNotes.forEach(note => {
        addNoteToMemory(note.text, memoryNotes, note.type);
    });
}

function addNoteToMemory(text, container, type = 'normal') {
    const noteItem = document.createElement('div');
    noteItem.className = `memory-note-item ${type === 'warning' ? 'warning' : type === 'danger' ? 'danger' : ''}`;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'memory-note-delete';
    deleteBtn.textContent = '✕';
    deleteBtn.onclick = () => {
        noteItem.remove();
        saveNotesToStorage();
    };
    
    noteItem.textContent = text;
    noteItem.appendChild(deleteBtn);
    container.appendChild(noteItem);
    
    saveNotesToStorage();
}

function saveNotesToStorage() {
    const notes = [];
    document.querySelectorAll('.memory-note-item').forEach(item => {
        notes.push({
            text: item.textContent.replace('✕', '').trim(),
            type: item.classList.contains('warning') ? 'warning' : 
                  item.classList.contains('danger') ? 'danger' : 'normal'
        });
    });
    localStorage.setItem('hackosx_notes', JSON.stringify(notes));
}

// サーバー情報表示
export function updateServerInfo(serverData) {
    const serverInfo = document.getElementById('server-info');
    if (!serverData) {
        serverInfo.innerHTML = '<p>Not connected to any server</p>';
        return;
    }
    
    serverInfo.innerHTML = `
        <p><strong>Server:</strong> ${serverData.name || 'Unknown'}</p>
        <p><strong>IP Address:</strong> ${serverData.ip}</p>
        <p><strong>OS:</strong> ${serverData.os || 'Linux'}</p>
        <p><strong>Open Ports:</strong> ${(serverData.ports || []).join(', ')}</p>
        <p><strong>Firewall:</strong> ${serverData.firewall ? 'ENABLED' : 'DISABLED'}</p>
        <p><strong>Connection Quality:</strong> ${serverData.quality || 'Normal'}</p>
    `;
}

// Web表示の更新
export function updateWebDisplay(htmlContent) {
    const webDisplay = document.getElementById('web-display');
    webDisplay.innerHTML = htmlContent || '<p>No content to display</p>';
}

// ネットワークマップの初期化は network-map.js で行う

// タブ切り替え関数
export function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    tabContents.forEach(content => {
        if (content.id === `tab-${tabName}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// 設定パネルの初期化
export function initializeSettings(app) {
    const settingsContent = document.getElementById('settings-content');
    
    settingsContent.innerHTML = `
        <div style="font-size: 11px; color: var(--color-text-primary); line-height: 1.8;">
            <h3 style="color: var(--color-accent); margin-bottom: 15px;">System Settings</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; color: var(--color-text-secondary);">
                    <input type="checkbox" id="setting-autoconnect"> Auto-Connect to known servers
                </label>
                <label style="display: block; margin-bottom: 5px; color: var(--color-text-secondary);">
                    <input type="checkbox" id="setting-logs" checked> Enable detailed logs
                </label>
                <label style="display: block; margin-bottom: 5px; color: var(--color-text-secondary);">
                    <input type="checkbox" id="setting-sounds"> Enable sound effects
                </label>
            </div>
            
            <div style="margin-bottom: 15px;">
                <p style="color: var(--color-text-secondary); margin-bottom: 5px;">Theme:</p>
                <select id="theme-select" style="background-color: var(--color-bg-darker); border: 1px solid var(--color-text-secondary); color: var(--color-text-primary); padding: 5px; font-family: var(--font-family);">
                    <option>Dark (Default)</option>
                    <option>Darker</option>
                    <option>Matrix Green</option>
                </select>
            </div>
            
            <button onclick="window.hackosApp.saveGameState()" style="width: 100%; padding: 10px; background-color: var(--color-bg-darker); border: 1px solid var(--color-text-secondary); color: var(--color-text-primary); cursor: pointer;">
                SAVE GAME
            </button>
            <button onclick="window.hackosApp.loadSaveData()" style="width: 100%; padding: 10px; margin-top: 5px; background-color: var(--color-bg-darker); border: 1px solid var(--color-text-secondary); color: var(--color-text-primary); cursor: pointer;">
                LOAD GAME
            </button>
        </div>
    `;
}

// グローバル UI 更新関数
export function updateStatusBar() {
    const app = window.hackosApp;
    if (!app) return;
    
    // デバイス情報の取得
    navigator.storage?.estimate?.().then(estimate => {
        const percentUsed = Math.round((estimate.usage / estimate.quota) * 100);
        // ストレージ表示更新可能
    });
}

export default initializeDesktop;
