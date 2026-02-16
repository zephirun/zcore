import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

const sourceFile = 'generate_structure_pdf.js';
const outputFile = 'generate_structure_pdf_CODE.pdf';

// Read the source file
const sourceCode = fs.readFileSync(sourceFile, 'utf-8');

// Create PDF
const doc = new PDFDocument({
    margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
    }
});

const stream = fs.createWriteStream(outputFile);
doc.pipe(stream);

// Title
doc.fontSize(20).font('Helvetica-Bold').text('Código Fonte: generate_structure_pdf.js', {
    align: 'center'
});

doc.moveDown();

// Metadata
doc.fontSize(10).font('Helvetica').text(`Arquivo: ${sourceFile}`, { align: 'left' });
doc.text(`Data: ${new Date().toLocaleString('pt-BR')}`, { align: 'left' });
doc.text(`Linhas: ${sourceCode.split('\n').length}`, { align: 'left' });

doc.moveDown(2);

// Divider
doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
doc.moveDown();

// Source code
doc.fontSize(9).font('Courier');

// Split code into lines and add line numbers
const lines = sourceCode.split('\n');
lines.forEach((line, index) => {
    const lineNumber = String(index + 1).padStart(3, ' ');
    doc.text(`${lineNumber} | ${line}`, {
        lineBreak: true,
        continued: false
    });
});

doc.end();

stream.on('finish', () => {
    console.log(`✅ PDF criado com sucesso: ${outputFile}`);
});

stream.on('error', (err) => {
    console.error('❌ Erro ao criar PDF:', err);
});
