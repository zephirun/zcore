import re

file_path = 'src/pages/AdminPanel.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add RHF and Zod imports
imports_rhf = """import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import FormSection from '@/components/ui/FormSection';"""

content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';\n" + imports_rhf)

# Define Schema before component
schema_code = """
const userSchema = z.object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
    username: z.string().min(3, 'O usuário deve ter no mínimo 3 caracteres'),
    password: z.string().optional(),
    role: z.enum(['user', 'admin']),
    group: z.string().optional(),
    allowedVendor: z.string().optional(),
    allowedUnit: z.array(z.string()).default([]),
    allowedModules: z.array(z.string()).default([])
}).refine(data => {
    // se for usario padrao tem de ter unidade
    if (data.role === 'user' && data.allowedUnit.length === 0) {
        return false;
    }
    return true;
}, {
    message: "Selecione pelo menos uma unidade para o usuário",
    path: ["allowedUnit"]
});
"""

content = content.replace("const AdminPanel = () => {", schema_code + "\nconst AdminPanel = () => {")

# Component hook setup
hook_setup = """    const { users, registerUser, deleteUser, updateUser, AVAILABLE_UNITS, uniqueVendors } = useData();
    const navigate = useNavigate();

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit State
    const [editingUserId, setEditingUserId] = useState(null); 
    const [editingUsername, setEditingUsername] = useState(null); 

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        control,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(userSchema),
        mode: 'onTouched',
        defaultValues: {
            username: '',
            password: '',
            role: 'user',
            name: '',
            allowedUnit: [],
            allowedVendor: '',
            group: '',
            allowedModules: []
        }
    });

    const currentRole = watch('role');
    const currentUnits = watch('allowedUnit') || [];
    const currentModules = watch('allowedModules') || [];"""

content = re.sub(r'    const \{ users,.*?const \[filter, setFilter\]', hook_setup + '\n\n    const [filter, setFilter]', content, flags=re.DOTALL)

# Refactor Add/Save
handleAddUser = """    const onSubmit = async (data) => {
        setError('');
        setSuccess('');

        if (editingUserId) {
            // EDIT FLOW
            const result = await updateUser(editingUsername, {
                ...data,
                allowedUnit: JSON.stringify(data.allowedUnit)
            });

            if (result.success) {
                setEditingUserId(null); 
                setEditingUsername(null);
                reset({ username: '', password: '', role: 'user', name: '', allowedUnit: [], allowedVendor: '', group: '', allowedModules: [] });
            } else {
                setError(result.error || 'Erro ao atualizar.');
            }
        } else {
            // CREATE FLOW
            if (!data.password) {
                setError('Preencha a senha para novos usuários.');
                return;
            }

            const result = await registerUser(
                data.name,
                data.username,
                data.password,
                data.role,
                JSON.stringify(data.allowedUnit),
                data.allowedModules,
                data.allowedVendor,
                data.group
            );

            if (result.success) {
                setSuccess('Usuário criado com sucesso!');
                reset({ username: '', password: '', role: 'user', name: '', allowedUnit: [], allowedVendor: '', group: '', allowedModules: [] });
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.error || 'Erro ao criar usuário.');
            }
        }
    };"""

content = re.sub(r'    const handleAddUser = async \(e\).*?const cancelEdit = \(\) => \{', handleAddUser + '\n\n    const cancelEdit = () => {', content, flags=re.DOTALL)

# Refactor startEdit / cancelEdit
startEdit = """    const startEdit = (user) => {
        setEditingUserId(user.id);
        setEditingUsername(user.username);

        let parsedUnits = [];
        try {
            parsedUnits = user.allowedUnit ? JSON.parse(user.allowedUnit) : [];
        } catch {
            parsedUnits = user.allowedUnit ? (user.allowedUnit.includes(',') ? user.allowedUnit.split(',') : [user.allowedUnit]) : [];
        }
        if (!Array.isArray(parsedUnits)) parsedUnits = [user.allowedUnit].filter(Boolean);

        reset({
            name: user.name,
            username: user.username,
            role: user.role,
            password: '', // blank on edit
            allowedUnit: parsedUnits,
            allowedModules: user.allowedModules || [],
            group: user.group || '',
            allowedVendor: user.allowedVendor || ''
        });
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setEditingUsername(null);
        reset({ username: '', password: '', role: 'user', name: '', allowedUnit: [], allowedVendor: '', group: '', allowedModules: [] });
    };

    const toggleModuleAccess = (moduleId) => {
        const newModules = currentModules.includes(moduleId)
            ? currentModules.filter(id => id !== moduleId)
            : [...currentModules, moduleId];

        setValue('allowedModules', newModules, { shouldValidate: true, shouldDirty: true });
    };"""

content = re.sub(r'    const startEdit = \(user\) => \{.*?const filteredUsers =', startEdit + '\n\n    const filteredUsers =', content, flags=re.DOTALL)


# ModulePermissionSelector rewrite to drop isEditing flag
m_old = "    const ModulePermissionSelector = ({ selectedModules, onToggle, isEditing = false }) => {"
m_new = "    const ModulePermissionSelector = ({ selectedModules, onToggle }) => {"
content = content.replace(m_old, m_new)

t_old = "onClick={() => onToggle(module.id, isEditing)}"
t_new = "onClick={() => onToggle(module.id)}"
content = content.replace(t_old, t_new)


# Form rewrite
form_markup = """                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <FormSection 
                            title="Informações Básicas" 
                            description="Credenciais e identificação primária."
                            style={{ marginBottom: '0', paddingBottom: '0', borderBottom: 'none' }}
                        >
                            <Input
                                label="Nome Completo"
                                placeholder="Nome do colaborador"
                                error={errors.name?.message}
                                {...register('name')}
                            />

                            <Input
                                label="Login (Usuário)"
                                placeholder="usuario.sobrenome"
                                disabled={!!editingUserId}
                                error={errors.username?.message}
                                {...register('username')}
                            />

                            {!editingUserId && (
                                <Input
                                    label="Senha Provisória"
                                    type="password"
                                    placeholder="••••••••"
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                            )}
                        </FormSection>

                        <FormSection 
                            title="Acesso e Unidades" 
                            description="Nível de permissões e vínculo local."
                            style={{ marginBottom: '0', paddingBottom: '0', borderBottom: 'none' }}
                        >
                            <Select
                                label="Função"
                                error={errors.role?.message}
                                {...register('role')}
                            >
                                <option value="user">Usuário Padrão</option>
                                <option value="admin">Administrador Geral</option>
                            </Select>

                            <Input
                                label="Departamento"
                                placeholder="Ex: Comercial, RH"
                                error={errors.group?.message}
                                {...register('group')}
                            />

                            {currentRole !== 'admin' && (
                                <>
                                    <div style={{ marginBottom: errors.allowedUnit ? '4px' : '0' }}>
                                        <label style={labelStyle}>Unidades com Acesso <span style={{color: 'var(--color-error)'}}>*</span></label>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '2px',
                                            padding: '8px',
                                            background: 'var(--bg-input)',
                                            borderRadius: '8px',
                                            border: errors.allowedUnit ? '1px solid var(--color-error)' : '1px solid var(--border-color)',
                                            maxHeight: '160px',
                                            overflowY: 'auto'
                                        }} className="hide-scrollbar">
                                            {AVAILABLE_UNITS.map(u => {
                                                const isChecked = currentUnits.includes(u.id);

                                                return (
                                                    <div
                                                        key={u.id}
                                                        onClick={() => {
                                                            const newUnits = isChecked
                                                                ? currentUnits.filter(id => id !== u.id)
                                                                : [...currentUnits, u.id];
                                                            setValue('allowedUnit', newUnits, { shouldValidate: true, shouldDirty: true });
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            padding: '6px 8px',
                                                            borderRadius: '6px',
                                                            cursor: 'pointer',
                                                            background: isChecked ? 'var(--bg-card)' : 'transparent',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: '14px', height: '14px', borderRadius: '4px',
                                                            border: isChecked ? 'none' : '2px solid var(--border-color)',
                                                            background: isChecked ? 'var(--color-primary)' : 'transparent',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {isChecked && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                        </div>
                                                        <span style={{ fontSize: '12px', color: isChecked ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: isChecked ? '600' : '400' }}>{u.name}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {errors.allowedUnit && <span style={{color: 'var(--color-error)', fontSize: '13px', marginTop: '6px', display: 'block'}}>{errors.allowedUnit.message}</span>}
                                    </div>

                                    <Select
                                        label="Vendedor Associado"
                                        error={errors.allowedVendor?.message}
                                        {...register('allowedVendor')}
                                    >
                                        <option value="">Acesso Irrestrito (Gerencial)</option>
                                        {uniqueVendors.map(vendor => (
                                            <option key={vendor} value={vendor}>{vendor}</option>
                                        ))}
                                    </Select>

                                    <ModulePermissionSelector
                                        selectedModules={currentModules}
                                        onToggle={toggleModuleAccess}
                                    />
                                </>
                            )}
                        </FormSection>"""

content = re.sub(r'                    <form onSubmit={editingUserId \? .*?onToggle={toggleModuleAccess}\s+?isEditing=\{\!\!editingUserId\}\s+?/>\s+?</>\s+?\)}', form_markup, content, flags=re.DOTALL)


with open(file_path, 'w') as f:
    f.write(content)
