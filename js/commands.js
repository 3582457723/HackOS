// =============== コマンド実行エンジン ===============
import { addTerminalLine, displayFileList, displayDirTree } from './terminal.js';

export async function executeCommand(commandString, app) {
    const parts = commandString.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    try {
        switch(cmd) {
            // =============== ファイルシステム ===============
            case 'ls':
                return handleLS(args);
            case 'cd':
                return handleCD(args, app);
            case 'pwd':
                return handlePWD(app);
            case 'cat':
                return handleCAT(args);
            case 'echo':
                return handleECHO(args);
            case 'mkdir':
                return handleMKDIR(args);
            case 'touch':
                return handleTOUCH(args);
            case 'rm':
                return handleRM(args);
            case 'cp':
                return handleCP(args);
            case 'mv':
                return handleMV(args);
            case 'find':
                return handleFIND(args);
            case 'grep':
                return handleGREP(args);
            case 'head':
                return handleHEAD(args);
            case 'tail':
                return handleTAIL(args);
            case 'wc':
                return handleWC(args);
            case 'sort':
                return handleSORT(args);
            
            // =============== システム情報 ===============
            case 'whoami':
                return `${app.user.username}`;
            case 'hostname':
                return 'hackosx';
            case 'uname':
                return 'Linux hackosx 5.19.0-generic #1 SMP x86_64 GNU/Linux';
            case 'uptime':
                return 'up 2 days, 3 hours, 14 minutes';
            case 'date':
                return new Date().toString();
            case 'df':
                return handleDF();
            case 'top':
                return handleTOP();
            case 'ps':
                return handlePS();
            case 'free':
                return handleFREE();
            
            // =============== ネットワーク ===============
            case 'ifconfig':
                return handleIFCONFIG(app);
            case 'ping':
                return handlePING(args);
            case 'netstat':
                return handleNETSTAT();
            case 'traceroute':
                return handleTRACEROUTE(args);
            
            // =============== HackOS専用コマンド ===============
            case 'connect':
                return handleCONNECT(args, app);
            case 'disconnect':
                return handleDISCONNECT(app);
            case 'scan':
                return handleSCAN(app);
            case 'deepscan':
                return handleDEEPSCAN(app);
            case 'porthack':
                return handlePORTHACK(args, app);
            case 'sshcrack':
                return handleSSHCRACK(args, app);
            case 'replace':
                return handleREPLACE(args, app);
            case 'fileWipe':
                return handleFILEWIPE(args);
            case 'logmirror':
                return handleLOGMIRROR(app);
            case 'emergencyflush':
                return handleEMERGENCYFLUSH(app);
            
            // =============== その他 ===============
            case 'help':
                return handleHELP();
            case 'clear':
                document.getElementById('terminal-output').innerHTML = '';
                return null;
            case 'history':
                return handleHISTORY();
            case 'logout':
                return handleLOGOUT(app);
            case 'exit':
                return handleLOGOUT(app);
            case 'sudo':
                return 'sudo: command not found';
            case '':
                return null;
            
            default:
                return `Command not found: ${cmd}`;
        }
    } catch (error) {
        return `Error: ${error.message}`;
    }
}

// =============== ファイルシステムコマンド ===============
function handleLS(args) {
    // 仮想ファイルシステム
    const files = [
        { name: 'bin', isDirectory: true },
        { name: 'boot', isDirectory: true },
        { name: 'etc', isDirectory: true },
        { name: 'home', isDirectory: true },
        { name: 'log', isDirectory: true },
        { name: 'sys', isDirectory: true },
        { name: '.bashrc', isHidden: true },
        { name: 'README.txt', size: '2.5K' }
    ];
    
    displayFileList(files);
    return null;
}

function handleCD(args, app) {
    if (!args[0]) return 'Usage: cd [directory]';
    app.currentDir = args[0];
    return null;
}

function handlePWD(app) {
    return app.currentDir || '/home/user';
}

function handleCAT(args) {
    if (!args[0]) return 'Usage: cat [file]';
    // ファイル内容の模擬
    const fileContents = {
        'README.txt': 'HackOS - A hacking simulator\nVersion 1.0-ALPHA\n\nWelcome to HackOS!',
        '.bashrc': '# Bash configuration\nexport PATH=/usr/local/bin:$PATH\nalias ll="ls -la"'
    };
    return fileContents[args[0]] || `cat: ${args[0]}: No such file or directory`;
}

function handleECHO(args) {
    return args.join(' ');
}

function handleMKDIR(args) {
    if (!args[0]) return 'Usage: mkdir [directory]';
    return `mkdir: created directory '${args[0]}'`;
}

function handleTOUCH(args) {
    if (!args[0]) return 'Usage: touch [file]';
    return `touch: created file '${args[0]}'`;
}

function handleRM(args) {
    if (!args[0]) return 'Usage: rm [file]';
    return `rm: removed '${args[0]}'`;
}

function handleCP(args) {
    if (args.length < 2) return 'Usage: cp [source] [dest]';
    return `cp: copied '${args[0]}' to '${args[1]}'`;
}

function handleMV(args) {
    if (args.length < 2) return 'Usage: mv [source] [dest]';
    return `mv: moved '${args[0]}' to '${args[1]}'`;
}

function handleFIND(args) {
    return 'find: searching filesystem... (simulated)';
}

function handleGREP(args) {
    if (args.length < 1) return 'Usage: grep [pattern] [file]';
    return 'grep: matching lines found (simulated)';
}

function handleHEAD(args) {
    return 'First 10 lines of file (simulated)';
}

function handleTAIL(args) {
    return 'Last 10 lines of file (simulated)';
}

function handleWC(args) {
    return '123 456 7890 [file]';
}

function handleSORT(args) {
    return 'sorted output (simulated)';
}

// =============== システムコマンド ===============
function handleDF() {
    let output = 'Filesystem     Size   Used  Avail Use%  Mounted on\n';
    output += '/dev/sda1     2.0T   1.2T  800G  60%   /\n';
    output += 'tmpfs         16G    2.1G  14G   13%   /dev/shm';
    return output;
}

function handleTOP() {
    return 'top - not implemented (use ps instead)';
}

function handlePS() {
    let output = 'PID   COMMAND\n';
    output += '1     systemd\n';
    output += '245   sshd\n';
    output += '1234  x-server\n';
    output += '5678  hackosx';
    return output;
}

function handleFREE() {
    let output = '              total        used        free\n';
    output += 'Mem:       32768000    8388608   24379392\n';
    output += 'Swap:       8388608          0    8388608';
    return output;
}

// =============== ネットワークコマンド ===============
function handleIFCONFIG(app) {
    let output = `eth0: flags=UP,BROADCAST,RUNNING\n`;
    output += `      inet ${app.currentIP}  netmask 255.255.255.0\n`;
    output += `      RX packets: 1234567  TX packets: 987654\n`;
    output += `      RX bytes: 2147483648  TX bytes: 1073741824`;
    return output;
}

function handlePING(args) {
    if (!args[0]) return 'Usage: ping [host]';
    return `Pinging ${args[0]}: response from ${args[0]}: bytes=32 time<1ms`;
}

function handleNETSTAT() {
    let output = 'Active Internet connections\n';
    output += 'Proto LocalAddr    ForeignAddr     State\n';
    output += 'tcp   127.0.0.1:80 ESTABLISHED';
    return output;
}

function handleTRACEROUTE(args) {
    if (!args[0]) return 'Usage: traceroute [host]';
    return `Tracing route to ${args[0]}\n1  gateway (192.168.1.1) 5ms\n2  isp.net (203.0.113.1) 20ms`;
}

// =============== HackOS専用コマンド ===============
function handleCONNECT(args, app) {
    if (!args[0]) return 'Usage: connect [IP]';
    const ip = args[0];
    app.currentIP = ip;
    app.currentServer = ip;
    addTerminalLine(`[!] Attempting connection to ${ip}...`, 'warning');
    addTerminalLine(`[+] Connection established!`, 'success');
    return null;
}

function handleDISCONNECT(app) {
    app.currentIP = '127.0.0.1';
    app.currentServer = null;
    return 'Disconnected from server';
}

function handleSCAN(app) {
    addTerminalLine('[*] Scanning network...', 'info');
    // ネットワークノードを生成
    const nodes = [
        { ip: '192.168.1.1', name: 'Gateway', ports: [22, 80] },
        { ip: '192.168.1.50', name: 'Server1', ports: [80, 443] },
        { ip: '192.168.1.100', name: 'Database', ports: [3306] }
    ];
    nodes.forEach(node => {
        addTerminalLine(`[+] Found: ${node.name} (${node.ip}) - Open ports: ${node.ports.join(', ')}`, 'success');
    });
    app.gameState.networkNodes = nodes;
    return null;
}

function handleDEEPSCAN(app) {
    addTerminalLine('[*] Running deep scan...', 'warning');
    addTerminalLine('[+] Backdoor detected at 192.168.1.200', 'danger');
    return null;
}

function handlePORTHACK(args, app) {
    if (!args[0]) return 'Usage: porthack [port]';
    const port = parseInt(args[0]);
    const validPorts = {
        80: 'webserverworm',
        443: 'ssldeployer',
        22: 'sshcrack',
        21: 'ftpbounce',
        25: 'smtpoverflow',
        110: 'popbounce',
        1433: 'sqlbufferoverflow'
    };
    
    if (validPorts[port]) {
        return `Port ${port} successfully exploited (${validPorts[port]})`;
    }
    return `Port ${port} not open or service not detected`;
}

function handleSSHCRACK(args, app) {
    if (!args[0]) return 'Usage: sshcrack [target_ip]';
    addTerminalLine(`[*] Attempting SSH brute-force on ${args[0]}...`, 'info');
    addTerminalLine(`[+] Password found: admin:password123`, 'success');
    return null;
}

function handleREPLACE(args, app) {
    if (args.length < 3) return 'Usage: replace [file] "[old]" "[new]"';
    return `File '${args[0]}' modified successfully`;
}

function handleFILEWIPE(args) {
    if (!args[0]) return 'Usage: fileWipe [file]';
    return `File '${args[0]}' securely erased (3-pass DOD 5220.22-M)`;
}

function handleLOGMIRROR(app) {
    return '[+] Connection logs replaced with decoy logs';
}

function handleEMERGENCYFLUSH(app) {
    app.currentIP = '127.0.0.1';
    document.getElementById('desktop').classList.add('hidden');
    return null;
}

// =============== ヘルプ ===============
function handleHELP() {
    let help = '=== HackOS COMMAND REFERENCE ===\n\n';
    help += 'FILE SYSTEM:\n';
    help += '  ls, cd, pwd, cat, mkdir, touch, rm, cp, mv\n\n';
    help += 'SYSTEM:\n';
    help += '  whoami, hostname, uname, uptime, date, df, ps\n\n';
    help += 'HACKING:\n';
    help += '  connect [IP], disconnect, scan, porthack [port], sshcrack [IP]\n';
    help += '  replace [file] "[old]" "[new]", fileWipe [file]\n\n';
    help += 'OTHER:\n';
    help += '  help, clear, history, logout';
    return help;
}

function handleHISTORY() {
    return 'Command history: (simulated)\n  connect 192.168.1.50\n  scan';
}

function handleLOGOUT(app) {
    localStorage.setItem('hackosx_gamestate', JSON.stringify(app.gameState));
    window.location.reload();
    return null;
}

export default executeCommand;
