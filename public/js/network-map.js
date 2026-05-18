// =============== ネットワークマップシステム ===============
export function initializeNetworkMap(app) {
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    
    // キャンバスサイズ調整
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // ネットワークデータ
    const networkState = {
        nodes: [],
        connections: [],
        zoom: 1,
        pan: { x: 0, y: 0 },
        dragging: false,
        draggedNode: null
    };
    
    // ローカルノード追加
    const localNode = {
        id: 'local',
        ip: app.user.ip,
        name: 'Your PC',
        type: 'local',
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 30,
        color: '#00aaff',
        connected: true
    };
    networkState.nodes.push(localNode);
    
    // マウスイベント
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // ノードをクリック
        networkState.nodes.forEach(node => {
            if (distance(x, y, node.x, node.y) < node.radius) {
                networkState.dragging = true;
                networkState.draggedNode = node;
            }
        });
    });
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (networkState.dragging && networkState.draggedNode) {
            networkState.draggedNode.x = x;
            networkState.draggedNode.y = y;
            drawNetworkMap(ctx, canvas, networkState, app);
        }
    });
    
    canvas.addEventListener('mouseup', () => {
        networkState.dragging = false;
        networkState.draggedNode = null;
    });
    
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // ノードをクリック
        networkState.nodes.forEach(node => {
            if (distance(x, y, node.x, node.y) < node.radius) {
                handleNodeClick(node, app);
            }
        });
    });
    
    // リサイズ対応
    window.addEventListener('resize', () => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawNetworkMap(ctx, canvas, networkState, app);
    });
    
    // 初回描画
    drawNetworkMap(ctx, canvas, networkState, app);
    
    // アプリケーションに参照を保持
    app.networkState = networkState;
}

function drawNetworkMap(ctx, canvas, state, app) {
    // 背景をクリア
    ctx.fillStyle = '#050a15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // グリッド線
    drawGrid(ctx, canvas);
    
    // 接続線を先に描画
    ctx.strokeStyle = '#00aa00';
    ctx.lineWidth = 1;
    state.connections.forEach(conn => {
        const from = state.nodes.find(n => n.id === conn.from);
        const to = state.nodes.find(n => n.id === conn.to);
        if (from && to) {
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }
    });
    
    // ノードを描画
    state.nodes.forEach(node => {
        drawNode(ctx, node);
    });
    
    // ノードラベル
    ctx.fillStyle = '#00ff00';
    ctx.font = '11px Courier New';
    ctx.textAlign = 'center';
    state.nodes.forEach(node => {
        ctx.fillText(node.name, node.x, node.y + node.radius + 15);
        ctx.fillText(node.ip, node.x, node.y + node.radius + 28);
    });
}

function drawNode(ctx, node) {
    // ノード本体
    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // グロー効果
    if (node.connected) {
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowColor = 'transparent';
    } else {
        ctx.strokeStyle = '#005500';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // ノード内のアイコン
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    if (node.type === 'local') {
        ctx.fillText('⊙', node.x, node.y);
    } else if (node.type === 'connected') {
        ctx.fillText('✓', node.x, node.y);
    } else {
        ctx.fillText('?', node.x, node.y);
    }
}

function drawGrid(ctx, canvas) {
    const gridSize = 50;
    ctx.strokeStyle = '#002200';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function handleNodeClick(node, app) {
    if (node.type === 'local') {
        console.log('Local node selected');
        return;
    }
    
    // クリックでconnectコマンドを実行
    const terminalInput = document.getElementById('terminal-input');
    terminalInput.value = `connect ${node.ip}`;
    terminalInput.focus();
}

// ネットワークノード追加
export function addNetworkNode(app, ip, name, type = 'unconnected') {
    const canvas = document.getElementById('network-canvas');
    const newNode = {
        id: ip,
        ip: ip,
        name: name,
        type: type,
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        radius: type === 'local' ? 30 : 20,
        color: type === 'connected' ? '#00ff00' : '#005500',
        connected: type === 'connected'
    };
    
    if (app.networkState) {
        app.networkState.nodes.push(newNode);
        redrawNetwork(app);
    }
}

// ネットワーク再描画
export function redrawNetwork(app) {
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    if (app.networkState) {
        drawNetworkMap(ctx, canvas, app.networkState, app);
    }
}

// スキャン結果をネットワークに追加
export function addScanResults(app, nodes) {
    nodes.forEach(node => {
        addNetworkNode(app, node.ip, node.name, 'unconnected');
    });
    redrawNetwork(app);
}

// ノード接続状態更新
export function updateNodeConnection(app, ip, connected) {
    if (app.networkState) {
        const node = app.networkState.nodes.find(n => n.ip === ip);
        if (node) {
            node.connected = connected;
            node.type = connected ? 'connected' : 'unconnected';
            node.color = connected ? '#00ff00' : '#005500';
            redrawNetwork(app);
        }
    }
}

export default initializeNetworkMap;
