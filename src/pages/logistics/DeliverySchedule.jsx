import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';

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
            setDeliveries(data || []);
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
                const parts = d.date.split('-');
                if (parts.length >= 2) {
                    const [year, month] = parts;
                    if (year) years.add(year);
                    if (month) months.add(month);
                }
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
            if (filters.month) {
                const deliveryParts = delivery.date?.split('-') || [];
                const deliveryYear = deliveryParts[0];
                const deliveryMonth = deliveryParts[1];

                if (filters.year) {
                    if (deliveryYear !== filters.year || deliveryMonth !== filters.month) return false;
                } else {
                    if (deliveryMonth !== filters.month) return false;
                }
            } else if (filters.year) {
                // Year filter only
                if (!delivery.date?.startsWith(filters.year)) return false;
            }

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
            setDeliveries(data || []);

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
                    body { font-family: Inter, Arial, sans-serif; font-size: 11px; color: #111; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #eee; padding: 10px 8px; text-align: left; }
                    th { background-color: #f9f9f9; font-weight: 700; text-transform: uppercase; font-size: 9px; color: #666; }
                    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 2px solid #111; padding-bottom: 10px; }
                    .logo { height: 40px; }
                    .title { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: -0.02em; }
                    .info { text-align: right; font-size: 10px; color: #666; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="${logoPath}" alt="Logo" class="logo" />
                    <div class="title">Agendamento de Entrega</div>
                    <div class="info">
                        Gerado em: ${today}<br>
                        Total de Registros: ${deliveriesToPrint.length}
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Horal</th>
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
                                <td>${d.date ? d.date.split('-').reverse().join('/') : '-'}</td>
                                <td>${d.time || '-'}</td>
                                <td>${d.carrier || '-'}</td>
                                <td>${d.supplier || '-'}</td>
                                <td>${d.invoiceNumber || '-'}</td>
                                <td>${d.quantity || '0'} ${d.volumeType || ''}</td>
                                <td>${d.observations || '-'}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="7" style="text-align: center; padding: 30px;">Nenhuma entrega encontrada para os filtros selecionados.</td></tr>'}
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
        <PageContainer
            maxWidth="1400px"
            title="Agendamento de Entrega"
            subtitle="Registre e gerencie as entregas programadas"
            actions={
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="ghost" onClick={() => navigate('/menu')}>
                        Voltar ao Menu
                    </Button>
                    <Button variant="secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                            <rect x="6" y="14" width="12" height="8"></rect>
                        </svg>
                        Imprimir
                    </Button>
                    {!showForm && (
                        <Button variant="primary" onClick={() => setShowForm(true)}>
                            Nova Entrega
                        </Button>
                    )}
                </div>
            }
        >

            {/* Filters Section */}
            {!showForm && (
                <Card style={{ marginBottom: '24px' }} padding="var(--space-5)">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                        gap: '16px',
                        alignItems: 'end'
                    }}>
                        <Input
                            label="Data Específica"
                            type="date"
                            value={filters.date}
                            onChange={(e) => handleFilterChange('date', e.target.value)}
                        />

                        <Select
                            label="Mês"
                            value={filters.month}
                            onChange={(e) => handleFilterChange('month', e.target.value)}
                            disabled={!!filters.date}
                        >
                            <option value="">Todos os meses</option>
                            {filterOptions.months.map(m => (
                                <option key={m} value={m}>{monthNames[m]}</option>
                            ))}
                        </Select>

                        <Select
                            label="Ano"
                            value={filters.year}
                            onChange={(e) => handleFilterChange('year', e.target.value)}
                            disabled={!!filters.date}
                        >
                            <option value="">Todos os anos</option>
                            {filterOptions.years.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </Select>

                        <Select
                            label="Fornecedor"
                            value={filters.supplier}
                            onChange={(e) => handleFilterChange('supplier', e.target.value)}
                        >
                            <option value="">Todos os fornecedores</option>
                            {filterOptions.suppliers.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </Select>

                        <Select
                            label="Transportadora"
                            value={filters.carrier}
                            onChange={(e) => handleFilterChange('carrier', e.target.value)}
                        >
                            <option value="">Todas</option>
                            {filterOptions.carriers.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Select>

                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            style={{ height: 'var(--density-input-height)' }}
                        >
                            Limpar
                        </Button>
                    </div>

                    {/* Active Filters Summary */}
                    {(filters.date || filters.month || filters.year || filters.supplier || filters.carrier) && (
                        <div style={{
                            marginTop: '16px',
                            paddingTop: '16px',
                            borderTop: '1px solid var(--border-color)',
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>
                                <strong>Filtros:</strong>{' '}
                                {filters.date && `Escopo: ${filters.date.split('-').reverse().join('/')} • `}
                                {filters.month && !filters.date && `Mês: ${monthNames[filters.month]} • `}
                                {filters.year && !filters.date && `Ano: ${filters.year} • `}
                                {filters.supplier && `Fornecedor: ${filters.supplier} • `}
                                {filters.carrier && `Carrier: ${filters.carrier}`}
                            </span>
                            <span style={{ color: 'var(--color-success)', fontWeight: '700' }}>
                                {filteredDeliveries.length} registros encontrados
                            </span>
                        </div>
                    )}
                </Card>
            )}

            {/* Form Section */}
            {showForm && (
                <Card style={{ marginBottom: '24px' }} padding="var(--space-8)">
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        marginBottom: '24px',
                        letterSpacing: '-0.03em'
                    }}>
                        {editingId ? 'Editar Agendamento' : 'Novo Agendamento'}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                            gap: '20px',
                            marginBottom: '20px'
                        }}>
                            <Input
                                label="Data *"
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                            />

                            <Input
                                label="Horário *"
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                            />

                            <Select
                                label="Transportadora *"
                                name="carrier"
                                value={formData.carrier}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Selecione...</option>
                                {carriers.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </Select>

                            <Input
                                label="Fornecedor *"
                                type="text"
                                name="supplier"
                                value={formData.supplier}
                                onChange={handleInputChange}
                                required
                                placeholder="Nome do fornecedor"
                            />

                            <Input
                                label="Nota Fiscal *"
                                type="text"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleInputChange}
                                required
                                placeholder="Número da NF"
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <Input
                                    label="Quantidade *"
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                />

                                <Select
                                    label="Volume *"
                                    name="volumeType"
                                    value={formData.volumeType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {volumeTypes.map(v => (
                                        <option key={v} value={v}>{v}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <Input
                            label="XML (Opcional)"
                            type="text"
                            name="xml"
                            value={formData.xml}
                            onChange={handleInputChange}
                            placeholder="Código ou link do XML"
                        />

                        <Textarea
                            label="Observação"
                            name="observations"
                            value={formData.observations}
                            onChange={handleInputChange}
                            placeholder="Notas adicionais sobre a entrega..."
                            containerStyle={{ marginTop: '20px' }}
                        />

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                            <Button
                                variant="secondary"
                                onClick={handleCancel}
                                type="button"
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                            >
                                {editingId ? 'Atualizar' : 'Salvar'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* List Section */}
            {!showForm && (
                <>
                    {filteredDeliveries.length > 0 ? (
                        <Card style={{ padding: 0, overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
                                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Data</th>
                                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Hora</th>
                                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Transportadora</th>
                                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Fornecedor</th>
                                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>NF</th>
                                            <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Qtd/Vol</th>
                                            <th style={{ padding: '16px 20px', textAlign: 'right', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDeliveries.map((delivery) => (
                                            <tr key={delivery.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                                <td style={{ padding: '14px 20px', fontWeight: '600' }}>
                                                    {delivery.date ? delivery.date.split('-').reverse().join('/') : '-'}
                                                </td>
                                                <td style={{ padding: '14px 20px' }}>{delivery.time}</td>
                                                <td style={{ padding: '14px 20px', fontWeight: '500' }}>{delivery.carrier}</td>
                                                <td style={{ padding: '14px 20px' }}>{delivery.supplier}</td>
                                                <td style={{ padding: '14px 20px' }}>{delivery.invoiceNumber}</td>
                                                <td style={{ padding: '14px 20px' }}>{delivery.quantity} {delivery.volumeType}</td>
                                                <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                        <Button variant="ghost" dense onClick={() => handleEdit(delivery)} style={{ color: 'var(--color-info)' }}>
                                                            Editar
                                                        </Button>
                                                        <Button variant="ghost" dense onClick={() => handleDelete(delivery.id)} style={{ color: 'var(--color-error)' }}>
                                                            Excluir
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    ) : deliveries.length > 0 ? (
                        <Card padding="64px 24px" style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                                Nenhum agendamento encontrado para os filtros selecionados.
                            </p>
                            <Button variant="secondary" onClick={clearFilters}>
                                Limpar Filtros
                            </Button>
                        </Card>
                    ) : (
                        <Card padding="80px 24px" style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '64px', height: '64px',
                                background: 'var(--bg-elevated)',
                                borderRadius: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                color: 'var(--text-muted)'
                            }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="8" y1="12" x2="16" y2="12"></line>
                                    <line x1="12" y1="8" x2="12" y2="16"></line>
                                </svg>
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Sem agenda</h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                                Ainda não há entregas registradas nesta unidade.
                            </p>
                            <Button variant="primary" onClick={() => setShowForm(true)}>
                                Nova Entrega
                            </Button>
                        </Card>
                    )}
                </>
            )}
        </PageContainer>
    );
};

export default DeliverySchedule;
