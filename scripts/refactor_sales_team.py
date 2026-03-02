import re

file_path = 'src/pages/sales/SalesTeamRecords.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add RHF
imports = """import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
"""

content = content.replace("import React, { useState, useEffect, useMemo } from 'react';", "import React, { useState, useEffect, useMemo } from 'react';\n" + imports)


# Define Schemas
schema_code = """
const repDataSchema = z.object({
    monthlyGoal: z.string().optional(),
    observations: z.string().optional()
});
"""

content = content.replace("export default function SalesTeamRecords() {", schema_code + "\nexport default function SalesTeamRecords() {")


# Form Data Hook Setup
client_form_data = """    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(repDataSchema),
        mode: 'onTouched',
        defaultValues: {
            monthlyGoal: '',
            observations: ''
        }
    });"""

content = re.sub(r'    const \[editingRecord, setEditingRecord\] = useState\(\{.*?observations: \'\'\s+?\}\);', client_form_data, content, flags=re.DOTALL)


# Reset handling
reset_logic = """    useEffect(() => {
        if (selectedRep) {
            reset({
                monthlyGoal: selectedRep.monthlyGoal ? String(selectedRep.monthlyGoal) : '',
                observations: selectedRep.observations || ''
            });
            setMessage({ type: '', text: '' });
        }
    }, [selectedRep, reset]);"""

content = re.sub(r'    useEffect\(\(\) => \{\s+?if \(selectedRep\) \{\s+?setEditingRecord\(\{.*?\}\);\s+?setMessage\(\{ type: \'\', text: \'\' \}\);\s+?\}\s+?\}, \[selectedRepId\]\);', reset_logic, content, flags=re.DOTALL)


# Submits logic rewrite
handleSave = """    const onFormSubmit = async (data) => {
        if (!selectedRepId) return;
        setSaving(true);
        const result = await saveRepRecord({
            repName: selectedRepId,
            monthlyGoal: parseFloat(data.monthlyGoal) || 0,
            observations: data.observations
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Ficha atualizada com sucesso!' });
            setRepRecords(prev => {
                const existing = prev.findIndex(r => r.rep_name === selectedRepId);
                const newRecord = { rep_name: selectedRepId, monthly_goal: data.monthlyGoal, observations: data.observations };
                if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = newRecord;
                    return updated;
                }
                return [...prev, newRecord];
            });
        } else {
            setMessage({ type: 'error', text: 'Erro ao salvar: ' + result.error });
        }
        setSaving(false);
    };"""

content = re.sub(r'    const handleSave = async \(e\) => \{.*?setSaving\(false\);\s+?\};', handleSave, content, flags=re.DOTALL)

# HTML rewrite - form main
main_form = """                                    <form onSubmit={handleSubmit(onFormSubmit)}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Meta Mensal (R$)</label>
                                            <Input
                                                type="number"
                                                error={errors.monthlyGoal?.message}
                                                {...register('monthlyGoal')}
                                                placeholder="0.00"
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Observações</label>
                                            <Textarea
                                                rows="6"
                                                error={errors.observations?.message}
                                                {...register('observations')}
                                                placeholder="Anotações sobre o desempenho..."
                                                style={{ width: '100%', resize: 'vertical' }}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            style={{ width: '100%', padding: '12px', backgroundColor: '#1565C0', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
                                        >
                                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                                        </Button>

                                        {message.text && (
                                            <div style={{ marginTop: '15px', padding: '10px', borderRadius: '16px', backgroundColor: message.type === 'success' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)', color: message.type === 'success' ? '#2e7d32' : '#d32f2f', textAlign: 'center', fontSize: '13px' }}>
                                                {message.text}
                                            </div>
                                        )}
                                    </form>"""

content = re.sub(r'                                    <form onSubmit=\{handleSave\}>.*?</form>', main_form, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)
