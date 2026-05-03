const fs = require('fs');

function getLuminance(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

const file = 'webapp/public/assets/logo.svg';
let content = fs.readFileSync(file, 'utf8');

let maskPaths = '';
let contentPaths = '';

const pathRegex = /<path[^>]*\/>/gi;

let newContent = content.replace(pathRegex, (match) => {
    const fillMatch = match.match(/fill="([^"]+)"/i);
    if (fillMatch && fillMatch[1].startsWith('#')) {
        const fill = fillMatch[1];
        const lum = getLuminance(fill);
        if (lum > 195) {
            maskPaths += match.replace(fillMatch[0], 'fill="black"') + '\n';
            return '';
        } else {
            contentPaths += match + '\n';
            return '';
        }
    }
    contentPaths += match + '\n';
    return '';
});

// Remove empty lines
newContent = newContent.replace(/^\s*[\r\n]/gm, '');

const svgOutput = newContent.replace('</svg>', `  <defs>
    <mask id="holeMask">
      <rect width="100%" height="100%" fill="white" />
${maskPaths}    </mask>
  </defs>
  <g mask="url(#holeMask)">
${contentPaths}  </g>
</svg>
`);

fs.writeFileSync(file, svgOutput);
console.log('SVG processed successfully.');
