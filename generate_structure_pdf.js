
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, 'Project_Structure.pdf');

// Directories/Files to ignore
const IGNORE = [
    'node_modules',
    '.git',
    'dist',
    '.DS_Store',
    'package-lock.json',
    'Project_Structure.pdf',
    '.gemini' // keeping artifacts related to gemini/antigravity out of the generic structure if present in root
];

function getStructure(dir, prefix = '') {
    let output = '';
    let items;
    try {
        items = fs.readdirSync(dir);
    } catch (e) {
        return `${prefix}[Error reading dir]\n`;
    }

    // Filter ignored items
    items = items.filter(item => !IGNORE.includes(item));

    items.forEach((item, index) => {
        const isLast = index === items.length - 1;
        const fullPath = path.join(dir, item);
        const stats = fs.statSync(fullPath);

        const connector = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        output += `${prefix}${connector}${item}\n`;

        if (stats.isDirectory()) {
            output += getStructure(fullPath, prefix + childPrefix);
        }
    });

    return output;
}

const doc = new PDFDocument();
const stream = fs.createWriteStream(outputFile);

doc.pipe(stream);

doc.fontSize(18).text('Project Structure', { align: 'center' });
doc.moveDown();
doc.fontSize(12).text(`Root: ${projectRoot}`);
doc.moveDown();
doc.font('Courier').fontSize(10);

const structure = getStructure(projectRoot);
// Handle potential large output by splitting or just letting pdfkit handle pagination (which it does automatically for text)
doc.text(structure);

doc.end();

stream.on('finish', () => {
    console.log(`PDF created successfully at: ${outputFile}`);
});
