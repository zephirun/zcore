import React, { useState } from 'react';
import { saveDelivery } from '../../services/api';
import logoGmad from '../../assets/logo.png';

const CarrierScheduling = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        carrier: '',
        supplier: '',
        invoiceNumber: '',
        quantity: '',
        volumeType: 'Caixa(s)',
        observations: '',
        unit: 'madville' // Default unit
    });

    const carriers = [
        'EXPRESSO SÃO MIGUEL',
        'JADLOG',
        'CORREIOS',
        'TRANSPORTADORA PRÓPRIA',
        'OUTRA'
    ];

    const volumeTypes = ['Caixa(s)', 'Palete(s)', 'Unidade(s)', 'Kg'];
    const units = [
        { id: 'madville', name: 'GMAD Madville' },
        { id: 'curitiba', name: 'GMAD Curitiba' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await saveDelivery(formData);

        setLoading(false);
        if (result.success) {
            setIsSubmitted(true);
        } else {
            alert('Erro ao enviar agendamento: ' + result.error);
        }
    };

    if (isSubmitted) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                padding: '20px',
                fontFamily: 'sans-serif'
            }}>
                <div style={{
                    background: 'white',
                    padding: '40px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    maxWidth: '500px',
                    width: '100%',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#dcfce7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h2 style={{ color: '#1e293b', marginBottom: '12px', fontSize: '24px' }}>Agendamento Confirmado!</h2>
                    <p style={{ color: '#64748b', marginBottom: '30px' }}>
                        Os dados da entrega foram enviados com sucesso para nossa equipe de logística.
                    </p>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        style={{
                            padding: '12px 24px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Fazer Novo Agendamento
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f1f5f9',
            padding: '40px 20px',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img src={logoGmad} alt="Logo" style={{ height: '50px', marginBottom: '20px' }} />
                    <h1 style={{ color: '#1e293b', fontSize: '28px', fontWeight: '800' }}>Portal de Agendamento</h1>
                    <p style={{ color: '#64748b' }}>Preencha os dados abaixo para programar sua entrega</p>
                </div>

                <form onSubmit={handleSubmit} style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Unidade de Entrega</label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}
                            >
                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Data da Entrega</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Horário Aproximado</label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Transportadora</label>
                            <select
                                name="carrier"
                                value={formData.carrier}
                                onChange={handleInputChange}
                                required
                                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}
                            >
                                <option value="">Selecione...</option>
                                {carriers.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Fornecedor</label>
                        <input
                            type="text"
                            name="supplier"
                            value={formData.supplier}
                            onChange={handleInputChange}
                            required
                            placeholder="Ex: Madeireira ABC"
                            style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Nota Fiscal</label>
                            <input
                                type="text"
                                name="invoiceNumber"
                                value={formData.invoiceNumber}
                                onChange={handleInputChange}
                                required
                                placeholder="000.000.000"
                                style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Qtd / Volume</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                    min="1"
                                    placeholder="0"
                                    style={{ width: '80px', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                                <select
                                    name="volumeType"
                                    value={formData.volumeType}
                                    onChange={handleInputChange}
                                    required
                                    style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', background: 'white' }}
                                >
                                    {volumeTypes.map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Observações (Opcional)</label>
                        <textarea
                            name="observations"
                            value={formData.observations}
                            onChange={handleInputChange}
                            rows="3"
                            placeholder="Informações adicionais sobre o descarregamento..."
                            style={{ width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', resize: 'none' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Enviando...' : 'Confirmar Agendamento'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '30px', color: '#94a3b8', fontSize: '12px' }}>
                    ZCORE - Plataforma de Gestão de Dados
                </p>
            </div>
        </div>
    );
};

export default CarrierScheduling;
