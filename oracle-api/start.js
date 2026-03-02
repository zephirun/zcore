/**
 * oracle-api/start.js
 * Auto Network Detector - detects LAN vs. external and configures connection accordingly.
 * Entry point called by `npm run dev` / `npm start`.
 */

require('dotenv').config();
const net = require('net');
const { execFileSync } = require('child_process');

// ─── Config ─────────────────────────────────────────────────────────────────
const LAN_HOST = '100.120.1.150';
const LAN_PORT = 1521;
const LAN_CONNECT = `${LAN_HOST}:${LAN_PORT}/viasoft_pdb.cloud`;

const EXTERNAL_HOST = '168.138.236.217';
const EXTERNAL_PORT = 1521;
const WSL_GATEWAY = '172.29.176.1';
const PROXY_CONNECT = `${WSL_GATEWAY}:${LAN_PORT}/viasoft_pdb.cloud`;

const PROBE_TIMEOUT_MS = 3000;

// ─── Network Probe ───────────────────────────────────────────────────────────
function probeTcp(host, port, timeoutMs) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        let resolved = false;

        socket.setTimeout(timeoutMs);

        socket.on('connect', () => {
            resolved = true;
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            if (!resolved) { resolved = true; socket.destroy(); resolve(false); }
        });

        socket.on('error', () => {
            if (!resolved) { resolved = true; resolve(false); }
        });

        socket.connect(port, host);
    });
}

// ─── Port Proxy Setup via PowerShell ─────────────────────────────────────────
function applyWindowsPortProxy() {
    try {
        const psCmd = [
            // Add port proxy rule (idempotent — safe to run multiple times)
            `netsh interface portproxy add v4tov4 listenport=${LAN_PORT} listenaddress=${WSL_GATEWAY} connectport=${EXTERNAL_PORT} connectaddress=${EXTERNAL_HOST}`,
            // Ensure firewall rule exists
            `netsh advfirewall firewall add rule name="Oracle OCI Port (WSL2)" dir=in action=allow protocol=TCP localport=${LAN_PORT}`,
        ].join('; ');

        execFileSync('powershell.exe', ['-Command', psCmd], { stdio: 'pipe' });
        console.log('🔧 Windows port proxy applied successfully.');
    } catch (err) {
        console.warn('⚠️  Could not apply Windows port proxy (not running in WSL2?):', err.message);
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function detectAndStart() {
    console.log('🔍 Detecting network mode...');

    const lanReachable = await probeTcp(LAN_HOST, LAN_PORT, PROBE_TIMEOUT_MS);

    if (lanReachable) {
        // ── LAN Mode ──────────────────────────────────────────────────────────
        console.log(`🏠 LAN Mode detected — using internal IP (${LAN_HOST})`);
        process.env.DB_CONNECT_STRING = LAN_CONNECT;
        process.env.DB_MADVILLE_CONNECT = LAN_CONNECT;
        process.env.DB_MODE = 'lan';
    } else {
        // ── External / Proxy Mode ─────────────────────────────────────────────
        console.log(`🌐 External Mode — LAN unreachable, activating WSL2 proxy...`);
        applyWindowsPortProxy();
        process.env.DB_CONNECT_STRING = PROXY_CONNECT;
        process.env.DB_MADVILLE_CONNECT = PROXY_CONNECT;
        process.env.DB_MODE = 'proxy';
    }

    // Delegate to main API
    require('./index.js');
}

detectAndStart();
