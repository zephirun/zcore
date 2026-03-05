import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';
import Modal from '@/components/ui/Modal';


import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { allModules, categories } from '../config/menuConfig';

const parseUserUnits = (allowedUnit) => {
    if (!allowedUnit || allowedUnit === 'null') return [];

    let units = [];
    try {
        units = typeof allowedUnit === 'string' ? JSON.parse(allowedUnit) : allowedUnit;
        if (!Array.isArray(units)) {
            units = typeof units === 'string' ? units.split(',').map(s => s.trim().replace(/['"]+/g, '')) : [units];
        }
    } catch {
        units = allowedUnit ? String(allowedUnit).split(',').map(s => s.trim().replace(/['"]+/g, '')) : [];
    }

    // Map legacy string names to new standard numeric string IDs
    const legacyMap = { 'madville': '1001', 'curitiba': '1000' };
    return units.map(String).filter(u => u && u !== 'null').map(u => legacyMap[u.toLowerCase()] || u);
};

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
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleNewUser = () => {
        reset({ username: '', password: '', role: 'user', name: '', allowedUnit: [], allowedVendor: '', group: '', allowedModules: [] });
        setEditingUserId(null);
        setEditingUsername(null);
        setError('');
        setSuccess('');
        setIsModalOpen(true);
    };

    const startEdit = (user) => {
        setEditingUserId(user.id);
        setEditingUsername(user.username);
        setError('');
        setSuccess('');

        // Parse allowed units robustly
        const parsedUnits = parseUserUnits(user.allowedUnit);

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

        setIsModalOpen(true);
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setEditingUsername(null);
        reset({ username: '', password: '', role: 'user', name: '', allowedUnit: [], allowedVendor: '', group: '', allowedModules: [] });
        setIsModalOpen(false);
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
        const userUnits = parseUserUnits(u.allowedUnit);

        return userUnits.includes(String(activeTab));
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
                            background: '#FFFFFF',
                            borderRadius: '4px',
                            border: `1px solid #D9D9D9`,
                            overflow: 'hidden',
                            transition: 'border 0.2s ease'
                        }}>
                            <summary style={{
                                padding: '10px 14px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 'bold',
                                color: '#32363A',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                listStyle: 'none',
                                userSelect: 'none',
                                background: activeCount > 0 ? '#F3F8FE' : '#F7F7F7',
                                borderBottom: activeCount > 0 ? '1px solid #D9D9D9' : 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: cat.color || '#0A6ED1' }}></div>
                                    {cat.name}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                        background: activeCount > 0 ? (cat.color || '#0A6ED1') : '#FFFFFF',
                                        color: activeCount > 0 ? 'white' : '#6A6D70',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        border: activeCount > 0 ? 'none' : '1px solid #D9D9D9'
                                    }}>
                                        {activeCount} / {catModules.length}
                                    </span>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.5 }}>
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
                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                        <Input
                            type="text"
                            placeholder="Buscar por nome, login ou departamento..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                paddingLeft: '40px',
                                width: '320px',
                                borderRadius: '4px',
                                background: '#ffffff',
                                border: '1px solid #89919A',
                                boxShadow: 'none'
                            }}
                        />
                    </div>
                    <Button variant="primary" onClick={handleNewUser}>
                        + Novo Usuário
                    </Button>
                    <Button variant="ghost" onClick={handleRefresh}>
                        Atualizar
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/menu')}>
                        Sair
                    </Button>
                </div>
            }
        >
            <Modal
                isOpen={isModalOpen}
                onClose={cancelEdit}
                title={editingUserId ? 'Editando Usuário' : 'Novo Colaborador'}
                width="480px"
            >
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

                    <Input
                        label={editingUserId ? "Senha Provisória (Deixe em branco para manter)" : "Senha Provisória"}
                        type="password"
                        {...register('password')}
                        error={errors.password?.message}
                        placeholder="••••••••"
                    />

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
                                    display: 'grid',
                                    gridTemplateColumns: '1fr',
                                    gap: '4px',
                                    padding: '8px',
                                    background: '#F7F7F7',
                                    borderRadius: '6px',
                                    border: '1px solid #E4E4E4',
                                    maxHeight: '180px',
                                    overflowY: 'auto'
                                }} className="hide-scrollbar">
                                    {AVAILABLE_UNITS.map(u => {
                                        const isChecked = currentUnits.map(String).includes(String(u.id));

                                        return (
                                            <div
                                                key={u.id}
                                                onClick={() => {
                                                    const newUnits = isChecked
                                                        ? currentUnits.filter(id => String(id) !== String(u.id))
                                                        : [...currentUnits, String(u.id)];
                                                    setValue('allowedUnit', newUnits, { shouldValidate: true, shouldDirty: true });
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    padding: '8px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    background: isChecked ? '#E5F0FA' : '#FFFFFF',
                                                    border: `1px solid ${isChecked ? '#0A6ED1' : '#D9D9D9'}`,
                                                    transition: 'background 0.2s ease',
                                                    userSelect: 'none'
                                                }}
                                            >
                                                <div style={{
                                                    width: '16px', height: '16px', borderRadius: '2px',
                                                    border: isChecked ? 'none' : '1px solid #89919A',
                                                    background: isChecked ? '#0A6ED1' : '#FFFFFF',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {isChecked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                </div>
                                                <span style={{
                                                    fontSize: '13px',
                                                    color: '#32363A',
                                                    fontWeight: isChecked ? '600' : '400'
                                                }}>
                                                    {u.name}
                                                </span>
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
                                {[...new Set([...uniqueVendors, ...uniqueRepresentatives, watch('allowedVendor')])].filter(Boolean).sort().map(item => (
                                    <option key={item} value={item.toString()}>
                                        {item}
                                    </option>
                                ))}
                            </Select>

                            <ModulePermissionSelector
                                selectedModules={watch('allowedModules')}
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
                        style={{
                            marginTop: 'var(--space-2)',
                            padding: '10px',
                            fontSize: '14px',
                            borderRadius: '4px',
                            background: '#0A6ED1',
                            border: 'none',
                            color: 'white',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                    >
                        {editingUserId ? 'Salvar Alterações' : 'Criar Colaborador'}
                    </Button>

                    {error && <p style={{ color: 'var(--color-error)', fontSize: '12px', fontWeight: '600', textAlign: 'center', margin: 0 }}>{error}</p>}
                    {success && <p style={{ color: 'var(--color-success)', fontSize: '12px', fontWeight: '600', textAlign: 'center', margin: 0 }}>{success}</p>}
                </form>
            </Modal>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--space-6)', alignItems: 'start' }}>
                {/* RIGHT: DATA TABLE */}
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
                                const units = parseUserUnits(u.allowedUnit);
                                return units.includes(String(unit.id));
                            }).length;

                            return (
                                <TabButton
                                    key={unit.id}
                                    active={String(activeTab) === String(unit.id)}
                                    onClick={() => setActiveTab(String(unit.id))}
                                    label={unit.name}
                                    count={count}
                                />
                            );
                        })}
                    </div>

                    <Card padding="0" style={{ overflow: 'hidden', border: '1px solid #E4E4E4', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.06)', background: '#FFFFFF' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#32363A' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #D9D9D9', background: '#F2F2F2' }}>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', color: '#515559', fontWeight: 'normal', fontSize: '12px', borderRight: '1px solid #E4E4E4' }}>Colaborador</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', color: '#515559', fontWeight: 'normal', fontSize: '12px', borderRight: '1px solid #E4E4E4' }}>Grupo</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', color: '#515559', fontWeight: 'normal', fontSize: '12px', borderRight: '1px solid #E4E4E4' }}>Unidades</th>
                                        <th style={{ textAlign: 'left', padding: '12px 16px', color: '#515559', fontWeight: 'normal', fontSize: '12px', borderRight: '1px solid #E4E4E4' }}>Acesso</th>
                                        <th style={{ textAlign: 'right', padding: '12px 16px', color: '#515559', fontWeight: 'normal', fontSize: '12px' }}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map(user => {
                                        const unitsList = parseUserUnits(user.allowedUnit);
                                        const isGlobal = user.role === 'admin';
                                        const unitNames = unitsList.map(id => {
                                            const unit = AVAILABLE_UNITS.find(u => String(u.id) === String(id));
                                            return unit ? unit.name : String(id);
                                        }).filter(Boolean).join(', ');
                                        const slicedUnits = unitNames.length > 30 ? unitNames.slice(0, 30) + '...' : unitNames;
                                        const modCount = user.allowedModules?.length || 0;

                                        return (
                                            <React.Fragment key={user.id}>
                                                <tr
                                                    key={user.id}
                                                    className="admin-row"
                                                    onClick={() => startEdit(user)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td style={{ padding: 'var(--space-4) var(--space-5)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                width: '36px', height: '36px', borderRadius: '4px',
                                                                background: user.role === 'admin' ? '#0A6ED1' : '#E5E5E5',
                                                                color: user.role === 'admin' ? 'white' : '#1C4C98',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                fontWeight: 'bold', fontSize: '14px',
                                                                border: user.role === 'admin' ? 'none' : '1px solid #D9D9D9'
                                                            }}>
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                <span style={{ fontWeight: '600', fontSize: '14px', color: '#1C4C98' }}>{user.name}</span>
                                                                <span style={{ fontSize: '12px', color: '#6A6D70' }}>@{user.username}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', borderRight: '1px solid #F2F2F2' }}>
                                                        <span style={{ fontSize: '13px', color: '#32363A' }}>
                                                            {user.group || 'Geral'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', borderRight: '1px solid #F2F2F2' }}>
                                                        {isGlobal ? (
                                                            <span style={{
                                                                padding: '2px 6px',
                                                                background: '#107E3E',
                                                                color: 'white',
                                                                borderRadius: '4px',
                                                                fontSize: '11px',
                                                                fontWeight: 'bold'
                                                            }}>Acesso Global</span>
                                                        ) : (
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                                                {unitNames.split(', ').map((uName, idx) => (
                                                                    <span key={idx} style={{
                                                                        padding: '2px 6px',
                                                                        background: '#F2F2F2',
                                                                        color: '#32363A',
                                                                        borderRadius: '4px',
                                                                        fontSize: '11px',
                                                                        border: '1px solid #D9D9D9'
                                                                    }}>{uName}</span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '12px 16px', borderRight: '1px solid #F2F2F2' }}>
                                                        <span style={{
                                                            padding: '2px 6px',
                                                            background: user.role === 'admin' ? '#FFE8E8' : '#E5F0FA',
                                                            color: user.role === 'admin' ? '#BB0000' : '#0A6ED1',
                                                            border: `1px solid ${user.role === 'admin' ? '#FF8888' : '#88B8E6'}`,
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            fontWeight: 'bold',
                                                        }}>
                                                            {user.role === 'admin' ? 'ADMIN' : `${modCount} MOD`}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); startEdit(user); }}
                                                                style={{ background: 'transparent', border: 'none', color: '#0A6ED1', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); if (window.confirm(`Excluir permanentemente o acesso de ${user.name}?`)) deleteUser(user.username); }}
                                                                style={{ background: 'transparent', border: 'none', color: '#BB0000', cursor: 'pointer', fontSize: '13px', padding: 0 }}
                                                            >
                                                                Remover
                                                            </button>
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
                .admin-row {
                    transition: background 0.15s ease;
                    border-bottom: 1px solid #E4E4E4;
                }
                .admin-row:hover { 
                    background: #F3F8FE !important;
                }
                summary::-webkit-details-marker { display: none; }
                .admin-row td { vertical-align: middle; }
                .tab-btn:hover { background: #F2F2F2; color: #32363A; }
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
