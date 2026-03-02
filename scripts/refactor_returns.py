import re

file_path = 'src/pages/customer-service/Returns.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Imports Additions
imports_rhf = """import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormSection from '@/components/ui/FormSection';"""

content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\n" + imports_rhf)

# Schema Define
schema_code = """
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
"""
content = content.replace("const Returns = () => {", schema_code + "\nconst Returns = () => {")


# Hook Setup
hook_setup = """    const {
        register,
        handleSubmit,
        reset,
        control,
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

    const { fields } = useFieldArray({
        control,
        name: 'products'
    });"""

content = re.sub(r'    const \[formData, setFormData\] = useState\(\{.*?observations: \'\'\s+?\}\);', hook_setup, content, flags=re.DOTALL)

# Refactor submit
onSubmit = """    const onSubmit = async (data) => {
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
    };"""

content = re.sub(r'    const handleSubmit = async \(e\) => \{.*?alert\(\'Erro ao salvar devolução: \' \+ result\.error\);\s+?\}\s+?\};', onSubmit, content, flags=re.DOTALL)

# Refactor Handle Edit
handleEdit = """    const handleEdit = (returnData) => {
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
    };"""

content = re.sub(r'    const handleEdit = \(returnData\) => \{.*?window\.scrollTo\(\{ top: 0, behavior: \'smooth\' \}\);\s+?\};', handleEdit, content, flags=re.DOTALL)


# Form markup rewrite
form_markup = """                        <form onSubmit={handleSubmit(onSubmit)}>
                            <FormSection title="Dados Gerais" description="Informações da nota e cliente.">
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '20px'
                                }}>
                                    <Input
                                        label="ID NOTA"
                                        placeholder="Ex: 123456"
                                        error={errors.idNota?.message}
                                        {...register('idNota')}
                                        required
                                    />

                                    <Input
                                        label="Data"
                                        type="date"
                                        error={errors.date?.message}
                                        {...register('date')}
                                        required
                                    />

                                    <Input
                                        label="Data de Emissão"
                                        type="date"
                                        error={errors.issueDate?.message}
                                        {...register('issueDate')}
                                    />
                                </div>
                            </FormSection>

                            <FormSection title="Envolvidos" description="Motorista responsável e recebedor.">
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '20px'
                                }}>
                                    <Input
                                        label="Nome (Motorista/Vendedor)"
                                        placeholder="Nome do responsável pelo frete"
                                        error={errors.driverName?.message}
                                        {...register('driverName')}
                                        required
                                    />

                                    <Input
                                        label="Nome do Cliente"
                                        placeholder="Destinatário final"
                                        error={errors.customerName?.message}
                                        {...register('customerName')}
                                        required
                                    />
                                </div>
                            </FormSection>

                            <FormSection title="Itens Devolvidos" description="Preencha os códigos e quantidades.">
                                <div style={{
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    <Table>
                                        <Thead>
                                            <Tr>
                                                <Th style={{ width: '50px' }}>#</Th>
                                                <Th>Descrição</Th>
                                                <Th style={{ width: '150px' }}>Código</Th>
                                                <Th style={{ width: '120px' }}>Qtd.</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {fields.map((field, index) => (
                                                <Tr key={field.id}>
                                                    <Td>{index + 1}</Td>
                                                    <Td>
                                                        <input
                                                            className="ui-input"
                                                            style={{
                                                                width: '100%', padding: '6px 8px', border: '1px solid var(--border-input)', 
                                                                borderRadius: '3px', fontSize: '13px', background: 'var(--bg-input)', color: 'var(--text-main)'
                                                            }}
                                                            {...register(`products.${index}.description`)}
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <input
                                                            className="ui-input"
                                                            style={{
                                                                width: '100%', padding: '6px 8px', border: '1px solid var(--border-input)', 
                                                                borderRadius: '3px', fontSize: '13px', background: 'var(--bg-input)', color: 'var(--text-main)'
                                                            }}
                                                            {...register(`products.${index}.code`)}
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <input
                                                            type="text"
                                                            className="ui-input"
                                                            style={{
                                                                width: '100%', padding: '6px 8px', border: '1px solid var(--border-input)', 
                                                                borderRadius: '3px', fontSize: '13px', background: 'var(--bg-input)', color: 'var(--text-main)'
                                                            }}
                                                            {...register(`products.${index}.quantity`)}
                                                        />
                                                    </Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </div>
                            </FormSection>

                            <FormSection title="Anotações" description="Detalhes e motivos adicionais para a operação.">
                                <Textarea
                                    label="Observações"
                                    placeholder="Escreva os detalhes se necessário..."
                                    error={errors.observations?.message}
                                    {...register('observations')}
                                    rows="4"
                                />
                            </FormSection>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                justifyContent: 'flex-end',
                                marginTop: '20px'
                            }}>
                                <Button
                                    variant="ghost"
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        reset();
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>}
                                >
                                    {editingId ? 'Salvar Alterações' : 'Salvar Devolução'}
                                </Button>
                            </div>
                        </form>"""

content = re.sub(r'                        <form onSubmit=\{handleSubmit\}>.*?Salvar Devolução\'\}\s+?</Button>\s+?</div>\s+?</form>', form_markup, content, flags=re.DOTALL)


# Clean dead handles
content = re.sub(r'    const handleInputChange = \(e\) => \{.*?    \};\n', '', content, flags=re.DOTALL)
content = re.sub(r'    const handleProductChange = \(index, field, value\) => \{.*?    \};\n', '', content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)
