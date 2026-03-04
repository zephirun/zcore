import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';


import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { allModules, categories } from '../config/menuConfig';

const userSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    username: z.string().min(3, 'Mínimo de 3 caracteres').regex(/^[a-z0-9.]+$/, 'Apenas letras minúsculas, números e pontos'),
    password: z.string().optional(),
    role: z.string(),
    allowedUnit: z.array(z.string()).optional(),
    allowedVendor: z.string().optional(),
    group: z.string().optional(),
    allowedModules: z.array(z.string()).optional()
}).refine((data) => {
    if (data.role === 'user' && (!data.allowedUnit || data.allowedUnit.length === 0)) {
        return false;
    }
    return true;
}, {
    message: "Selecione ao menos uma unidade",
    path: ["allowedUnit"]
});

const AdminPanel = () => {
    // Correct Destructuring based on DataContext API
    const { users, registerUser, deleteUser, updateUser, AVAILABLE_UNITS, uniqueVendors, uniqueRepresentatives } = useData();
    const navigate = useNavigate();

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Edit State
    const [editingUserId, setEditingUserId] = useState(null); // Stores ID for UI Key
    const [editingUsername, setEditingUsername] = useState(null); // Stores Username for API Link

    // Form Hook
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting, isDirty } } = useForm({
        resolver: zodResolver(userSchema),
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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [filter, setFilter] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // Tab state

    const handleRefresh = () => {
        setIsRefreshing(true);
        // refreshUserList is called automatically by DataContext effects, 
        // but we can force a UI refresh animation
        setTimeout(() => setIsRefreshing(false), 800);
    };

    const onSubmit = async (data) => {
        setError('');
        setSuccess('');

        // Prepare units
        const finalUnits = data.allowedUnit || [];
        const unitsPayload = JSON.stringify(finalUnits);

        if (editingUserId) {
            // EDIT
            const result = await updateUser(editingUsername, {
                name: data.name,
                role: data.role,
                allowedUnit: unitsPayload,
                allowedModules: data.allowedModules,
                allowedVendor: data.allowedVendor,
                group: data.group,
                ...(data.password ? { password: data.password } : {}) // Only send password if editing and filled
            });

            if (result.success) {
                setSuccess('Usuário atualizado!');
                cancelEdit();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.error || 'Erro ao atualizar usuário.');
            }
        } else {
            // CREATE
            if (!data.password) {
                setError('Senha é obrigatória para novos usuários.');
                return;
            }

            const result = await registerUser(
                data.name,
                data.username,
                data.password,
                data.role,
                unitsPayload,
                data.allowedModules,
                data.allowedVendor,
                data.group
            );

            if (result.success) {
                setSuccess('Usuário criado com sucesso!');
                reset();
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(result.error || 'Erro ao criar usuário.');
            }
        }
    };

    const startEdit = (user) => {
        setEditingUserId(user.id);
        setEditingUsername(user.username);

        // Parse allowed units robustly
        let parsedUnits = [];
        try {
            parsedUnits = typeof user.allowedUnit === 'string' ? JSON.parse(user.allowedUnit) : user.allowedUnit;
            if (!Array.isArray(parsedUnits)) {
                if (typeof parsedUnits === 'string') {
                    parsedUnits = parsedUnits.split(',').map(s => s.trim().replace(/['"]+/g, ''));
                } else {
                    parsedUnits = [parsedUnits];
                }
            }
        } catch {
            parsedUnits = user.allowedUnit ? user.allowedUnit.split(',').map(s => s.trim().replace(/['"]+/g, '')) : [];
        }

        reset({
            username: user.username || '',
            password: '', // Senha fica em branco, só preenche se for alterar
            role: user.role || 'user',
            name: user.name || '',
            allowedUnit: parsedUnits,
            allowedVendor: user.allowedVendor || '',
            group: user.group || '',
            allowedModules: user.allowedModules || []
        });
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setEditingUsername(null);
        reset({ username: '', password: '', role: 'user', name: '', allowedUnit: [], allowedVendor: '', group: '', allowedModules: [] });
    }

    const toggleModuleAccess = (moduleId) => {
        const currentMods = watch('allowedModules') || [];
        const newModules = currentMods.includes(moduleId)
            ? currentMods.filter(id => id !== moduleId)
            : [...currentMods, moduleId];

        setValue('allowedModules', newModules, { shouldValidate: true, shouldDirty: true });
    };

    const filteredUsers = users.filter(u => {
        // First application text filter
        const matchesText = u.name.toLowerCase().includes(filter.toLowerCase()) ||
            u.username.toLowerCase().includes(filter.toLowerCase()) ||
            (u.group && u.group.toLowerCase().includes(filter.toLowerCase())) ||
            (u.allowedVendor && u.allowedVendor.toLowerCase().includes(filter.toLowerCase()));

        if (!matchesText) return false;

        // Then apply unit tab filter
        if (activeTab === 'all') return true;

        // Admins are visible in all units (global)
        if (u.role === 'admin') return true;

        // Parse user units robustly
        let userUnits = [];
        try {
            userUnits = typeof u.allowedUnit === 'string' ? JSON.parse(u.allowedUnit) : u.allowedUnit;
            if (!Array.isArray(userUnits)) {
                userUnits = typeof userUnits === 'string' ? userUnits.split(',').map(s => s.trim().replace(/['"]+/g, '')) : [userUnits];
            }
        } catch {
            userUnits = u.allowedUnit ? u.allowedUnit.split(',').map(s => s.trim().replace(/['"]+/g, '')) : [];
        }

        return userUnits.includes(activeTab);
    });

    // Helper Component for Category-grouped Module Selection (Collapsible)
    const ModulePermissionSelector = ({ selectedModules, onToggle, isEditing = false }) => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <label style={labelStyle}>Permissões de Módulo</label>
                {categories.filter(c => !c.hidden).map(cat => {
                    const catModules = allModules.filter(m => m.category === cat.id);
                    if (catModules.length === 0) return null;

                    const activeCount = catModules.filter(m => selectedModules.includes(m.id)).length;

                    return (
                        <details key={cat.id} style={{
                            background: 'var(--bg-input)',
                            borderRadius: '12px',
                            border: `1px solid var(--border-color)`,
                            overflow: 'hidden',
                            transition: 'all 0.2s ease'
                        }}>
                            <summary style={{
                                padding: 'var(--space-3) var(--space-4)',
                                cursor: 'pointer',
                                fontSize: 'var(--text-xs)',
                                fontWeight: 'var(--font-semibold)',
                                color: 'var(--text-main)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                listStyle: 'none',
                                userSelect: 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color || 'var(--color-primary)' }}></div>
                                    {cat.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                    <span style={{
                                        background: activeCount > 0 ? (cat.color || 'var(--color-primary)') : 'var(--bg-card)',
                                        color: activeCount > 0 ? 'white' : 'var(--text-muted)',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '10px',
                                        fontWeight: 'var(--font-bold)',
                                        border: activeCount > 0 ? 'none' : '1px solid var(--border-color)'
                                    }}>
                                        {activeCount} / {catModules.length}
                                    </span>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            </summary>

                            <div style={{
                                padding: 'var(--space-3)',
                                background: 'var(--bg-card)',
                                borderTop: '1px solid var(--border-color)',
                                display: 'grid',
                                gridTemplateColumns: '1fr',
                                gap: 'var(--space-1)'
                            }}>
                                {catModules.map(module => {
                                    const isSelected = selectedModules.includes(module.id);
                                    return (
                                        <div
                                            key={module.id}
                                            onClick={() => onToggle(module.id, isEditing)}
                                            style={{
                                                padding: '8px 10px',
                                                borderRadius: '8px',
                                                background: isSelected ? `${cat.color || 'var(--color-primary)'}10` : 'transparent',
                                                color: isSelected ? (cat.color || 'var(--color-primary)') : 'var(--text-muted)',
                                                fontSize: '12px',
                                                fontWeight: isSelected ? '600' : '400',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 'var(--space-3)',
                                                border: '1px solid transparent',
                                                borderColor: isSelected ? `${cat.color || 'var(--color-primary)'}30` : 'transparent'
                                            }}
                                            onMouseEnter={e => {
                                                if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)';
                                            }}
                                            onMouseLeave={e => {
                                                if (!isSelected) e.currentTarget.style.background = 'transparent';
                                            }}
                                        >
                                            <div style={{
                                                width: '16px', height: '16px', borderRadius: '4px',
                                                border: isSelected ? `none` : '2px solid var(--border-color)',
                                                background: isSelected ? (cat.color || 'var(--color-primary)') : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s'
                                            }}>
                                                {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                            </div>
                                            {module.title}
                                        </div>
                                    );
                                })}
                            </div>
                        </details>
                    );
                })}
            </div>
        );
    };

    return (
        <PageContainer
            maxWidth="1600px"
            title="Gestão de Usuários"
            subtitle="Controle de acessos, permissões e unidades do sistema"
            actions={
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                        <Input
                            type="text"
                            placeholder="Buscar usuário..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ paddingLeft: '34px', width: '240px', borderRadius: '12px' }}
                        />
                    </div>
                    <Button variant="ghost" onClick={handleRefresh}>
                        Atualizar
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/menu')}>
                        Sair
                    </Button>
                </div>
            }
        >
            <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
                {/* LEFT: FORM */}
                <Card padding="var(--space-6)" style={{ position: 'sticky', top: 'var(--space-4)', border: editingUserId ? '1px solid var(--color-primary)' : '1px solid transparent', boxShadow: editingUserId ? '0 0 0 4px rgba(21,101,192,0.1)' : 'var(--shadow-md)', transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-bold)', color: editingUserId ? 'var(--color-primary)' : 'var(--text-main)', margin: 0 }}>
                            {editingUserId ? 'Editar Usuário' : 'Novo Registro'}
                        </h3>
                        {editingUserId && (
                            <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                Cancelar
                            </Button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <Input
                            label="Nome Completo"
                            {...register('name')}
                            error={errors.name?.message}
                            placeholder="Nome do colaborador"
                        />

                        <Input
                            label="Login (Usuário)"
                            {...register('username')}
                            error={errors.username?.message}
                            disabled={!!editingUserId}
                            placeholder="usuario.sobrenome"
                        />

                        {!editingUserId && (
                            <Input
                                label="Senha Provisória"
                                type="password"
                                {...register('password')}
                                error={errors.password?.message}
                                placeholder="••••••••"
                            />
                        )}

                        <Select
                            label="Função"
                            {...register('role')}
                        >
                            <option value="user">Usuário Padrão</option>
                            <option value="admin">Administrador Geral</option>
                        </Select>

                        <Input
                            label="Departamento"
                            {...register('group')}
                            placeholder="Ex: Comercial, RH"
                        />

                        {(currentRole !== 'admin') && (
                            <>
                                <div>
                                    <label style={labelStyle}>Unidades com Acesso</label>
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px',
                                        padding: '8px',
                                        background: 'var(--bg-input)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border-color)',
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
                                    {errors.allowedUnit && <span style={{ color: 'var(--color-error)', fontSize: '11px', marginTop: '4px', display: 'block' }}>Selecione ao menos uma unidade.</span>}
                                </div>

                                <Select
                                    label="Vendedor / Acesso Liberado"
                                    {...register('allowedVendor')}
                                >
                                    <option value="">Acesso Irrestrito (Gerencial)</option>
                                    {[...new Set([...uniqueVendors, ...uniqueRepresentatives])].sort().map(item => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </Select>

                                <ModulePermissionSelector
                                    selectedModules={watch('allowedModules') || []}
                                    onToggle={toggleModuleAccess}
                                />
                            </>
                        )}

                        <Button
                            variant="primary"
                            type="submit"
                            fullWidth
                            loading={isSubmitting}
                            disabled={isSubmitting || (!isDirty && !!editingUserId)}
                        >
                            {editingUserId ? 'Salvar Alterações' : 'Criar Conta'}
                        </Button>

                        {error && <p style={{ color: 'var(--color-error)', fontSize: '12px', fontWeight: '600', textAlign: 'center', margin: 0 }}>{error}</p>}
                        {success && <p style={{ color: 'var(--color-success)', fontSize: '12px', fontWeight: '600', textAlign: 'center', margin: 0 }}>{success}</p>}
                    </form>
                </Card>

                {/* RIGHT: LIST */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {/* TABS */}
                    <div style={{
                        display: 'flex',
                        gap: 'var(--space-2)',
                        background: 'var(--bg-input)',
                        padding: '4px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        width: 'fit-content'
                    }}>
                        <TabButton
                            active={activeTab === 'all'}
                            onClick={() => setActiveTab('all')}
                            label="Todos os Usuários"
                            count={users.length}
                        />
                        {AVAILABLE_UNITS.map(unit => {
                            const count = users.filter(u => {
                                if (u.role === 'admin') return true;
                                let units = [];
                                try { units = typeof u.allowedUnit === 'string' ? JSON.parse(u.allowedUnit) : u.allowedUnit; } catch { units = []; }
                                if (!Array.isArray(units)) units = [units];
                                return units.includes(unit.id);
                            }).length;

                            return (
                                <TabButton
                                    key={unit.id}
                                    active={activeTab === unit.id}
                                    onClick={() => setActiveTab(unit.id)}
                                    label={unit.name}
                                    count={count}
                                />
                            );
                        })}
                    </div>

                    <Card padding="0" style={{ overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-main)' }}>
                                        <th style={{ textAlign: 'left', padding: 'var(--space-4) var(--space-5)', color: 'var(--text-muted)', fontWeight: 'var(--font-bold)', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Colaborador</th>
                                        <th style={{ textAlign: 'left', padding: 'var(--space-4) var(--space-5)', color: 'var(--text-muted)', fontWeight: 'var(--font-bold)', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Grupo</th>
                                        <th style={{ textAlign: 'left', padding: 'var(--space-4) var(--space-5)', color: 'var(--text-muted)', fontWeight: 'var(--font-bold)', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Unidades</th>
                                        <th style={{ textAlign: 'left', padding: 'var(--space-4) var(--space-5)', color: 'var(--text-muted)', fontWeight: 'var(--font-bold)', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Acesso</th>
                                        <th style={{ textAlign: 'right', padding: 'var(--space-4) var(--space-5)', color: 'var(--text-muted)', fontWeight: 'var(--font-bold)', fontSize: '11px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => {
                                        let unitsList = [];
                                        try {
                                            unitsList = typeof user.allowedUnit === 'string' ? JSON.parse(user.allowedUnit) : user.allowedUnit;
                                            if (!Array.isArray(unitsList)) {
                                                unitsList = typeof unitsList === 'string' ? unitsList.split(',').map(s => s.trim().replace(/['"]+/g, '')) : [unitsList];
                                            }
                                        } catch {
                                            unitsList = user.allowedUnit ? user.allowedUnit.split(',').map(s => s.trim().replace(/['"]+/g, '')) : [];
                                        }
                                        const isGlobal = user.role === 'admin';
                                        const unitNames = unitsList.map(id => {
                                            const unit = AVAILABLE_UNITS.find(u => u.id === id);
                                            return unit ? unit.name : null;
                                        }).filter(Boolean).join(', ');
                                        const slicedUnits = unitNames.length > 30 ? unitNames.slice(0, 30) + '...' : unitNames;
                                        const modCount = user.allowedModules?.length || 0;

                                        return (
                                            <React.Fragment key={user.id}>
                                                <tr
                                                    onClick={() => startEdit(user)}
                                                    style={{
                                                        borderBottom: '1px solid var(--border-color)',
                                                        cursor: 'pointer',
                                                        background: editingUserId === user.id ? 'var(--bg-hover)' : 'transparent',
                                                        transition: 'background 0.2s ease'
                                                    }}
                                                    className="admin-row"
                                                >
                                                    <td style={{ padding: 'var(--space-4) var(--space-5)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                                            <div style={{
                                                                width: '36px', height: '36px', borderRadius: '50%',
                                                                background: user.role === 'admin' ? 'var(--color-primary)' : 'var(--bg-input)',
                                                                color: user.role === 'admin' ? 'white' : 'var(--text-muted)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-xs)',
                                                                border: '1px solid var(--border-color)'
                                                            }}>
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-main)' }}>{user.name}</span>
                                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>@{user.username}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-4) var(--space-5)' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            background: 'var(--bg-input)',
                                                            borderRadius: 'var(--space-3)',
                                                            border: '1px solid var(--border-color)',
                                                            fontSize: '11px',
                                                        }}>
                                                            {user.group || 'Geral'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-4) var(--space-5)', color: 'var(--text-muted)' }}>
                                                        {isGlobal ? 'Acesso Global' : <span title={unitNames}>{slicedUnits}</span>}
                                                    </td>
                                                    <td style={{ padding: 'var(--space-4) var(--space-5)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.role === 'admin' ? '#d32f2f' : '#2e7d32' }}></div>
                                                            <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--text-main)', fontSize: '11px' }}>
                                                                {user.role === 'admin' ? 'ADMIN' : `${modCount} MOD.`}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: 'var(--space-4) var(--space-5)', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end' }}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={(e) => { e.stopPropagation(); if (window.confirm(`Excluir ${user.name}?`)) deleteUser(user.username); }}
                                                                style={{ color: 'var(--color-error)' }}
                                                            >
                                                                Remover
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {user.allowedVendor && (
                                                    <tr style={{ background: 'var(--bg-main)33' }}>
                                                        <td colSpan="5" style={{ padding: '0 16px 8px 58px', fontSize: '11px', color: 'var(--color-primary)', fontWeight: '600' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                                                Dados restritos ao vendedor: {user.allowedVendor}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            <style>{`
                .admin-row:hover { background: var(--bg-hover) !important; }
                summary::-webkit-details-marker { display: none; }
                .admin-row td { vertical-align: middle; }
                .tab-btn:hover { background: var(--bg-card); color: var(--text-main); }
            `}</style>
        </PageContainer>
    );
};

const TabButton = ({ active, onClick, label, count }) => (
    <button
        onClick={onClick}
        className="tab-btn"
        style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: 'none',
            background: active ? 'var(--bg-card)' : 'transparent',
            color: active ? 'var(--color-primary)' : 'var(--text-muted)',
            fontSize: '12px',
            fontWeight: active ? 'var(--font-bold)' : 'var(--font-semibold)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: active ? 'var(--shadow-sm)' : 'none'
        }}
    >
        {label}
        <span style={{
            padding: '2px 6px',
            borderRadius: '6px',
            background: active ? 'var(--color-primary)' : 'var(--border-color)',
            color: active ? 'white' : 'var(--text-muted)',
            fontSize: '10px',
            fontWeight: 'var(--font-bold)'
        }}>
            {count}
        </span>
    </button>
);

const labelStyle = {
    display: 'block',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--font-bold)',
    color: 'var(--text-muted)',
    marginBottom: 'var(--space-1)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
};

const thStyle = {
    padding: '16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 'var(--font-bold)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em'
};

const tdStyle = {
    padding: '16px',
    color: 'var(--text-main)',
    fontSize: '14px'
};

export default AdminPanel;
