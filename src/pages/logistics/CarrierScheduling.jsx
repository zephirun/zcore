import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormSection from '@/components/ui/FormSection';
import { saveDelivery } from '../../services/api';
import logoGmad from '../../assets/logo.png';


const schedulingSchema = z.object({
    unit: z.string().min(1, 'Selecione a unidade de destino'),
    date: z.string().min(1, 'Data é obrigatória'),
    time: z.string().min(1, 'Horário é obrigatório'),
    carrier: z.string().min(1, 'Selecione a transportadora'),
    supplier: z.string().min(1, 'Informe o fornecedor'),
    invoiceNumber: z.string().min(1, 'Número da nota é obrigatório'),
    quantity: z.string().min(1, 'Informe a quantidade'),
    volumeType: z.string().min(1, 'Selecione o tipo de volume'),
    observations: z.string().optional()
});

const CarrierScheduling = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(schedulingSchema),
        mode: 'onTouched',
        defaultValues: {
            date: '',
            time: '',
            carrier: '',
            supplier: '',
            invoiceNumber: '',
            quantity: '',
            volumeType: 'Caixa(s)',
            observations: '',
            unit: 'madville'
        }
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


    const onSubmit = async (data) => {
        setLoading(true);

        const result = await saveDelivery(data);

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
                padding: 'var(--space-5)',
                fontFamily: 'sans-serif'
            }}>
<div style={{
                    background: 'var(--bg-card)',
                    padding: 'var(--space-10)',
                    borderRadius: 'var(--space-4)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    maxWidth: '500px',
                    width: '100%',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: 'var(--space-16)',
                        height: 'var(--space-16)',
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
                    <h2 style={{ color: 'var(--text-main)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-3xl)' }}>Agendamento Confirmado!</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                        Os dados da entrega foram enviados com sucesso para nossa equipe de logística.
                    </p>
                    <Button
                        onClick={() => setIsSubmitted(false)}
                        style={{
                            padding: '12px 24px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--space-4)',
                            fontWeight: 'var(--font-semibold)',
                            cursor: 'pointer',
                            fontSize: 'var(--text-lg)'
                        }}
                    >
                        Fazer Novo Agendamento
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-card)',
            padding: '40px 20px',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                    <img src={logoGmad} alt="Logo" style={{ height: '50px', marginBottom: 'var(--space-4)' }} />
                    <h1 style={{ color: 'var(--text-main)', fontSize: 'var(--text-4xl)', fontWeight: '800' }}>Portal de Agendamento</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Preencha os dados abaixo para programar sua entrega</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} style={{
                    background: 'var(--bg-card)',
                    padding: '30px',
                    borderRadius: 'var(--space-4)',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', maxWidth: '800px', margin: '0 auto'}}>
                    <FormSection title="Localização e Data" description="Onde e quando ocorrerá a entrega?" style={{ marginBottom: 'var(--space-4)', paddingBottom: '0', borderBottom: 'none' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                            <Select
                                label="Unidade de Entrega"
                                error={errors.unit?.message}
                                {...register('unit')}
                            >
                                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </Select>

                            <Input
                                label="Data da Entrega"
                                type="date"
                                error={errors.date?.message}
                                {...register('date')}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
                            <Input
                                label="Horário Aproximado"
                                type="time"
                                error={errors.time?.message}
                                {...register('time')}
                            />

                            <Select
                                label="Transportadora"
                                error={errors.carrier?.message}
                                {...register('carrier')}
                            >
                                <option value="">Selecione...</option>
                                {carriers.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                        </div>
                    </FormSection>

                    <FormSection title="Dados da Carga" description="Fornecedor, nota e volumes." style={{ marginBottom: 'var(--space-4)', paddingBottom: '0', borderBottom: 'none' }}>
                        <Input
                            label="Fornecedor"
                            placeholder="Ex: Madeireira ABC"
                            error={errors.supplier?.message}
                            {...register('supplier')}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-5)' }}>
                            <Input
                                label="Nota Fiscal"
                                placeholder="000.000.000"
                                error={errors.invoiceNumber?.message}
                                {...register('invoiceNumber')}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 'var(--space-4)' }}>
                                <Input
                                    label="Qtd"
                                    type="number"
                                    min="1"
                                    placeholder="0"
                                    error={errors.quantity?.message}
                                    {...register('quantity')}
                                />
                                <Select
                                    label="Volume"
                                    error={errors.volumeType?.message}
                                    {...register('volumeType')}
                                >
                                    {volumeTypes.map(v => <option key={v} value={v}>{v}</option>)}
                                </Select>
                            </div>
                        </div>

                        <Textarea
                            label="Observações (Opcional)"
                            placeholder="Informações adicionais sobre o descarregamento..."
                            error={errors.observations?.message}
                            {...register('observations')}
                            rows="3"
                            containerStyle={{ marginTop: 'var(--space-5)' }}
                        />
                    </FormSection>

                    <Button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--space-4)',
                            fontSize: 'var(--text-lg)',
                            fontWeight: 'var(--font-bold)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                            opacity: loading ? 0.7 : 1,
                            marginTop: 'var(--space-5)'
                        }}
                    >
                        {loading ? 'Enviando...' : 'Confirmar Agendamento'}
                    </Button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '30px', color: '#94a3b8', fontSize: 'var(--text-sm)' }}>
                    ZCORE - Plataforma de Gestão de Dados
                </p>
            </div>
        </div>
    );
};

export default CarrierScheduling;
