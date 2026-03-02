import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormSection from '@/components/ui/FormSection';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { fetchReturns, saveReturn, deleteReturn } from '../../services/api';

import logoGmad from '../../assets/logo.png';


const returnSchema = z.object({
    idNota: z.string().min(1, 'ID da Nota é obrigatório'),
    date: z.string().min(1, 'Data é obrigatória'),
    issueDate: z.string().optional(),
    driverName: z.string().min(3, 'Nome do Motorista/Vendedor é obrigatório'),
    customerName: z.string().min(3, 'Nome do Cliente é obrigatório'),
    observations: z.string().optional(),
    products: z.array(z.object({
        description: z.string().optional(),
        code: z.string().optional(),
        quantity: z.string().optional()
    })).default([])
});

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
    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(returnSchema),
        mode: 'onTouched',
        defaultValues: {
            idNota: '',
            date: new Date().toISOString().split('T')[0],
            issueDate: '',
            driverName: '',
            customerName: '',
            products: Array(6).fill({ description: '', code: '', quantity: '' }),
            observations: ''
        }
    });

    const formData = watch();

    const handleProductChange = (index, field, value) => {
        const newProducts = [...formData.products];
        newProducts[index] = { ...newProducts[index], [field]: value };
        setValue('products', newProducts);
    };

    const { fields } = useFieldArray({
        control,
        name: 'products'
    });

    // Load returns from Supabase
    useEffect(() => {
        const loadReturns = async () => {
            const data = await fetchReturns(activeUnit);
            setReturns(data);
        };
        loadReturns();
    }, [activeUnit]);


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


    const onSubmit = async (data) => {
        const returnData = {
            ...data,
            id: editingId,
            unit: activeUnit
        };

        const result = await saveReturn(returnData);

        if (result.success) {
            // Refresh
            const refreshed = await fetchReturns(activeUnit);
            setReturns(refreshed);

            // Reset form
            reset({
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
        reset({
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
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', transition: 'all 0.15s' }}>
            <div style={{ padding: '24px 40px' }}>
                {/* Header Section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
<div>
                        <h1 style={{
                            fontSize: '20px',
                            fontWeight: 'var(--font-bold)',
                            color: 'var(--text-main)',
                            margin: '0 0 4px 0',
                            letterSpacing: '-0.01em'
                        }}>
                            Gestão de Devoluções
                        </h1>
                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            margin: 0
                        }}>
                            Registre e gerencie devoluções de produtos • ERP Viasoft
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
<Button
                            variant="ghost"
                            onClick={() => navigate('/menu')}
                            style={{
                                height: '36px',
                                fontSize: '13px',
                                fontWeight: '600',
                                color: 'var(--text-muted)'
                            }}
                        >
                            Voltar ao Menu
                        </Button>
                        <Button
                            variant={showForm ? 'ghost' : 'success'}
                            onClick={() => {
                                if (showForm && editingId) {
                                    setEditingId(null);
                                    reset({
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
                                height: '36px',
                                padding: '0 16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-4)',
                                fontSize: '13px',
                                fontWeight: '600'
                            }}
                        >
                            {!showForm && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                            )}
                            {showForm ? 'Cancelar' : 'Nova Devolução'}
                        </Button>
                    </div>
                </div>

                {/* Form Section */}
                {showForm && (
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--density-card-padding)',
                        marginBottom: "var(--space-4)",
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-md)',
                        position: 'relative'
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
<div>
                                <h2 style={{
                                    fontSize: '18px',
                                    fontWeight: 'var(--font-bold)',
                                    color: 'var(--text-main)',
                                    margin: 0
                                }}>
                                    {editingId ? 'Editar Devolução' : 'Registrar Nova Devolução'}
                                </h2>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                                    Preencha os dados da nota e os itens para devolução
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: "var(--space-4)",
                                marginBottom: "var(--space-4)"
                            }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>ID NOTA *</label>
                                    <Input
                                        {...register('idNota')}
                                        style={{
                                            width: '100%',
                                            height: '36px',
                                            padding: '0 12px',
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-xs)',
                                            fontSize: '13px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                    {errors.idNota && <span style={{ color: 'var(--color-error-strong)', fontSize: '11px' }}>{errors.idNota.message}</span>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Data *</label>
                                    <Input
                                        type="date"
                                        {...register('date')}
                                        style={{
                                            width: '100%',
                                            height: '36px',
                                            padding: '0 12px',
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-xs)',
                                            fontSize: '13px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                    {errors.date && <span style={{ color: 'var(--color-error-strong)', fontSize: '11px' }}>{errors.date.message}</span>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Data de Emissão</label>
                                    <Input
                                        type="date"
                                        {...register('issueDate')}
                                        style={{
                                            width: '100%',
                                            height: '36px',
                                            padding: '0 12px',
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-xs)',
                                            fontSize: '13px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: "var(--space-4)",
                                marginBottom: "var(--space-4)"
                            }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Motorista / Vendedor *</label>
                                    <Input
                                        {...register('driverName')}
                                        placeholder="Nome completo"
                                        style={{
                                            width: '100%',
                                            height: '36px',
                                            padding: '0 12px',
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-xs)',
                                            fontSize: '13px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                    {errors.driverName && <span style={{ color: 'var(--color-error-strong)', fontSize: '11px' }}>{errors.driverName.message}</span>}
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Nome do Cliente *</label>
                                    <Input
                                        {...register('customerName')}
                                        placeholder="Nome do cliente/fantasia"
                                        style={{
                                            width: '100%',
                                            height: '36px',
                                            padding: '0 12px',
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-xs)',
                                            fontSize: '13px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                    {errors.customerName && <span style={{ color: 'var(--color-error-strong)', fontSize: '11px' }}>{errors.customerName.message}</span>}
                                </div>
                            </div>

                            <div style={{ marginBottom: "var(--space-4)" }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Produtos da Devolução</label>
                                <div style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-xs)',
                                    overflow: 'hidden',
                                    background: 'var(--bg-main)'
                                }}>
                                    <Table>
                                        <Thead>
                                            <Tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                                                <Th style={{ width: '40px', padding: '10px', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)' }}>#</Th>
                                                <Th style={{ padding: '10px', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)' }}>DESCRIÇÃO DO PRODUTO</Th>
                                                <Th style={{ width: '120px', padding: '10px', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)' }}>CÓDIGO</Th>
                                                <Th style={{ width: '100px', padding: '10px', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)' }}>QUANTIDADE</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {fields.map((field, index) => (
                                                <Tr key={field.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                    <Td style={{ padding: '8px 10px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>{index + 1}</Td>
                                                    <Td style={{ padding: '6px 10px' }}>
                                                        <Input
                                                            type="text"
                                                            value={formData.products[index]?.description || ''}
                                                            onChange={(e) => handleProductChange(index, 'description', e.target.value)}
                                                            placeholder="Ex: MDF Branco TX 15mm"
                                                            style={{
                                                                width: '100%',
                                                                height: '28px',
                                                                padding: '0 8px',
                                                                background: 'transparent',
                                                                border: '1px solid var(--border-subtle)',
                                                                borderRadius: '2px',
                                                                fontSize: '12px',
                                                                color: 'var(--text-main)'
                                                            }}
                                                        />
                                                    </Td>
                                                    <Td style={{ padding: '6px 10px' }}>
                                                        <Input
                                                            type="text"
                                                            value={formData.products[index]?.code || ''}
                                                            onChange={(e) => handleProductChange(index, 'code', e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                height: '28px',
                                                                padding: '0 8px',
                                                                background: 'transparent',
                                                                border: '1px solid var(--border-subtle)',
                                                                borderRadius: '2px',
                                                                fontSize: '12px',
                                                                color: 'var(--text-main)'
                                                            }}
                                                        />
                                                    </Td>
                                                    <Td style={{ padding: '6px 10px' }}>
                                                        <Input
                                                            type="text"
                                                            value={formData.products[index]?.quantity || ''}
                                                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                                            style={{
                                                                width: '100%',
                                                                height: '28px',
                                                                padding: '0 8px',
                                                                background: 'transparent',
                                                                border: '1px solid var(--border-subtle)',
                                                                borderRadius: '2px',
                                                                fontSize: '12px',
                                                                color: 'var(--text-main)',
                                                                textAlign: 'center'
                                                            }}
                                                        />
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </div>
                            </div>

                            <div style={{ marginBottom: "var(--space-4)" }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Observações Internas</label>
                                <Textarea
                                    {...register('observations')}
                                    placeholder="Detalhes adicionais sobre o estado dos produtos ou motivo da devolução..."
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-xs)',
                                        fontSize: '13px',
                                        color: 'var(--text-main)',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: 'var(--space-4)',
                                justifyContent: 'flex-end',
                                borderTop: '1px solid var(--border-subtle)',
                                paddingTop: '20px'
                            }}>
<Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowForm(false)}
                                    style={{ height: '36px', padding: '0 20px', fontSize: '13px', fontWeight: '600' }}
                                >
                                    Descartar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="success"
                                    style={{ height: '36px', padding: '0 24px', fontSize: '13px', fontWeight: 'var(--font-bold)' }}
                                >
                                    {editingId ? 'Salvar Alterações' : 'Confirmar Devolução'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Filters Section */}
                {!showForm && (
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        padding: '16px 24px',
                        marginBottom: "var(--space-4)",
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
<h3 style={{
                                fontSize: '14px',
                                fontWeight: 'var(--font-bold)',
                                color: 'var(--text-main)',
                                margin: 0
                            }}>
                                Filtros de Busca
                            </h3>
                            <Button
                                onClick={clearFilters}
                                variant="ghost"
                                style={{
                                    height: '28px',
                                    fontSize: '11px',
                                    fontWeight: 'var(--font-bold)',
                                    color: 'var(--color-accent)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.02em'
                                }}
                            >
                                Limpar Filtros
                            </Button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 1fr)',
                            gap: "var(--space-4)"
                        }}>
                            {[
                                { label: 'ID NOTA', name: 'idNota', type: 'text' },
                                { label: 'Data', name: 'date', type: 'date' },
                                { label: 'Data de Emissão', name: 'issueDate', type: 'date' },
                                { label: 'Cliente', name: 'customerName', type: 'text' },
                                { label: 'Responsável', name: 'driverName', type: 'text' }
                            ].map(field => (
                                <div key={field.name}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '11px',
                                        fontWeight: 'var(--font-bold)',
                                        color: 'var(--text-muted)',
                                        marginBottom: 'var(--space-4)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.02em'
                                    }}>
                                        {field.label}
                                    </label>
                                    <Input
                                        type={field.type}
                                        name={field.name}
                                        value={filters[field.name]}
                                        onChange={handleFilterChange}
                                        style={{
                                            width: '100%',
                                            height: '32px',
                                            padding: '0 10px',
                                            background: 'var(--bg-input)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-xs)',
                                            fontSize: '13px',
                                            color: 'var(--text-main)'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        {Object.values(filters).some(v => v) && (
                            <div style={{
                                marginTop: '16px',
                                padding: '8px 12px',
                                background: 'var(--color-info-light)',
                                borderRadius: 'var(--radius-xs)',
                                fontSize: '12px',
                                color: 'var(--color-info-strong)',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 'var(--space-4)'
                            }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <strong>{filteredReturns.length}</strong> resultado(s) encontrado(s)
                            </div>
                        )}
                    </div>
                )}

                {/* Returns List */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    padding: 'var(--density-card-padding)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <h2 style={{
                        fontSize: '16px',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--text-main)',
                        marginBottom: 'var(--space-4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-4)'
                    }}>
                        Devoluções Registradas
                        <span style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            background: 'var(--bg-main)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)'
                        }}>
                            {filteredReturns.length}
                        </span>
                    </h2>

                    {filteredReturns.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 0',
                            color: 'var(--text-muted)'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ margin: '0 auto 16px', opacity: 0.3 }}>
                                <polyline points="9 14 4 9 9 4"></polyline>
                                <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                            </svg>
                            <p style={{ fontSize: '14px' }}>Nenhuma devolução encontrada para os critérios selecionados.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gap: "var(--space-4)"
                        }}>
                            {filteredReturns.map(returnData => (
                                <div
                                    key={returnData.id}
                                    style={{
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '20px',
                                        background: 'var(--bg-main)',
                                        transition: 'all 0.2s',
                                        position: 'relative'
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
<div style={{ flex: 1 }}>
                                            <div style={{
                                                fontSize: '15px',
                                                fontWeight: 'var(--font-bold)',
                                                color: 'var(--color-accent)',
                                                marginBottom: 'var(--space-4)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-4)'
                                            }}>
IDNOTA Nº {returnData.idNota}
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    color: 'var(--text-muted)',
                                                    background: 'var(--bg-card)',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    border: '1px solid var(--border-color)'
                                                }}>
                                                    {returnData.date.split('-').reverse().join('/')}
                                                </span>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: "var(--space-4)" }}>
                                                <div>
                                                    <label style={{ fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 'var(--space-4)' }}>Cliente</label>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{returnData.customerName}</div>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 'var(--space-4)' }}>Responsável</label>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '600' }}>{returnData.driverName}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            gap: 'var(--space-4)'
                                        }}>
<Button
                                                onClick={() => handleEdit(returnData)}
                                                variant="ghost"
                                                style={{
                                                    height: '32px',
                                                    padding: '0 12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: 'var(--color-success-strong)',
                                                    border: '1px solid var(--color-success-light)',
                                                    background: 'var(--color-success-light)'
                                                }}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                onClick={() => handlePrint(returnData)}
                                                variant="ghost"
                                                style={{
                                                    height: '32px',
                                                    padding: '0 12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: 'var(--color-info-strong)',
                                                    border: '1px solid var(--color-info-light)',
                                                    background: 'var(--color-info-light)'
                                                }}
                                            >
                                                Imprimir
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(returnData.id)}
                                                variant="ghost"
                                                style={{
                                                    height: '32px',
                                                    padding: '0 12px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    color: 'var(--color-error-strong)',
                                                    border: '1px solid var(--color-error-light)',
                                                    background: 'var(--color-error-light)'
                                                }}
                                            >
                                                Excluir
                                            </Button>
                                        </div>
                                    </div>

                                    {returnData.products.some(p => p.description) && (
                                        <div style={{
                                            background: 'var(--bg-card)',
                                            borderRadius: 'var(--radius-xs)',
                                            padding: '12px 16px',
                                            marginTop: '16px',
                                            border: '1px solid var(--border-subtle)'
                                        }}>
                                            <div style={{
                                                fontSize: '11px',
                                                fontWeight: 'var(--font-bold)',
                                                color: 'var(--text-muted)',
                                                textTransform: 'uppercase',
                                                marginBottom: 'var(--space-4)',
                                                letterSpacing: '0.02em'
                                            }}>
                                                ITENS DA DEVOLUÇÃO
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
                                                {returnData.products.filter(p => p.description).map((product, idx) => (
                                                    <div key={idx} style={{
                                                        fontSize: '12px',
                                                        color: 'var(--text-main)',
                                                        background: 'var(--bg-main)',
                                                        padding: '6px 10px',
                                                        borderRadius: '4px',
                                                        border: '1px solid var(--border-subtle)',
                                                        display: 'flex',
                                                        justifyContent: 'space-between'
                                                    }}>
<span>{product.description} {product.code && <small style={{ color: 'var(--text-muted)' }}>({product.code})</small>}</span>
                                                        <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-accent)' }}>{product.quantity} un</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {returnData.observations && (
                                        <div style={{
                                            marginTop: '12px',
                                            fontSize: '12px',
                                            color: 'var(--text-muted)',
                                            background: 'var(--bg-input)',
                                            padding: '8px 12px',
                                            borderRadius: '4px',
                                            borderLeft: '3px solid var(--border-color)'
                                        }}>
                                            <strong style={{ fontSize: '10px', textTransform: 'uppercase', marginRight: '8px' }}>Observações:</strong> {returnData.observations}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Returns;
