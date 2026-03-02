import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';

import React, { useState } from 'react';

import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const DataUpload = () => {
    const { saveReportData, salesData, clearData, activeUnit, AVAILABLE_UNITS } = useData();
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

    const handleDownloadBackup = () => {
        if (!salesData || salesData.length === 0) {
            setUploadStatus({ message: "Não há dados para salvar nesta unidade.", type: 'error' });
            return;
        }
        const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
            JSON.stringify(salesData)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `backup_${activeUnit}_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
    };

    const handleRestoreBackup = (e) => {
        const fileReader = new FileReader();
        if (e.target.files && e.target.files[0]) {
            fileReader.readAsText(e.target.files[0], "UTF-8");
            fileReader.onload = async (event) => {
                try {
                    const parsedData = JSON.parse(event.target.result);
                    if (Array.isArray(parsedData)) {
                        await saveReportData(parsedData);
                        setUploadStatus({ message: "Backup JSON restaurado com sucesso!", type: 'success' });
                    } else {
                        setUploadStatus({ message: "Arquivo de backup inválido.", type: 'error' });
                    }
                } catch (error) {
                    console.error(error);
                    setUploadStatus({ message: "Erro ao ler o arquivo de backup.", type: 'error' });
                }
            };
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
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <PageContainer maxWidth="800px" title="Central de Importação" subtitle="Importação de dados oficiais para alimentação dos módulos estratégicos.">

                {uploadStatus.message && (
                    <div style={{
                        padding: 'var(--space-4) var(--space-5)',
                        borderRadius: 'var(--space-4)',
                        marginBottom: 'var(--space-6)',
                        background: uploadStatus.type === 'success' ? 'rgba(34, 197, 94, 0.08)' : uploadStatus.type === 'error' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-card)',
                        color: uploadStatus.type === 'success' ? 'var(--color-success)' : uploadStatus.type === 'error' ? 'var(--color-error)' : 'var(--text-main)',
                        border: `1px solid ${uploadStatus.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : uploadStatus.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'var(--border-color)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        animation: 'slideDown 0.3s ease-out'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: uploadStatus.type === 'success' ? 'var(--color-success)' : uploadStatus.type === 'error' ? 'var(--color-error)' : 'var(--bg-input)',
                            color: 'white'
                        }}>
{uploadStatus.type === 'success' ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            )}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 'var(--font-bold)' }}>{uploadStatus.message}</span>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-4)' }}>
                    {uploadOptions.map(option => (
                        <Card key={option.id} padding="var(--space-8)" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-4)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
<div style={{
                                    width: 'var(--space-16)',
                                    height: 'var(--space-16)',
                                    borderRadius: 'var(--space-4)',
                                    background: 'var(--bg-input)',
                                    color: 'var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: 'var(--shadow-sm)'
                                }}>
{option.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-extrabold)', color: 'var(--text-main)', marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>{option.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', maxWidth: '400px' }}>{option.description}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    onClick={() => navigate(option.targetPage)}
                                    style={{
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 'var(--font-bold)',
                                        color: 'var(--color-primary)'
                                    }}
                                >
                                    Abrir Módulo &rarr;
                                </Button>
                            </div>

                            <div style={{
                                padding: 'var(--space-8)',
                                border: '2px dashed var(--border-color)',
                                borderRadius: 'var(--space-5)',
                                background: 'var(--bg-main)44',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 'var(--space-4)',
                                position: 'relative',
                                transition: 'all 0.2s ease'
                            }}>
<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ opacity: 0.3 }}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>

                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>
                                        {isProcessing ? 'Enviando...' : 'Arraste seu arquivo CSV ou clique abaixo'}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-medium)' }}>
                                        Formatos aceitos: .csv (separado por ponto e vírgula)
                                    </div>
                                </div>

                                <div style={{ position: 'relative', width: '240px', marginTop: 'var(--space-2)' }}>
                                    <Input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileUpload}
                                        disabled={isProcessing}
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            opacity: 0,
                                            cursor: 'pointer',
                                            zIndex: 1
                                        }}
                                    />
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        disabled={isProcessing}
                                        style={{ pointerEvents: 'none' }}
                                    >
                                        Selecionar Arquivo
                                    </Button>
                                </div>
                            </div>

                            <div style={{ padding: 'var(--space-6)', background: 'var(--bg-input)', borderRadius: 'var(--space-4)', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
<div>
                                        <h4 style={{ fontSize: '13px', fontWeight: 'var(--font-extrabold)', color: 'var(--text-main)', margin: 0 }}>Backup & Restauração Local</h4>
                                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Exportar ou importar banco de dados em formato JSON.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
<Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleDownloadBackup}
                                            style={{ fontSize: 'var(--text-xs)' }}
                                        >
                                            Exportar JSON
                                        </Button>
                                        <div style={{ position: 'relative' }}>
                                            <Button variant="secondary" size="sm" style={{ pointerEvents: 'none', fontSize: 'var(--text-xs)' }}>
                                                Restaurar JSON
                                            </Button>
                                            <Input
                                                type="file"
                                                accept=".json"
                                                onChange={handleRestoreBackup}
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', padding: 0 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0 0 var(--space-4) 0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
<div style={{ width: 'var(--space-2)', height: 'var(--space-2)', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'var(--font-semibold)' }}>
                                            Unidade: <span style={{ color: 'var(--text-main)' }}>{AVAILABLE_UNITS.find(u => u.id === activeUnit)?.name}</span>
                                        </span>
                                    </div>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={handleClearData}
                                        style={{ opacity: 0.8, fontSize: 'var(--text-xs)' }}
                                    >
                                        Limpar Base de Dados
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </PageContainer>
        </div>
    );
};

export default DataUpload;
