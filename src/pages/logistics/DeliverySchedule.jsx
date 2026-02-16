import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useData } from '../../context/DataContext';
import { fetchDeliveries, saveDelivery, deleteDelivery } from '../../services/api';
import logoGmad from '../../assets/logo.png';

const DeliverySchedule = () => {
    const navigate = useNavigate();
    const { activeUnit } = useData();
    const [deliveries, setDeliveries] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        carrier: '',
        supplier: '',
        invoiceNumber: '',
        quantity: '',
        volumeType: 'Caixa(s)',
        xml: '',
        observations: ''
    });

    // Filter states
    const [filters, setFilters] = useState({
        date: '',
        month: '',
        year: '',
        supplier: '',
        carrier: ''
    });


    // Load deliveries from Supabase on mount or unit change
    useEffect(() => {
        const loadDeliveries = async () => {
            const data = await fetchDeliveries(activeUnit);
            setDeliveries(data);
        };
        loadDeliveries();
    }, [activeUnit]);

    const carriers = [
        'EXPRESSO SÃO MIGUEL',
        'JADLOG',
        'CORREIOS',
        'TRANSPORTADORA PRÓPRIA',
        'OUTRA'
    ];

    const volumeTypes = ['Caixa(s)', 'Palete(s)', 'Unidade(s)', 'Kg'];

    // Get unique suppliers and carriers from deliveries
    const filterOptions = useMemo(() => {
        const suppliers = new Set();
        const uniqueCarriers = new Set();
        const months = new Set();
        const years = new Set();

        deliveries.forEach(d => {
            if (d.supplier) suppliers.add(d.supplier);
            if (d.carrier) uniqueCarriers.add(d.carrier);
            if (d.date) {
                const [year, month] = d.date.split('-');
                if (year) years.add(year);
                if (month) months.add(month);
            }
        });

        return {
            suppliers: Array.from(suppliers).sort(),
            carriers: Array.from(uniqueCarriers).sort(),
            months: Array.from(months).sort(),
            years: Array.from(years).sort()
        };
    }, [deliveries]);

    // Filter deliveries based on active filters
    const filteredDeliveries = useMemo(() => {
        return deliveries.filter(delivery => {
            // Unit Filter (Legacy Compatibility)
            const itemUnit = delivery.unit || 'madville';
            if (itemUnit !== activeUnit) {
                return false;
            }

            // Date filter (exact match)
            if (filters.date && delivery.date !== filters.date) return false;

            // Month filter
            if (filters.month && !delivery.date.startsWith(`${filters.year || delivery.date.split('-')[0]}-${filters.month}`)) return false;

            // Year filter
            if (filters.year && !delivery.date.startsWith(filters.year)) return false;

            // Supplier filter
            if (filters.supplier && delivery.supplier !== filters.supplier) return false;

            // Carrier filter
            if (filters.carrier && delivery.carrier !== filters.carrier) return false;

            return true;
        });
    }, [deliveries, filters, activeUnit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };

            // Clear date if month or year is selected
            if ((name === 'month' || name === 'year') && value) {
                newFilters.date = '';
            }

            // Clear month and year if specific date is selected
            if (name === 'date' && value) {
                newFilters.month = '';
                newFilters.year = '';
            }

            return newFilters;
        });
    };

    const clearFilters = () => {
        setFilters({
            date: '',
            month: '',
            year: '',
            supplier: '',
            carrier: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const deliveryData = {
            ...formData,
            id: editingId, // Will be null for new ones
            unit: activeUnit
        };

        const result = await saveDelivery(deliveryData);

        if (result.success) {
            // Refresh list
            const data = await fetchDeliveries(activeUnit);
            setDeliveries(data);

            // Reset form
            setFormData({
                date: '',
                time: '',
                carrier: '',
                supplier: '',
                invoiceNumber: '',
                quantity: '',
                volumeType: 'Caixa(s)',
                xml: '',
                observations: ''
            });
            setEditingId(null);
            setShowForm(false);
            alert(editingId ? 'Agendamento atualizado!' : 'Agendamento salvo com sucesso!');
        } else {
            alert('Erro ao salvar agendamento: ' + result.error);
        }
    };

    const handleEdit = (delivery) => {
        setFormData(delivery);
        setEditingId(delivery.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este registro?')) {
            const result = await deleteDelivery(id);
            if (result.success) {
                setDeliveries(prev => prev.filter(d => d.id !== id));
            } else {
                alert('Erro ao excluir: ' + result.error);
            }
        }
    };

    const handleCancel = () => {
        setFormData({
            date: '',
            time: '',
            carrier: '',
            supplier: '',
            invoiceNumber: '',
            quantity: '',
            volumeType: 'Caixa(s)',
            xml: '',
            observations: ''
        });
        setEditingId(null);
        setShowForm(false);
    };

    const monthNames = {
        '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
        '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
        '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const deliveriesToPrint = filteredDeliveries;
        const logoPath = logoGmad;
        const today = new Date().toLocaleDateString('pt-BR');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Relatório de Entregas - ${today}</title>
                <style>
                    @page { size: A4 landscape; margin: 10mm; }
                    body { font-family: Arial, sans-serif; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .logo { height: 50px; }
                    .title { font-size: 18px; font-weight: bold; text-transform: uppercase; }
                    .info { text-align: right; font-size: 12px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="${logoPath}" alt="Logo" class="logo" />
                    <div class="title">Relatório de Entregas</div>
                    <div class="info">
                        Gerado em: ${today}<br>
                        Total de Registros: ${deliveriesToPrint.length}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Horário</th>
                            <th>Transportadora</th>
                            <th>Fornecedor</th>
                            <th>NF</th>
                            <th>Qtd/Vol</th>
                            <th>Obs.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${deliveriesToPrint.length > 0 ? deliveriesToPrint.map(d => `
                            <tr>
                                <td>${d.date.split('-').reverse().join('/')}</td>
                                <td>${d.time}</td>
                                <td>${d.carrier}</td>
                                <td>${d.supplier}</td>
                                <td>${d.invoiceNumber}</td>
                                <td>${d.quantity} ${d.volumeType}</td>
                                <td>${d.observations || '-'}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="7" style="text-align: center; padding: 20px;">Nenhuma entrega encontrada para os filtros selecionados.</td></tr>'}
                    </tbody>
                </table>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div style={{ minHeight: '100vh', background: '#e8ecef' }}>


            <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Page Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#333',
                            marginBottom: '8px'
                        }}>
                            Agendamento de Entrega
                        </h1>
                        <p style={{ color: '#666', fontSize: '14px' }}>
                            Registre e gerencie as entregas programadas
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => navigate('/menu')}
                            style={{
                                padding: '10px 20px',
                                background: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#666'
                            }}
                        >
                            ← Voltar ao Menu
                        </button>

                        <button
                            onClick={handlePrint}
                            style={{
                                padding: '10px 20px',
                                background: '#546e7a',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                <rect x="6" y="14" width="12" height="8"></rect>
                            </svg>
                            Imprimir Lista
                        </button>

                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                style={{
                                    padding: '10px 20px',
                                    background: '#2e7d32',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: 'white'
                                }}
                            >
                                + Nova Entrega
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                {deliveries.length > 0 && !showForm && (
                    <div style={{
                        background: 'white',
                        padding: '20px 30px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        marginBottom: '20px'
                    }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                            gap: '15px',
                            alignItems: 'end'
                        }}>
                            {/* Date Filter */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#555',
                                    textTransform: 'uppercase'
                                }}>
                                    Data Específica
                                </label>
                                <input
                                    type="date"
                                    value={filters.date}
                                    onChange={(e) => handleFilterChange('date', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                />
                            </div>

                            {/* Month Filter */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#555',
                                    textTransform: 'uppercase'
                                }}>
                                    Mês
                                </label>
                                <select
                                    value={filters.month}
                                    onChange={(e) => handleFilterChange('month', e.target.value)}
                                    disabled={!!filters.date}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        opacity: filters.date ? 0.5 : 1
                                    }}
                                >
                                    <option value="">Todos os meses</option>
                                    {filterOptions.months.map(m => (
                                        <option key={m} value={m}>{monthNames[m]}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Year Filter */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#555',
                                    textTransform: 'uppercase'
                                }}>
                                    Ano
                                </label>
                                <select
                                    value={filters.year}
                                    onChange={(e) => handleFilterChange('year', e.target.value)}
                                    disabled={!!filters.date}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '13px',
                                        opacity: filters.date ? 0.5 : 1
                                    }}
                                >
                                    <option value="">Todos os anos</option>
                                    {filterOptions.years.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Supplier Filter */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#555',
                                    textTransform: 'uppercase'
                                }}>
                                    Fornecedor
                                </label>
                                <select
                                    value={filters.supplier}
                                    onChange={(e) => handleFilterChange('supplier', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                >
                                    <option value="">Todos</option>
                                    {filterOptions.suppliers.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Carrier Filter */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '6px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    color: '#555',
                                    textTransform: 'uppercase'
                                }}>
                                    Transportadora
                                </label>
                                <select
                                    value={filters.carrier}
                                    onChange={(e) => handleFilterChange('carrier', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '13px'
                                    }}
                                >
                                    <option value="">Todas</option>
                                    {filterOptions.carriers.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters Button */}
                            <button
                                onClick={clearFilters}
                                style={{
                                    padding: '8px 16px',
                                    background: '#95a5a6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                }}
                            >
                                Limpar Filtros
                            </button>
                        </div>

                        {/* Active Filters Summary */}
                        {(filters.date || filters.month || filters.year || filters.supplier || filters.carrier) && (
                            <div style={{
                                marginTop: '15px',
                                paddingTop: '15px',
                                borderTop: '1px solid #eee',
                                fontSize: '13px',
                                color: '#666'
                            }}>
                                <strong>Filtros ativos:</strong>{' '}
                                {filters.date && `Data: ${filters.date.split('-').reverse().join('/')} • `}
                                {filters.month && !filters.date && `Mês: ${monthNames[filters.month]} • `}
                                {filters.year && !filters.date && `Ano: ${filters.year} • `}
                                {filters.supplier && `Fornecedor: ${filters.supplier} • `}
                                {filters.carrier && `Transportadora: ${filters.carrier}`}
                                {' '}
                                <span style={{ color: '#2e7d32', fontWeight: '600' }}>
                                    ({filteredDeliveries.length} {filteredDeliveries.length === 1 ? 'resultado' : 'resultados'})
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Form */}
                {showForm && (
                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        marginBottom: '30px'
                    }}>
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '600',
                            color: '#333',
                            marginBottom: '25px'
                        }}>
                            {editingId ? 'Editar Entrega' : 'Nova Entrega'}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '20px',
                                marginBottom: '20px'
                            }}>
                                {/* Data */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555'
                                    }}>
                                        Data *
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                {/* Horário */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555'
                                    }}>
                                        Horário *
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                {/* Transportadora */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555'
                                    }}>
                                        Transportadora *
                                    </label>
                                    <select
                                        name="carrier"
                                        value={formData.carrier}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        <option value="">Selecione...</option>
                                        {carriers.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Fornecedor */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555'
                                    }}>
                                        Fornecedor *
                                    </label>
                                    <input
                                        type="text"
                                        name="supplier"
                                        value={formData.supplier}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Nome do fornecedor"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                {/* Nota Fiscal */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555'
                                    }}>
                                        Nota Fiscal *
                                    </label>
                                    <input
                                        type="text"
                                        name="invoiceNumber"
                                        value={formData.invoiceNumber}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="Número da NF"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                {/* Quantidade */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555'
                                    }}>
                                        Quantidade *
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        required
                                        min="1"
                                        placeholder="0"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </div>

                                {/* Volume */}
                                <div>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#555'
                                    }}>
                                        Volume *
                                    </label>
                                    <select
                                        name="volumeType"
                                        value={formData.volumeType}
                                        onChange={handleInputChange}
                                        required
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '14px'
                                        }}
                                    >
                                        {volumeTypes.map(v => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* XML */}
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#555'
                                }}>
                                    XML
                                </label>
                                <input
                                    type="text"
                                    name="xml"
                                    value={formData.xml}
                                    onChange={handleInputChange}
                                    placeholder="Código XML (opcional)"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            {/* Observação */}
                            <div style={{ marginBottom: '25px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    color: '#555'
                                }}>
                                    Observação
                                </label>
                                <textarea
                                    name="observations"
                                    value={formData.observations}
                                    onChange={handleInputChange}
                                    placeholder="Observações adicionais (opcional)"
                                    rows="3"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {/* Form Actions */}
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    style={{
                                        padding: '10px 24px',
                                        background: 'white',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        color: '#666'
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        padding: '10px 24px',
                                        background: '#2e7d32',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'white'
                                    }}
                                >
                                    {editingId ? 'Atualizar' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Deliveries List */}
                {filteredDeliveries.length > 0 ? (
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            padding: '20px 30px',
                            borderBottom: '1px solid #eee'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#333'
                            }}>
                                Entregas Registradas ({filteredDeliveries.length})
                            </h3>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '14px'
                            }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: '#555' }}>Data</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: '#555' }}>Horário</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: '#555' }}>Transportadora</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: '#555' }}>Fornecedor</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: '#555' }}>NF</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: '#555' }}>Qtd</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: '#555' }}>Volume</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'center', fontWeight: '600', color: '#555' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDeliveries.map((delivery, index) => (
                                        <tr key={delivery.id} style={{
                                            borderBottom: '1px solid #f0f0f0',
                                            background: index % 2 === 0 ? 'white' : '#fafafa'
                                        }}>
                                            <td style={{ padding: '12px 20px', color: '#333' }}>
                                                {delivery.date.split('-').reverse().join('/')}
                                            </td>
                                            <td style={{ padding: '12px 20px', color: '#333' }}>{delivery.time}</td>
                                            <td style={{ padding: '12px 20px', color: '#333' }}>{delivery.carrier}</td>
                                            <td style={{ padding: '12px 20px', color: '#333' }}>{delivery.supplier}</td>
                                            <td style={{ padding: '12px 20px', color: '#333' }}>{delivery.invoiceNumber}</td>
                                            <td style={{ padding: '12px 20px', color: '#333' }}>{delivery.quantity}</td>
                                            <td style={{ padding: '12px 20px', color: '#333' }}>{delivery.volumeType}</td>
                                            <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => handleEdit(delivery)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#2196F3',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        marginRight: '8px'
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(delivery.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#f44336',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        color: 'white',
                                                        fontSize: '12px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : deliveries.length > 0 && !showForm ? (
                    <div style={{
                        background: 'white',
                        padding: '60px 30px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#999', fontSize: '16px', marginBottom: '20px' }}>
                            Nenhuma entrega encontrada com os filtros selecionados
                        </p>
                        <button
                            onClick={clearFilters}
                            style={{
                                padding: '12px 24px',
                                background: '#95a5a6',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'white'
                            }}
                        >
                            Limpar Filtros
                        </button>
                    </div>
                ) : !showForm && (
                    <div style={{
                        background: 'white',
                        padding: '60px 30px',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                        textAlign: 'center'
                    }}>
                        <p style={{ color: '#999', fontSize: '16px', marginBottom: '20px' }}>
                            Nenhuma entrega registrada ainda
                        </p>
                        <button
                            onClick={() => setShowForm(true)}
                            style={{
                                padding: '12px 24px',
                                background: '#2e7d32',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                color: 'white'
                            }}
                        >
                            + Registrar Primeira Entrega
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliverySchedule;
