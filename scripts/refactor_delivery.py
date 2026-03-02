import re

file_path = 'src/pages/logistics/DeliverySchedule.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add Imports
imports_rhf = """import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormSection from '@/components/ui/FormSection';"""

content = content.replace("import React, { useState, useEffect, useMemo } from 'react';", "import React, { useState, useEffect, useMemo } from 'react';\n" + imports_rhf)

# Define Schema
schema_code = """
const deliverySchema = z.object({
    date: z.string().min(1, 'Data é obrigatória'),
    time: z.string().min(1, 'Horário é obrigatório'),
    carrier: z.string().min(1, 'Transportadora é obrigatória'),
    supplier: z.string().min(1, 'Fornecedor é obrigatório'),
    invoiceNumber: z.string().min(1, 'Número da NF é obrigatória'),
    quantity: z.string().min(1, 'Quantidade é obrigatória'),
    volumeType: z.string().min(1, 'Volume é obrigatório'),
    xml: z.string().optional(),
    observations: z.string().optional()
});
"""
content = content.replace("const DeliverySchedule = () => {", schema_code + "\nconst DeliverySchedule = () => {")

# Hook Setup
hook_setup = """    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(deliverySchema),
        mode: 'onTouched',
        defaultValues: {
            date: '',
            time: '',
            carrier: '',
            supplier: '',
            invoiceNumber: '',
            quantity: '',
            volumeType: 'Caixa(s)',
            xml: '',
            observations: ''
        }
    });"""

content = re.sub(r'    const \[formData, setFormData\] = useState\(\{.*?observations: \'\'\s+?\}\);', hook_setup, content, flags=re.DOTALL)

# Refactor submit
onSubmit = """    const onSubmit = async (data) => {
        const deliveryData = {
            ...data,
            id: editingId,
            unit: activeUnit
        };

        const result = await saveDelivery(deliveryData);

        if (result.success) {
            // Refresh
            const refreshed = await fetchDeliveries(activeUnit);
            setDeliveries(refreshed || []);

            // Reset
            reset({
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
    };"""

content = re.sub(r'    const handleSubmit = async \(e\) => \{.*?alert\(\'Erro ao salvar agendamento: \' \+ result\.error\);\s+?\}\s+?\};', onSubmit, content, flags=re.DOTALL)

# Refactor Handle Edit / Cancel
handleEdit = """    const handleEdit = (delivery) => {
        reset({
            date: delivery.date || '',
            time: delivery.time || '',
            carrier: delivery.carrier || '',
            supplier: delivery.supplier || '',
            invoiceNumber: delivery.invoiceNumber || '',
            quantity: delivery.quantity || '',
            volumeType: delivery.volumeType || 'Caixa(s)',
            xml: delivery.xml || '',
            observations: delivery.observations || ''
        });
        setEditingId(delivery.id);
        setShowForm(true);
    };"""

content = re.sub(r'    const handleEdit = \(delivery\) => \{.*?\};', handleEdit, content, flags=re.DOTALL)

handleCancel = """    const handleCancel = () => {
        reset({
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
    };"""

content = re.sub(r'    const handleCancel = \(\) => \{.*?\};', handleCancel, content, flags=re.DOTALL)


# Form markup rewrite
form_markup = """                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormSection title="Programação" description="Data e momento previstos.">
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '20px'
                            }}>
                                <Input
                                    label="Data *"
                                    type="date"
                                    error={errors.date?.message}
                                    {...register('date')}
                                />

                                <Input
                                    label="Horário *"
                                    type="time"
                                    error={errors.time?.message}
                                    {...register('time')}
                                />
                            </div>
                        </FormSection>

                        <FormSection title="Logística" description="Empresas envolvidas na entrega.">
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '20px'
                            }}>
                                <Select
                                    label="Transportadora *"
                                    error={errors.carrier?.message}
                                    {...register('carrier')}
                                >
                                    <option value="">Selecione...</option>
                                    {carriers.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </Select>

                                <Input
                                    label="Fornecedor *"
                                    type="text"
                                    placeholder="Nome do fornecedor"
                                    error={errors.supplier?.message}
                                    {...register('supplier')}
                                />
                            </div>
                        </FormSection>

                        <FormSection title="Carga e Documentação" description="Detalhes sobre a carga e NF.">
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                                gap: '20px'
                            }}>
                                <Input
                                    label="Nota Fiscal *"
                                    type="text"
                                    placeholder="Número da NF"
                                    error={errors.invoiceNumber?.message}
                                    {...register('invoiceNumber')}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <Input
                                        label="Quantidade *"
                                        type="number"
                                        min="1"
                                        error={errors.quantity?.message}
                                        {...register('quantity')}
                                    />

                                    <Select
                                        label="Volume *"
                                        error={errors.volumeType?.message}
                                        {...register('volumeType')}
                                    >
                                        {volumeTypes.map(v => (
                                            <option key={v} value={v}>{v}</option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        
                            <div style={{ marginTop: '20px' }}>
                                <Input
                                    label="XML (Opcional)"
                                    type="text"
                                    placeholder="Código ou link do XML"
                                    error={errors.xml?.message}
                                    {...register('xml')}
                                />
                            </div>

                            <Textarea
                                label="Observação"
                                placeholder="Notas adicionais sobre a entrega..."
                                containerStyle={{ marginTop: '20px' }}
                                error={errors.observations?.message}
                                {...register('observations')}
                                rows="4"
                            />
                        </FormSection>

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
                                {editingId ? 'Atualizar Agendamento' : 'Salvar Agendamento'}
                            </Button>
                        </div>
                    </form>"""

content = re.sub(r'                    <form onSubmit=\{handleSubmit\}>.*?</form>', form_markup, content, flags=re.DOTALL)

# Remove old handleInputChange
content = re.sub(r'    const handleInputChange = \(e\) => \{.*?\};\n', '', content, flags=re.DOTALL)


with open(file_path, 'w') as f:
    f.write(content)
