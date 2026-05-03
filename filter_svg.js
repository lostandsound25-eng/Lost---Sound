const fs = require('fs');

function getLuminance(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

const file = 'webapp/public/assets/logo.svg';
let content = fs.readFileSync(file, 'utf8');

// Match <path ... />
content = content.replace(/<path[^>]*fill="([^"]+)"[^>]*\/>/gi, (match, fill) => {
    if (fill.startsWith('#')) {
        const lum = getLuminance(fill);
        if (lum > 195) {
            console.log('Removing path with fill', fill, 'luminance', lum);
            return ''; // Remove this path
        }
    }
    return match; // Keep this path
});

// Remove empty lines
content = content.replace(/^\s*[\r\n]/gm, '');

fs.writeFileSync(file, content);
console.log('Done filtering!');
