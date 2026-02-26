import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { fetchReturns, saveReturn, deleteReturn } from '../../services/api';

import logoGmad from '../../assets/logo.png';

const Returns = () => {
    const navigate = useNavigate();
    const { activeUnit } = useData();
    const [returns, setReturns] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filters, setFilters] = useState({
        idNota: '',
        date: '',
        issueDate: '',
        customerName: '',
        driverName: ''
    });
    const [formData, setFormData] = useState({
        idNota: '',
        date: new Date().toISOString().split('T')[0],
        issueDate: '',
        driverName: '',
        customerName: '',
        products: [
            { description: '', code: '', quantity: '' },
            { description: '', code: '', quantity: '' },
            { description: '', code: '', quantity: '' },
            { description: '', code: '', quantity: '' },
            { description: '', code: '', quantity: '' },
            { description: '', code: '', quantity: '' }
        ],
        observations: ''
    });

    // Load returns from Supabase
    useEffect(() => {
        const loadReturns = async () => {
            const data = await fetchReturns(activeUnit);
            setReturns(data);
        };
        loadReturns();
    }, [activeUnit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            idNota: '',
            date: '',
            issueDate: '',
            customerName: '',
            driverName: ''
        });
    };

    const handleProductChange = (index, field, value) => {
        const newProducts = [...formData.products];
        newProducts[index][field] = value;
        setFormData(prev => ({
            ...prev,
            products: newProducts
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const returnData = {
            ...formData,
            id: editingId,
            unit: activeUnit
        };

        const result = await saveReturn(returnData);

        if (result.success) {
            // Refresh
            const data = await fetchReturns(activeUnit);
            setReturns(data);

            // Reset form
            setFormData({
                idNota: '',
                date: new Date().toISOString().split('T')[0],
                issueDate: '',
                driverName: '',
                customerName: '',
                products: Array(6).fill({ description: '', code: '', quantity: '' }),
                observations: ''
            });

            setShowForm(false);
            setEditingId(null);
            alert(editingId ? 'Devolução atualizada com sucesso!' : 'Devolução registrada com sucesso!');
        } else {
            alert('Erro ao salvar devolução: ' + result.error);
        }
    };

    const handleEdit = (returnData) => {
        setFormData({
            idNota: returnData.idNota,
            date: returnData.date,
            issueDate: returnData.issueDate || '',
            driverName: returnData.driverName,
            customerName: returnData.customerName,
            products: returnData.products.length === 6 ? returnData.products : [
                ...returnData.products,
                ...Array(6 - returnData.products.length).fill({ description: '', code: '', quantity: '' })
            ],
            observations: returnData.observations || ''
        });
        setEditingId(returnData.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handlePrint = (returnData) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(generatePrintHTML(returnData));
        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const generatePrintHTML = (data) => {
        const logoPath = logoGmad;

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Formulário de Devolução - ${data.idNota}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 11pt;
                        line-height: 1.3;
                        color: #000;
                    }
                    
                    .container {
                        width: 100%;
                        max-width: 800px;
                        margin: 0 auto;
                        border: 2px solid #000;
                        padding: 15px;
                    }
                    
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #000;
                        gap: 20px;
                    }
                    
                    .logo {
                        max-width: 120px;
                        max-height: 60px;
                        object-fit: contain;
                    }
                    
                    .header-content {
                        flex: 1;
                        text-align: center;
                    }
                    
                    .header h1 {
                        font-size: 16pt;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    
                    .order-number {
                        text-align: right;
                        font-weight: bold;
                        font-size: 12pt;
                        min-width: 150px;
                    }
                    
                    .form-row {
                        display: flex;
                        gap: 15px;
                        margin-bottom: 10px;
                    }
                    
                    .form-field {
                        flex: 1;
                        border-bottom: 1px solid #000;
                        padding: 3px 0;
                    }
                    
                    .form-field label {
                        font-size: 9pt;
                        font-weight: bold;
                        display: block;
                        margin-bottom: 2px;
                    }
                    
                    .form-field .value {
                        min-height: 18px;
                        font-size: 11pt;
                        outline: none;
                    }
                    
                    .form-field .value:focus {
                        background-color: #fffacd;
                    }
                    
                    .products-section {
                        margin: 15px 0;
                    }
                    
                    .products-section h3 {
                        font-size: 10pt;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    
                    table th,
                    table td {
                        border: 1px solid #000;
                        padding: 5px;
                        text-align: left;
                    }
                    
                    table th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        font-size: 10pt;
                    }
                    
                    table td {
                        font-size: 10pt;
                        min-height: 25px;
                    }
                    
                    table td[contenteditable="true"] {
                        outline: none;
                    }
                    
                    table td[contenteditable="true"]:focus {
                        background-color: #fffacd;
                    }
                    
                    .observations {
                        margin: 15px 0;
                    }
                    
                    .observations label {
                        font-size: 10pt;
                        font-weight: bold;
                        display: block;
                        margin-bottom: 5px;
                    }
                    
                    .observations .content {
                        border: 1px solid #000;
                        padding: 8px;
                        min-height: 60px;
                        font-size: 10pt;
                        outline: none;
                    }
                    
                    .observations .content:focus {
                        background-color: #fffacd;
                    }
                    
                    .signatures {
                        display: flex;
                        gap: 30px;
                        margin-top: 30px;
                    }
                    
                    .signature-field {
                        flex: 1;
                    }
                    
                    .signature-field label {
                        font-size: 10pt;
                        font-weight: bold;
                        display: block;
                        margin-bottom: 5px;
                    }
                    
                    .signature-line {
                        border-top: 1px solid #000;
                        margin-top: 50px;
                        padding-top: 5px;
                        text-align: center;
                    }
                    
                    .print-instructions {
                        background: #fff3cd;
                        border: 1px solid #ffc107;
                        padding: 10px;
                        margin-bottom: 15px;
                        border-radius: 4px;
                        font-size: 10pt;
                    }
                    
                    @media print {
                        body {
                            print-color-adjust: exact;
                            -webkit-print-color-adjust: exact;
                        }
                        
                        .print-instructions {
                            display: none;
                        }
                        
                        .form-field .value:focus,
                        table td[contenteditable="true"]:focus,
                        .observations .content:focus {
                            background-color: transparent;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-instructions">
                    ℹ️ <strong>Instruções:</strong> Clique em qualquer campo para editá-lo antes de imprimir. As alterações não serão salvas no sistema.
                </div>
                
                <div class="container">
                    <div class="header">
                        <img src="${logoPath}" alt="Logo" class="logo" onerror="this.style.display='none'">
                        <div class="header-content">
                            <h1>FORMULÁRIO DE DEVOLUÇÃO</h1>
                        </div>
                        <div class="order-number" contenteditable="true">
                            IDNOTA Nº: ${data.idNota}
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-field">
                            <label>NOME (MOTORISTA / VENDEDOR):</label>
                            <div class="value" contenteditable="true">${data.driverName}</div>
                        </div>
                        <div class="form-field" style="max-width: 150px;">
                            <label>DATA:</label>
                            <div class="value" contenteditable="true">${data.date.split('-').reverse().join('/')}</div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-field" style="max-width: 150px;">
                            <label>DATA EMISSÃO:</label>
                            <div class="value" contenteditable="true">${data.issueDate ? data.issueDate.split('-').reverse().join('/') : ''}</div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-field">
                            <label>NOME DO CLIENTE:</label>
                            <div class="value" contenteditable="true">${data.customerName}</div>
                        </div>
                    </div>
                    
                    <div class="products-section">
                        <h3>DESCRIÇÃO DO PRODUTO</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 50px;">#</th>
                                    <th>DESCRIÇÃO</th>
                                    <th style="width: 120px;">CÓDIGO</th>
                                    <th style="width: 100px;">QUANTIDADE</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.products.map((product, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td contenteditable="true">${product.description || ''}</td>
                                        <td contenteditable="true">${product.code || ''}</td>
                                        <td contenteditable="true">${product.quantity || ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="observations">
                        <label>OBS:</label>
                        <div class="content" contenteditable="true">${data.observations || ''}</div>
                    </div>
                    
                    <div class="signatures">
                        <div class="signature-field">
                            <div class="signature-line">ASS. CLIENTE</div>
                        </div>
                        <div class="signature-field">
                            <div class="signature-line">ASS. RECEPTOR</div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta devolução?')) {
            const result = await deleteReturn(id);
            if (result.success) {
                setReturns(prev => prev.filter(r => r.id !== id));
            } else {
                alert('Erro ao excluir: ' + result.error);
            }
        }
    };

    // Filter returns based on filter criteria
    const filteredReturns = returns.filter(returnData => {
        if (filters.idNota && !returnData.idNota.toLowerCase().includes(filters.idNota.toLowerCase())) {
            return false;
        }
        if (filters.date && returnData.date !== filters.date) {
            return false;
        }
        if (filters.issueDate && returnData.issueDate !== filters.issueDate) {
            return false;
        }
        if (filters.customerName && !returnData.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) {
            return false;
        }
        if (filters.driverName && !returnData.driverName.toLowerCase().includes(filters.driverName.toLowerCase())) {
            return false;
        }
        // Unit Filter (Legacy Compatibility)
        const itemUnit = returnData.unit || 'madville';
        if (itemUnit !== activeUnit) {
            return false;
        }



        return true;
    });

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <PageContainer
                maxWidth="1400px"
                title="Gestão de Devoluções"
                subtitle="Registre e gerencie devoluções de produtos"
                actions={
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button variant="ghost" onClick={() => navigate('/menu')}>
                            ← Voltar ao Menu
                        </Button>
                        <Button
                            variant={showForm ? 'danger' : 'success'}
                            onClick={() => {
                                if (showForm && editingId) {
                                    // Cancel editing
                                    setEditingId(null);
                                    setFormData({
                                        idNota: '',
                                        date: new Date().toISOString().split('T')[0],
                                        issueDate: '',
                                        driverName: '',
                                        customerName: '',
                                        products: Array(6).fill({ description: '', code: '', quantity: '' }),
                                        observations: ''
                                    });
                                }
                                setShowForm(!showForm);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            {!showForm && (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            )}
                            {showForm ? 'Cancelar' : 'Nova Devolução'}
                        </Button>
                    </div>
                }
            >

                {/* Form */}
                {showForm && (
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '30px',
                        marginBottom: '25px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#333',
                            marginBottom: '20px'
                        }}>
                            {editingId ? 'Editar Devolução' : 'Registrar Nova Devolução'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '20px',
                                marginBottom: '20px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555',
                                        marginBottom: '6px'
                                    }}>
                                        ID NOTA *
                                    </label>
                                    <Input
                                        type="text"
                                        name="idNota"
                                        value={formData.idNota}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555',
                                        marginBottom: '6px'
                                    }}>
                                        Data *
                                    </label>
                                    <Input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555',
                                        marginBottom: '6px'
                                    }}>
                                        Data de Emissão
                                    </label>
                                    <Input
                                        type="date"
                                        name="issueDate"
                                        value={formData.issueDate}
                                        onChange={handleInputChange}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '20px',
                                marginBottom: '20px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555',
                                        marginBottom: '6px'
                                    }}>
                                        Nome (Motorista/Vendedor) *
                                    </label>
                                    <Input
                                        type="text"
                                        name="driverName"
                                        value={formData.driverName}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555',
                                        marginBottom: '6px'
                                    }}>
                                        Nome do Cliente *
                                    </label>
                                    <Input
                                        type="text"
                                        name="customerName"
                                        value={formData.customerName}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#333',
                                    marginBottom: '12px'
                                }}>
                                    Produtos
                                </h3>

                                <div style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    overflow: 'hidden'
                                }}>
                                    <Table>
                                        <Thead>
                                            <Tr>
                                                <Th style={{ width: '50px', textTransform: 'uppercase' }}>#</Th>
                                                <Th style={{ textTransform: 'uppercase' }}>Descrição</Th>
                                                <Th style={{ width: '150px', textTransform: 'uppercase' }}>Código</Th>
                                                <Th style={{ width: '120px', textTransform: 'uppercase' }}>Quantidade</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {formData.products.map((product, index) => (
                                                <Tr key={index}>
                                                    <Td>{index + 1}</Td>
                                                    <Td>
                                                        <Input
                                                            type="text"
                                                            value={product.description}
                                                            onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                                                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px' }}
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <Input
                                                            type="text"
                                                            value={product.code}
                                                            onChange={(e) => handleProductChange(index, 'code', e.target.value)}
                                                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px' }}
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <Input
                                                            type="number"
                                                            value={product.quantity}
                                                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                                            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: '3px', fontSize: '13px' }}
                                                        />
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#555',
                                    marginBottom: '6px'
                                }}>
                                    Observações
                                </label>
                                <Textarea
                                    name="observations"
                                    value={formData.observations}
                                    onChange={handleInputChange}
                                    rows="4"
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end'
                            }}>
                                <Button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    style={{
                                        background: '#f5f5f5',
                                        color: '#666',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    style={{
                                        background: '#2e7d32',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {editingId ? 'Atualizar Devolução' : 'Registrar Devolução'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filters Section */}
                {!showForm && (
                    <Card padding="25px" style={{ marginBottom: '25px' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#333'
                            }}>
                                Filtros
                            </h3>
                            <Button
                                onClick={clearFilters}
                                style={{
                                    background: '#95a5a6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 16px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Limpar Filtros
                            </Button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '15px'
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#555',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase'
                                }}>
                                    ID NOTA
                                </label>
                                <Input
                                    type="text"
                                    name="idNota"
                                    value={filters.idNota}
                                    onChange={handleFilterChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#555',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase'
                                }}>
                                    Data
                                </label>
                                <Input
                                    type="date"
                                    name="date"
                                    value={filters.date}
                                    onChange={handleFilterChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#555',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase'
                                }}>
                                    Data de Emissão
                                </label>
                                <Input
                                    type="date"
                                    name="issueDate"
                                    value={filters.issueDate}
                                    onChange={handleFilterChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#555',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase'
                                }}>
                                    Cliente
                                </label>
                                <Input
                                    type="text"
                                    name="customerName"
                                    value={filters.customerName}
                                    onChange={handleFilterChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#555',
                                    marginBottom: '6px',
                                    textTransform: 'uppercase'
                                }}>
                                    Responsável
                                </label>
                                <Input
                                    type="text"
                                    name="driverName"
                                    value={filters.driverName}
                                    onChange={handleFilterChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>
                        </div>

                        {Object.values(filters).some(v => v) && (
                            <div style={{
                                marginTop: '15px',
                                padding: '10px',
                                background: '#e3f2fd',
                                borderRadius: '4px',
                                fontSize: '13px',
                                color: '#1976d2'
                            }}>
                                <strong>{filteredReturns.length}</strong> resultado(s) encontrado(s)
                            </div>
                        )}
                    </Card>
                )}

                {/* Returns List */}
                <Card padding="25px">
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#333',
                        marginBottom: '20px'
                    }}>
                        Devoluções Registradas ({filteredReturns.length})
                    </h2>

                    {filteredReturns.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px',
                            color: '#999'
                        }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px' }}>
                                <polyline points="9 14 4 9 9 4"></polyline>
                                <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                            </svg>
                            <p style={{ fontSize: '16px' }}>Nenhuma devolução registrada ainda</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gap: '15px'
                        }}>
                            {filteredReturns.map(returnData => (
                                <div
                                    key={returnData.id}
                                    style={{
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '6px',
                                        padding: '20px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '15px'
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                color: '#f57c00',
                                                marginBottom: '8px'
                                            }}>
                                                IDNOTA Nº {returnData.idNota}
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#666',
                                                marginBottom: '4px'
                                            }}>
                                                <strong>Cliente:</strong> {returnData.customerName}
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                color: '#666',
                                                marginBottom: '4px'
                                            }}>
                                                <strong>Responsável:</strong> {returnData.driverName}
                                            </div>
                                            <div style={{
                                                fontSize: '13px',
                                                color: '#999'
                                            }}>
                                                Data: {returnData.date.split('-').reverse().join('/')}
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            gap: '8px'
                                        }}>
                                            <Button
                                                onClick={() => handleEdit(returnData)}
                                                style={{
                                                    background: '#4CAF50',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '8px 16px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                </svg>
                                                Editar
                                            </Button>
                                            <Button
                                                onClick={() => handlePrint(returnData)}
                                                style={{
                                                    background: '#2196F3',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '8px 16px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                                    <rect x="6" y="14" width="12" height="8"></rect>
                                                </svg>
                                                Imprimir
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(returnData.id)}
                                                style={{
                                                    background: '#f44336',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '8px 16px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px'
                                                }}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Excluir
                                            </Button>
                                        </div>
                                    </div>

                                    {returnData.products.some(p => p.description) && (
                                        <div style={{
                                            background: '#f9f9f9',
                                            borderRadius: '4px',
                                            padding: '12px',
                                            marginTop: '12px'
                                        }}>
                                            <div style={{
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: '#555',
                                                marginBottom: '8px'
                                            }}>
                                                Produtos:
                                            </div>
                                            {returnData.products.filter(p => p.description).map((product, idx) => (
                                                <div key={idx} style={{
                                                    fontSize: '13px',
                                                    color: '#666',
                                                    marginBottom: '4px'
                                                }}>
                                                    • {product.description} {product.code && `(${product.code})`} - Qtd: {product.quantity}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {returnData.observations && (
                                        <div style={{
                                            marginTop: '12px',
                                            fontSize: '13px',
                                            color: '#666',
                                            fontStyle: 'italic'
                                        }}>
                                            <strong>Obs:</strong> {returnData.observations}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </PageContainer>
        </div>
    );
};

export default Returns;
