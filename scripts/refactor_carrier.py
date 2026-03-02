import re

file_path = 'src/pages/logistics/CarrierScheduling.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add Imports
imports_rhf = """import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormSection from '@/components/ui/FormSection';"""

content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\n" + imports_rhf)

# Define Schema
schema_code = """
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
"""

content = content.replace("const CarrierScheduling = () => {", schema_code + "\nconst CarrierScheduling = () => {")

# Hook Setup
hook_setup = """    const {
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
    });"""

content = re.sub(r'    const \[formData, setFormData\] = useState\(\{.*?unit: \'madville\' // Default unit\s+?\}\);', hook_setup, content, flags=re.DOTALL)

# Clean handleInputChange
content = re.sub(r'    const handleInputChange = \(e\) => \{.*?\};\n', '', content, flags=re.DOTALL)

# Refactor submit
onSubmit = """    const onSubmit = async (data) => {
        setLoading(true);

        const result = await saveDelivery(data);

        setLoading(false);
        if (result.success) {
            setIsSubmitted(true);
        } else {
            alert('Erro ao enviar agendamento: ' + result.error);
        }
    };"""

content = re.sub(r'    const handleSubmit = async \(e\) => \{.*?alert\(\'Erro ao enviar agendamento: \' \+ result\.error\);\s+?\}\s+?\};', onSubmit, content, flags=re.DOTALL)

# Form markup rewrite
form_markup = """                <form onSubmit={handleSubmit(onSubmit)} style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                }}>
                    <FormSection title="Localização e Data" description="Onde e quando ocorrerá a entrega?" style={{ marginBottom: '20px', paddingBottom: '0', borderBottom: 'none' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
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

                    <FormSection title="Dados da Carga" description="Fornecedor, nota e volumes." style={{ marginBottom: '20px', paddingBottom: '0', borderBottom: 'none' }}>
                        <Input
                            label="Fornecedor"
                            placeholder="Ex: Madeireira ABC"
                            error={errors.supplier?.message}
                            {...register('supplier')}
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                            <Input
                                label="Nota Fiscal"
                                placeholder="000.000.000"
                                error={errors.invoiceNumber?.message}
                                {...register('invoiceNumber')}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
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
                            containerStyle={{ marginTop: '20px' }}
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
                            borderRadius: '16px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                            opacity: loading ? 0.7 : 1,
                            marginTop: '20px'
                        }}
                    >
                        {loading ? 'Enviando...' : 'Confirmar Agendamento'}
                    </Button>
                </form>"""

content = re.sub(r'                <form onSubmit=\{handleSubmit\} style=\{\{.*?</form>', form_markup, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)
