import React, { useCallback } from 'react';
import Papa from 'papaparse';

const FileUpload = ({ onDataParsed }) => {
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Use header: false to handle the user's report which might lack standard headers or be positional
        Papa.parse(file, {
            encoding: "ISO-8859-1", // Fix for Portuguese accents in Excel CSV
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
                const rows = results.data;
                if (!rows || rows.length === 0) return;

                // Auto-detect format based on column count
                // Wide format (User screenshot) seems to have around 15 columns
                // Simple format (Template) has 7 columns
                const colCount = rows[0].length;

                let parsedData = [];
                // Heuristic: If > 10 columns, assume Wide Format
                if (colCount > 10) {
                    parsedData = { type: 'wide', data: rows };
                } else {
                    // Treat as standard template (might need re-parsing with header:true if we want keys, 
                    // but let's just pass the raw matrix and let processor handle it)
                    parsedData = { type: 'flat', data: rows };
                }

                onDataParsed(parsedData);
            },
            error: (error) => {
                console.error("Error parsing CSV:", error);
                alert("Erro ao ler o arquivo CSV.");
            }
        });
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#f5f5f5',
            fontFamily: 'Segoe UI'
        }}>
            <div style={{
                background: 'white',
                padding: '50px',
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center',
                maxWidth: '600px', // Wider to fit text
                width: '90%'
            }}>
                <h2 style={{ color: '#2C3E50', marginBottom: '20px' }}>Upload de Relatório</h2>
                <p style={{ color: '#7f8c8d', marginBottom: '30px' }}>
                    Você pode usar o <b>CSV Padrão</b> ou o <b>Formato Exportado</b> (Largo).
                </p>

                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                    id="csv-upload"
                />
                <label htmlFor="csv-upload" style={{
                    background: '#3498db',
                    color: 'white',
                    padding: '15px 30px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px',
                    display: 'inline-block',
                    transition: 'background 0.2s'
                }}>
                    Selecionar Arquivo CSV
                </label>

                <div style={{ marginTop: '20px', fontSize: '12px', color: '#95a5a6', textAlign: 'left' }}>
                    <p><strong>Opção 1 (Template):</strong> ID, Cliente, Vendedor, Data, Valor...</p>
                    <p><strong>Opção 2 (Exportado):</strong> Coluna A=ID, B=Vendedor, C=Cliente, D-F=Mês 1...</p>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
