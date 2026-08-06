const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logsDir, 'logger.txt');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const formatTimestamp = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
};

const formatMeta = (meta = {}) => {
    const entries = Object.entries(meta).filter(([, value]) => value !== undefined && value !== null);
    if (!entries.length) return '';

    const parts = entries.map(([key, value]) => {
        const printable = typeof value === 'object' ? JSON.stringify(value) : value;
        return `${key}: ${printable}`;
    });

    return ' - ' + parts.join(', ');
};

const write = (level, mod, message, meta) => {
    const scope = mod ? `[${mod}] ` : '';
    const line = `${formatTimestamp()} ${level.toUpperCase()} ${scope}${message}${formatMeta(meta)}`;

    fs.appendFile(logFile, line + '\n', (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });

    const consoleFn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    consoleFn(line);
};

const createLogger = (mod) => ({
    info: (message, meta) => write('info', mod, message, meta),
    warn: (message, meta) => write('warn', mod, message, meta),
    error: (message, meta) => write('error', mod, message, meta),
    debug: (message, meta) => write('debug', mod, message, meta),
    http: (message, meta) => write('http', mod, message, meta),
    child: ({ module: childMod } = {}) => createLogger(childMod || mod),
});

module.exports = createLogger(null);
