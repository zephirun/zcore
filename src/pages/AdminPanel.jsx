import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { allModules, categories } from '../config/menuConfig';

const AdminPanel = () => {
    // Correct Destructuring based on DataContext API
    const { users, registerUser, deleteUser, updateUser, AVAILABLE_UNITS, uniqueVendors } = useData();
    const navigate = useNavigate();

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Form State
    const [newUser, setNewUser] = useState({
        username: '',
        password: '',
        role: 'user',
        name: '',
        allowedUnit: [], // Changed to array for multi-select
        allowedVendor: '', // Renamed from vendorCode for consistency, stores the Linked Vendor Name
        group: '',
        allowedModules: []
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Edit State
    const [editingUserId, setEditingUserId] = useState(null); // Stores ID for UI Key
    const [editingUsername, setEditingUsername] = useState(null); // Stores Username for API Link
    const [editForm, setEditForm] = useState({});

    // Filtering
    const [filter, setFilter] = useState('');

    const handleRefresh = () => {
        setIsRefreshing(true);
        // refreshUserList is called automatically by DataContext effects, 
        // but we can force a UI refresh animation
        setTimeout(() => setIsRefreshing(false), 800);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newUser.username || !newUser.password || !newUser.name) {
            setError('Preencha os campos obrigatórios.');
            return;
        }

        if (newUser.role === 'user' && newUser.allowedUnit.length === 0) {
            setError('Selecione pelo menos uma unidade para o usuário.');
            return;
        }

        // Call registerUser with correct signature
        // registerUser(name, username, password, role, unit, modules, vendor, group)
        const result = await registerUser(
            newUser.name,
            newUser.username,
            newUser.password,
            newUser.role,
            JSON.stringify(newUser.allowedUnit), // Serialize array to JSON string for storage
            newUser.allowedModules,
            newUser.allowedVendor,
            newUser.group
        );

        if (result.success) {
            setSuccess('Usuário criado com sucesso!');
            setNewUser({ username: '', password: '', role: 'user', name: '', allowedUnit: [], allowedVendor: '', group: '', allowedModules: [] });
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Erro ao criar usuário.');
        }
    };

    const startEdit = (user) => {
        setEditingUserId(user.id);
        setEditingUsername(user.username);

        let parsedUnits = [];
        try {
            parsedUnits = user.allowedUnit ? JSON.parse(user.allowedUnit) : [];
        } catch {
            // Fallback for old string format
            parsedUnits = user.allowedUnit ? (user.allowedUnit.includes(',') ? user.allowedUnit.split(',') : [user.allowedUnit]) : [];
        }
        if (!Array.isArray(parsedUnits)) parsedUnits = [user.allowedUnit].filter(Boolean);

        setEditForm({
            ...user,
            allowedUnit: parsedUnits, // Ensure it's an array
            allowedModules: user.allowedModules || [],
            group: user.group || '',
            allowedVendor: user.allowedVendor || ''
        });
    };

    const saveEdit = async () => {
        // Call updateUser with original username and updates object
        const result = await updateUser(editingUsername, {
            ...editForm,
            allowedUnit: JSON.stringify(editForm.allowedUnit) // Serialize before sending
        });

        if (result.success) {
            setEditingUserId(null); // Close edit mode
            setEditingUsername(null);
        } else {
            alert('Erro ao atualizar: ' + (result.error || 'Erro desconhecido'));
        }
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setEditingUsername(null);
    }

    const toggleModuleAccess = (moduleId, isEditing = false) => {
        const targetState = isEditing ? editForm : newUser;
        const setTarget = isEditing ? setEditForm : setNewUser;

        const currentModules = targetState.allowedModules || [];
        const newModules = currentModules.includes(moduleId)
            ? currentModules.filter(id => id !== moduleId)
            : [...currentModules, moduleId];

        setTarget({ ...targetState, allowedModules: newModules });
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(filter.toLowerCase()) ||
        u.username.toLowerCase().includes(filter.toLowerCase()) ||
        (u.group && u.group.toLowerCase().includes(filter.toLowerCase())) ||
        (u.allowedVendor && u.allowedVendor.toLowerCase().includes(filter.toLowerCase()))
    );

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
                <Card style={{ position: 'sticky', top: 'var(--space-4)', border: editingUserId ? '1px solid var(--color-primary)' : '1px solid var(--border-color)' }}>
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

                    <form onSubmit={editingUserId ? (e) => { e.preventDefault(); saveEdit(); } : handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <Input
                            label="Nome Completo"
                            value={editingUserId ? editForm.name : newUser.name}
                            onChange={e => editingUserId ? setEditForm({ ...editForm, name: e.target.value }) : setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="Nome do colaborador"
                        />

                        <Input
                            label="Login (Usuário)"
                            value={editingUserId ? editForm.username : newUser.username}
                            onChange={e => editingUserId ? setEditForm({ ...editForm, username: e.target.value }) : setNewUser({ ...newUser, username: e.target.value })}
                            placeholder="usuario.sobrenome"
                        />

                        {!editingUserId && (
                            <Input
                                label="Senha Provisória"
                                type="password"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        )}

                        <Select
                            label="Função"
                            value={editingUserId ? editForm.role : newUser.role}
                            onChange={e => editingUserId ? setEditForm({ ...editForm, role: e.target.value }) : setNewUser({ ...newUser, role: e.target.value })}
                        >
                            <option value="user">Usuário Padrão</option>
                            <option value="admin">Administrador Geral</option>
                        </Select>

                        <Input
                            label="Departamento"
                            value={editingUserId ? editForm.group : newUser.group}
                            onChange={e => editingUserId ? setEditForm({ ...editForm, group: e.target.value }) : setNewUser({ ...newUser, group: e.target.value })}
                            placeholder="Ex: Comercial, RH"
                        />

                        {((editingUserId ? editForm.role : newUser.role) !== 'admin') && (
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
                                            const currentUnits = editingUserId ? (editForm.allowedUnit || []) : (newUser.allowedUnit || []);
                                            const isChecked = currentUnits.includes(u.id);

                                            return (
                                                <div
                                                    key={u.id}
                                                    onClick={() => {
                                                        const newUnits = isChecked
                                                            ? currentUnits.filter(id => id !== u.id)
                                                            : [...currentUnits, u.id];
                                                        if (editingUserId) setEditForm({ ...editForm, allowedUnit: newUnits });
                                                        else setNewUser({ ...newUser, allowedUnit: newUnits });
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
                                </div>

                                <Select
                                    label="Vendedor Associado"
                                    value={editingUserId ? editForm.allowedVendor : newUser.allowedVendor}
                                    onChange={e => editingUserId ? setEditForm({ ...editForm, allowedVendor: e.target.value }) : setNewUser({ ...newUser, allowedVendor: e.target.value })}
                                >
                                    <option value="">Acesso Irrestrito (Gerencial)</option>
                                    {uniqueVendors.map(vendor => (
                                        <option key={vendor} value={vendor}>{vendor}</option>
                                    ))}
                                </Select>

                                <ModulePermissionSelector
                                    selectedModules={editingUserId ? (editForm.allowedModules || []) : newUser.allowedModules}
                                    onToggle={toggleModuleAccess}
                                    isEditing={!!editingUserId}
                                />
                            </>
                        )}

                        <Button
                            variant="primary"
                            type="submit"
                            fullWidth
                            loading={isRefreshing}
                        >
                            {editingUserId ? 'Salvar Alterações' : 'Criar Conta'}
                        </Button>

                        {error && <p style={{ color: 'var(--color-error)', fontSize: '12px', fontWeight: '600', textAlign: 'center', margin: 0 }}>{error}</p>}
                        {success && <p style={{ color: 'var(--color-success)', fontSize: '12px', fontWeight: '600', textAlign: 'center', margin: 0 }}>{success}</p>}
                    </form>
                </Card>

                {/* RIGHT: LIST */}
                <Card padding="0" style={{ overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}>
                                    <th style={thStyle}>Colaborador</th>
                                    <th style={thStyle}>Grupo</th>
                                    <th style={thStyle}>Unidades</th>
                                    <th style={thStyle}>Acesso</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
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
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                    <div style={{
                                                        width: '32px', height: '32px', borderRadius: '50%',
                                                        background: user.role === 'admin' ? 'var(--color-primary)' : 'var(--bg-input)',
                                                        color: user.role === 'admin' ? 'white' : 'var(--text-muted)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '11px',
                                                        border: '1px solid var(--border-color)'
                                                    }}>
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-main)' }}>{user.name}</span>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{user.username}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    background: 'var(--bg-input)',
                                                    border: '1px solid var(--border-color)',
                                                    color: 'var(--text-muted)',
                                                    fontWeight: '600'
                                                }}>
                                                    {user.group || 'Geral'}
                                                </span>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '300px' }}>
                                                    {user.role === 'admin' ? (
                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>Acesso Global</span>
                                                    ) : (
                                                        (() => {
                                                            if (!user.allowedUnit) return '-';
                                                            let ids = [];
                                                            try { ids = JSON.parse(user.allowedUnit); } catch { ids = user.allowedUnit.split(','); }
                                                            if (!Array.isArray(ids)) ids = [user.allowedUnit];
                                                            const renderedUnits = ids.map(id => {
                                                                const unit = AVAILABLE_UNITS.find(u => u.id === id.trim().replace(/['"]+/g, ''));
                                                                return unit ? unit.name : null;
                                                            }).filter(Boolean);
                                                            return renderedUnits.length > 0 ? renderedUnits.join(', ') : '-';
                                                        })()
                                                    )}
                                                </div>
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '6px', height: '6px', borderRadius: '50%',
                                                        background: user.role === 'admin' ? 'var(--color-primary)' : 'var(--color-success)'
                                                    }} />
                                                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                                                        {user.role === 'admin' ? 'ADMIN' : `${user.allowedModules?.length || 0} MOD.`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <style>{`
                .admin-row:hover { background: var(--bg-hover) !important; }
                summary::-webkit-details-marker { display: none; }
                .admin-row td { vertical-align: middle; }
            `}</style>
        </PageContainer>
    );
};

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
