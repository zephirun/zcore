const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else if (f.endsWith('.jsx')) {
            callback(dirPath);
        }
    });
}

walkDir('./src', (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    const uiImports = [];
    const importRegex = /^import (Button|Input|Select|Textarea) from '@\/components\/ui\/(Button|Input|Select|Textarea)';\r?\n?/gm;

    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const stmt = match[0].trim();
        if (!uiImports.includes(stmt)) {
            uiImports.push(stmt);
        }
    }

    if (uiImports.length > 0) {
        // Remove all occurrences
        content = content.replace(importRegex, '');

        // Add them to the very top
        content = uiImports.join('\n') + '\n\n' + content;

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed imports in: ${filePath}`);
    }
});
