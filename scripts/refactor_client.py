import re

file_path = 'src/pages/sales/ClientRecords.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add RHF
imports = """import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
"""

content = content.replace("import React, { useMemo, useState, useEffect } from 'react';", "import React, { useMemo, useState, useEffect } from 'react';\n" + imports)


# Define Schemas
schema_code = """
const clientGroupSchema = z.object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres')
});

const clientDataSchema = z.object({
    economicGroupId: z.string().optional(),
    paymentMethod: z.string().optional(),
    deadlines: z.string().optional(),
    observations: z.string().optional()
});
"""

content = content.replace("const ClientRecords = () => {", schema_code + "\nconst ClientRecords = () => {")


# Form Data Hook Setup
client_form_data = """    const {
        register: registerClient,
        handleSubmit: handleClientSubmit,
        reset: resetClient,
        formState: { errors: clientErrors }
    } = useForm({
        resolver: zodResolver(clientDataSchema),
        mode: 'onTouched',
        defaultValues: {
            economicGroupId: '',
            paymentMethod: '',
            deadlines: '',
            observations: ''
        }
    });

    const {
        register: registerGroup,
        handleSubmit: handleGroupSubmit,
        reset: resetGroup,
        formState: { errors: groupErrors }
    } = useForm({
        resolver: zodResolver(clientGroupSchema),
        mode: 'onTouched',
        defaultValues: {
            name: ''
        }
    });"""

content = re.sub(r'    const \[editingRecord, setEditingRecord\] = useState\(\{.*?observations: \'\'\s+?\}\);', client_form_data, content, flags=re.DOTALL)
content = re.sub(r'    const \[newGroupName, setNewGroupName\] = useState\(\'\'\);\n', '', content, flags=re.DOTALL)


# Reset handling
reset_logic = """    useEffect(() => {
        if (selectedClientId) {
            resetClient({
                paymentMethod: currentRecord?.payment_method || '',
                deadlines: currentRecord?.deadlines || '',
                observations: currentRecord?.observations || '',
                economicGroupId: currentRecord?.economic_group_id || ''
            });
            setMessage({ type: '', text: '' });
        }
    }, [selectedClientId, currentRecord, resetClient]);"""

content = re.sub(r'    useEffect\(\(\) => \{\s+?if \(selectedClientId\) \{\s+?setEditingRecord\(\{.*?\}\);\s+?setMessage\(\{ type: \'\', text: \'\' \}\);\s+?\}\s+?\}, \[selectedClientId, currentRecord\]\);', reset_logic, content, flags=re.DOTALL)


# Submits logic rewrite
handleCreateGroup = """    const onGroupSubmit = async (data) => {
        await api.saveEconomicGroup({ name: data.name, unit: activeUnit });
        resetGroup();
        setIsGroupModalOpen(false);
        loadGroups();
    };"""

content = re.sub(r'    const handleCreateGroup = async \(\) => \{.*?loadGroups\(\);\s+?\};', handleCreateGroup, content, flags=re.DOTALL)

handleSaveClient = """    const onClientSubmit = async (data) => {
        if (!selectedClientId) return;
        setSaving(true);
        const result = await saveClientRecord({
            clientId: selectedClientId,
            paymentMethod: data.paymentMethod,
            deadlines: data.deadlines,
            observations: data.observations,
            economicGroupId: data.economicGroupId
        });
        if (result.success) {
            setMessage({ type: 'success', text: 'Ficha atualizada com sucesso!' });
        } else {
            setMessage({ type: 'error', text: 'Erro ao salvar: ' + result.error });
        }
        setSaving(false);
    };"""

content = re.sub(r'    const handleSave = async \(e\) => \{.*?setSaving\(false\);\s+?\};', handleSaveClient, content, flags=re.DOTALL)

# HTML rewrite - form main
main_form = """                                <form onSubmit={handleClientSubmit(onClientSubmit)}>

                                    {/* Economic Group Integration */}
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Grupo Econômico</label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Select
                                                error={clientErrors.economicGroupId?.message}
                                                {...registerClient('economicGroupId')}
                                                style={{
                                                    flex: 1,
                                                }}
                                            >
                                                <option value="">Sem Grupo</option>
                                                {economicGroups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </Select>
                                            <Button
                                                type="button"
                                                onClick={() => setIsGroupModalOpen(true)}
                                                style={{
                                                    padding: '0 15px',
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '16px',
                                                    color: 'var(--primary, #1565C0)',
                                                    fontSize: '20px',
                                                    cursor: 'pointer'
                                                }}
                                                title="Criar Novo Grupo"
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {isGroupModalOpen && (
                                        <div style={{
                                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                                        }}>
                                            <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', width: '300px' }}>
                                                <h3>Novo Grupo</h3>
                                                <Input
                                                    placeholder="Nome do grupo..."
                                                    error={groupErrors.name?.message}
                                                    {...registerGroup('name')}
                                                />
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                                    <Button type="button" onClick={() => { setIsGroupModalOpen(false); resetGroup(); }} style={{ padding: '8px 16px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</Button>
                                                    <Button type="button" onClick={handleGroupSubmit(onGroupSubmit)} style={{ padding: '8px 16px', border: 'none', background: '#1565C0', color: '#fff', borderRadius: '16px', cursor: 'pointer' }}>Criar</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Forma Pagamento</label>
                                        <Input
                                            type="text"
                                            error={clientErrors.paymentMethod?.message}
                                            {...registerClient('paymentMethod')}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Prazos</label>
                                        <Input
                                            type="text"
                                            error={clientErrors.deadlines?.message}
                                            {...registerClient('deadlines')}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Observações</label>
                                    <Textarea
                                        rows="5"
                                        error={clientErrors.observations?.message}
                                        {...registerClient('observations')}
                                        style={{ width: '100%', resize: 'vertical' }}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        style={{ width: '100%', padding: '12px', backgroundColor: '#1565C0', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}
                                    >
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                                    </Button>
                                    {message.text && (
                                        <div style={{ marginTop: '10px', fontSize: '13px', color: message.type === 'success' ? '#2e7d32' : '#d32f2f', textAlign: 'center' }}>
                                            {message.text}
                                        </div>
                                    )}
                                </form>"""

content = re.sub(r'                                <form onSubmit=\{handleSave\}>.*?</form>', main_form, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)
