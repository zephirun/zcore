import React, { useState } from 'react';

import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const DataUpload = () => {
    const { saveReportData, clearData, activeUnit, AVAILABLE_UNITS } = useData();
    const navigate = useNavigate();
    const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsProcessing(true);
        setUploadStatus({ message: 'Processando arquivo...', type: 'info' });

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r?\n/);
                const parsedData = [];

                // Helper to parse line respecting quotes
                const parseLine = (line) => {
                    const result = [];
                    let current = '';
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ';' && !inQuotes) {
                            result.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    result.push(current.trim());
                    return result;
                };

                // Helper: remove quotes, trim, collapse spaces (including NBSP), force Uppercase
                const cleanStr = (s) => {
                    if (!s) return '';
                    return s.replace(/^"|"$/g, '') // Remove quotes
                        .replace(/[\s\u00A0]+/g, ' ') // Collapse spaces + NBSP to single space
                        .trim()
                        .toUpperCase(); // Force Uppercase for matching
                };

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const cols = parseLine(line);

                    // Header Detection
                    if (i === 0) {
                        const firstCol = cols[0] ? cleanStr(cols[0]) : '';
                        const headerKeywords = ['ID', 'COD', 'CODIGO', 'CÓDIGO', 'CLIENTE', 'VENDEDOR'];
                        const isHeader = headerKeywords.some(kw => firstCol === kw);
                        const isNumericId = /^\d+$/.test(firstCol);

                        if ((isHeader || firstCol.startsWith('COD')) && !isNumericId) {
                            console.log('[CSV Import] Skipping header row:', line);
                            continue;
                        }
                    }

                    if (cols.length < 13) continue;

                    const clientId = cleanStr(cols[0]);
                    const clientNameRaw = cleanStr(cols[3]);
                    const vendorNameRaw = cleanStr(cols[1]);

                    // Skip summary rows or empty rows
                    if (!clientId || clientId === 'TOTAL' || clientId === 'SOMA' || clientNameRaw === 'TOTAL' || vendorNameRaw === 'TOTAL') {
                        console.log('[CSV Import] Skipping summary or invalid row:', line);
                        continue;
                    }

                    const parseNum = (str) => {
                        if (!str) return 0;
                        let cleaned = str.replace(/[^\d.,-]/g, '');
                        if (cleaned.includes(',') && (!cleaned.includes('.') || cleaned.indexOf(',') > cleaned.indexOf('.'))) {
                            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
                        }
                        return parseFloat(cleaned) || 0;
                    };

                    const months = [
                        {
                            amount: parseNum(cols[4]),
                            margin_percent: parseNum(cols[5]),
                            deadline: parseNum(cols[6])
                        },
                        {
                            amount: parseNum(cols[7]),
                            margin_percent: parseNum(cols[8]),
                            deadline: parseNum(cols[9])
                        },
                        {
                            amount: parseNum(cols[10]),
                            margin_percent: parseNum(cols[11]),
                            deadline: parseNum(cols[12])
                        }
                    ];

                    const totalAmount = months.reduce((sum, m) => sum + m.amount, 0);
                    const totalMarginRev = months.reduce((sum, m) => sum + (m.amount * m.margin_percent), 0);
                    const totalDeadlineSum = months.reduce((sum, m) => sum + m.deadline, 0);
                    const activeMonths = months.filter(m => m.amount > 0).length;

                    // DEBUG: Specific check for DIVINIZE
                    if (cols[2] && cols[2].toUpperCase().includes('DIVINIZE') || cols[1] && cols[1].toUpperCase().includes('DIVINIZE')) {
                        console.log('--- DEBUG DIVINIZE (DataUpload) ---');
                        console.log('Row Index:', i);
                        console.log('Col 1 (Vendor?):', cols[1]);
                        console.log('Col 2 (Client?):', cols[2]);
                        console.log('Assigned Client Name:', cleanStr(cols[2]));
                        console.log('Assigned Vendor:', cleanStr(cols[1]));
                        console.log('----------------------');
                    }

                    parsedData.push({
                        client: {
                            id: cleanStr(cols[0]),
                            name: cleanStr(cols[3]),   // CLIENT is col 3
                            vendor: cleanStr(cols[1]),  // VENDOR is col 1
                            representative: cleanStr(cols[2]) // REPRESENTATIVE is col 2
                        },
                        months: months,
                        total: {
                            amount: totalAmount,
                            margin_percent: totalAmount ? totalMarginRev / totalAmount : 0,
                            deadline: activeMonths ? totalDeadlineSum / activeMonths : 0
                        }
                    });
                }

                if (parsedData.length === 0) {
                    throw new Error('Nenhum dado válido encontrado. Verifique o formato do arquivo.');
                }

                const payloadSize = JSON.stringify(parsedData).length;
                console.log(`[Upload Debug] Payload Size: ${(payloadSize / 1024 / 1024).toFixed(2)} MB`);
                if (payloadSize > 5 * 1024 * 1024) {
                    alert('Atenção: Arquivo muito grande (>5MB). O upload pode falhar.');
                }

                await saveReportData(parsedData);
                setUploadStatus({ message: `Sucesso! ${parsedData.length} registros carregados com sucesso!`, type: 'success' });
            } catch (error) {
                console.error(error);
                setUploadStatus({ message: 'Erro ao processar arquivo: ' + error.message, type: 'error' });
            } finally {
                setIsProcessing(false);
                e.target.value = ''; // Reset input
            }
        };
        reader.readAsText(file, 'ISO-8859-1'); // Correct encoding for Brazilian CSVs
    };

    const handleClearData = async () => {
        if (window.confirm('Tem certeza que deseja limpar todos os dados desta unidade?')) {
            await clearData();
            setUploadStatus({ message: 'Dados da unidade limpos com sucesso.', type: 'success' });
        }
    };

    const uploadOptions = [
        {
            id: 'sales-analysis',
            title: 'Faturamento Trimestral',
            description: 'Envie o CSV com dados de clientes, faturamento, margem e prazo.',
            targetPage: '/sales/dashboard',
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            )
        }
        // Add more upload types here as needed
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f1f5f9' }}>


            <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Upload de Dados</h1>
                    <p style={{ color: '#64748b' }}>Central de importação de arquivos para alimentação dos módulos.</p>
                </div>

                {uploadStatus.message && (
                    <div style={{
                        padding: '16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        background: uploadStatus.type === 'success' ? '#f0fdf4' : uploadStatus.type === 'error' ? '#fef2f2' : '#eff6ff',
                        color: uploadStatus.type === 'success' ? '#15803d' : uploadStatus.type === 'error' ? '#b91c1c' : '#1d4ed8',
                        border: `1px solid ${uploadStatus.type === 'success' ? '#bbf7d0' : uploadStatus.type === 'error' ? '#fecaca' : '#bfdbfe'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        {uploadStatus.type === 'success' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        )}
                        <span style={{ fontWeight: '500' }}>{uploadStatus.message}</span>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                    {uploadOptions.map(option => (
                        <div key={option.id} style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '32px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '24px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '12px',
                                    background: '#eff6ff',
                                    color: '#2563eb',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {option.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>{option.title}</h3>
                                    <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{option.description}</p>
                                </div>
                                <button
                                    onClick={() => navigate(option.targetPage)}
                                    style={{
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        background: '#f8fafc',
                                        border: '1px solid #e2e8f0',
                                        color: '#64748b',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                                >
                                    Ver Módulo
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </button>
                            </div>

                            <div style={{
                                height: '1px',
                                background: '#f1f5f9'
                            }}></div>

                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        disabled={isProcessing}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            opacity: 0,
                                            cursor: 'pointer'
                                        }}
                                    />
                                    <div style={{
                                        padding: '14px',
                                        background: '#2563eb',
                                        color: 'white',
                                        borderRadius: '10px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        transition: 'all 0.2s',
                                        opacity: isProcessing ? 0.7 : 1
                                    }}>
                                        {isProcessing ? 'Enviando...' : 'Selecionar Arquivo CSV'}
                                    </div>
                                </div>

                                <button
                                    onClick={handleClearData}
                                    style={{
                                        padding: '14px 20px',
                                        borderRadius: '10px',
                                        background: 'transparent',
                                        border: '1px solid #ef4444',
                                        color: '#ef4444',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    Limpar Dados
                                </button>
                            </div>

                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
                                <p style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
                                    Unidade Ativa: <strong>{AVAILABLE_UNITS.find(u => u.id === activeUnit)?.name}</strong>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DataUpload;
