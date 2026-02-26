const fs = require('fs');
const path = require('path');

const UI_COMPONENTS = {
    button: 'Button',
    input: 'Input',
    select: 'Select',
    textarea: 'Textarea'
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else if (f.endsWith('.jsx')) {
            callback(dirPath);
        }
    });
}

const folders = ['./src/pages', './src/components'];

folders.forEach(folder => {
    walkDir(folder, (filePath) => {
        // Skip UI base components
        if (filePath.includes('/components/ui/')) return;

        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;

        let importsToAdd = new Set();

        Object.entries(UI_COMPONENTS).forEach(([tag, component]) => {
            const openTagRegex = new RegExp(`<${tag}(\\s|>)`, 'g');
            const closeTagRegex = new RegExp(`</${tag}>`, 'g');

            // Avoid adding import if there's already a component imported with that name
            const alreadyHasImport = new RegExp(`import\\s+.*?\\b${component}\\b.*?\\s+from`, 'g').test(content);

            if (openTagRegex.test(content)) {
                if (!alreadyHasImport) {
                    importsToAdd.add(component);
                }

                content = content.replace(new RegExp(`<${tag}\\b`, 'g'), `<${component}`);
                content = content.replace(closeTagRegex, `</${component}>`);
            }
        });

        if (content !== originalContent) {
            if (importsToAdd.size > 0) {
                const importStatements = Array.from(importsToAdd).map(c => `import ${c} from '@/components/ui/${c}';`).join('\n');
                const lastImportIndex = content.lastIndexOf('import ');
                if (lastImportIndex !== -1) {
                    const endOfLastImport = content.indexOf('\n', lastImportIndex);
                    content = content.slice(0, endOfLastImport + 1) + importStatements + '\n' + content.slice(endOfLastImport + 1);
                } else {
                    content = importStatements + '\n\n' + content;
                }
            }
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Refactored: ${filePath}`);
        }
    });
});
