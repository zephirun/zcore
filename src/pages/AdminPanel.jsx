
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
            <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>PERMISSÕES DE MÓDULOS</label>
                {categories.map(cat => {
                    const catModules = allModules.filter(m => m.category === cat.id);
                    if (catModules.length === 0) return null;

                    // Calculate active count for badge
                    const activeCount = catModules.filter(m => selectedModules.includes(m.id)).length;

                    return (
                        <details key={cat.id} style={{
                            background: 'var(--bg-input)', // Collapsed bg
                            borderRadius: '8px',
                            border: `1px solid var(--border-color)`,
                            overflow: 'hidden'
                        }}>
                            <summary style={{
                                padding: '10px 12px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                color: 'var(--text-main)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                listStyle: 'none'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cat.color }}></span>
                                    {cat.name}
                                </div>
                                <span style={{
                                    background: activeCount > 0 ? cat.color : 'rgba(0,0,0,0.1)',
                                    color: activeCount > 0 ? 'white' : 'var(--text-muted)',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '10px'
                                }}>
                                    {activeCount} / {catModules.length}
                                </span>
                            </summary>

                            <div style={{
                                padding: '12px',
                                background: 'var(--bg-card)',
                                borderTop: '1px solid var(--border-color)',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '6px'
                            }}>
                                {catModules.map(module => {
                                    const isSelected = selectedModules.includes(module.id);
                                    return (
                                        <button
                                            key={module.id}
                                            type="button"
                                            onClick={() => onToggle(module.id, isEditing)}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '6px',
                                                border: isSelected ? `1px solid ${cat.color}` : '1px solid var(--border-color)',
                                                background: isSelected ? `${cat.color}15` : 'var(--bg-input)', // Light tint
                                                color: isSelected ? cat.color : 'var(--text-muted)',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.1s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                flex: '1 0 auto', // Grow to fill space but keep size reasonable
                                                justifyContent: 'center'
                                            }}
                                        >
                                            <span style={{
                                                width: '12px', height: '12px', borderRadius: '3px',
                                                border: isSelected ? `1px solid ${cat.color}` : '1px solid var(--text-muted)',
                                                background: isSelected ? cat.color : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {isSelected && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                            </span>
                                            {module.title}
                                        </button>
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
        <div style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto' }}>

            {/* Top Bar: Title & Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                        Gestão de Usuários
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Gerencie acessos e permissões do sistema</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Buscar por nome, vendedor, grupo..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            style={{
                                padding: '10px 16px 10px 40px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-card)',
                                color: 'var(--text-main)',
                                width: '300px',
                                fontSize: '13px'
                            }}
                        />
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '10px' }}>
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <button onClick={handleRefresh} style={{ ...actionButtonStyle, background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>
                        Atualizar
                    </button>
                    <button onClick={() => navigate('/menu')} style={{ ...actionButtonStyle, background: 'var(--color-primary)', color: 'white', border: 'none' }}>
                        Voltar
                    </button>
                </div>
            </div>

            {/* Layout: Split View if Creating/Editing, Full Table if Viewing */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 25%) 1fr', gap: '24px', alignItems: 'start' }}>

                {/* LEFT COLUMN: EDITOR / CREATOR */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    {/* CREATION / EDIT CARD */}
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '12px',
                        padding: '24px',
                        boxShadow: 'var(--shadow-sm)',
                        border: editingUserId ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                        position: 'sticky',
                        top: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '700', color: editingUserId ? 'var(--color-primary)' : 'var(--text-main)', margin: 0 }}>
                                {editingUserId ? 'Editando Usuário' : 'Novo Usuário'}
                            </h3>
                            {editingUserId && (
                                <button onClick={cancelEdit} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px' }}>
                                    Cancelar
                                </button>
                            )}
                        </div>

                        {/* FORM - Conditional rendering based on mode */}
                        <form onSubmit={editingUserId ? (e) => { e.preventDefault(); saveEdit(); } : handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                            {/* Name */}
                            <div>
                                <label style={labelStyle}>Nome Completo</label>
                                <input
                                    type="text"
                                    value={editingUserId ? editForm.name : newUser.name}
                                    onChange={e => editingUserId ? setEditForm({ ...editForm, name: e.target.value }) : setNewUser({ ...newUser, name: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Ex: João Silva"
                                    required
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label style={labelStyle}>Usuário (Login)</label>
                                <input
                                    type="text"
                                    value={editingUserId ? editForm.username : newUser.username}
                                    onChange={e => editingUserId ? setEditForm({ ...editForm, username: e.target.value }) : setNewUser({ ...newUser, username: e.target.value })}
                                    style={inputStyle}
                                    placeholder="joao.silva"
                                    required
                                />
                            </div>

                            {/* Password (only visible on creation or potentially reset logic later) */}
                            {!editingUserId && (
                                <div>
                                    <label style={labelStyle}>Senha</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        style={inputStyle}
                                        placeholder="••••••"
                                        required
                                    />
                                </div>
                            )}

                            {/* Role */}
                            <div>
                                <label style={labelStyle}>Função</label>
                                <select
                                    value={editingUserId ? editForm.role : newUser.role}
                                    onChange={e => editingUserId ? setEditForm({ ...editForm, role: e.target.value }) : setNewUser({ ...newUser, role: e.target.value })}
                                    style={inputStyle}
                                >
                                    <option value="user">Usuário</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>

                            {/* Group */}
                            <div>
                                <label style={labelStyle}>Grupo / Setor</label>
                                <input
                                    type="text"
                                    value={editingUserId ? editForm.group : newUser.group}
                                    onChange={e => editingUserId ? setEditForm({ ...editForm, group: e.target.value }) : setNewUser({ ...newUser, group: e.target.value })}
                                    style={inputStyle}
                                    placeholder="Ex: Comercial, Logística"
                                />
                            </div>

                            {/* Conditional Fields for 'user' role (or anyone not admin) */}
                            {((editingUserId ? editForm.role : newUser.role) !== 'admin') && (
                                <>
                                    <div>
                                        <label style={labelStyle}>Unidade(s) de Acesso</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: 'var(--bg-input)', borderRadius: '6px', border: '1px solid var(--border-input)' }}>
                                            {AVAILABLE_UNITS.map(u => {
                                                const currentUnits = editingUserId ? (editForm.allowedUnit || []) : (newUser.allowedUnit || []);
                                                const isChecked = currentUnits.includes(u.id);

                                                return (
                                                    <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-main)' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {
                                                                const newUnits = isChecked
                                                                    ? currentUnits.filter(id => id !== u.id)
                                                                    : [...currentUnits, u.id];

                                                                if (editingUserId) setEditForm({ ...editForm, allowedUnit: newUnits });
                                                                else setNewUser({ ...newUser, allowedUnit: newUnits });
                                                            }}
                                                        />
                                                        {u.name}
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* VENDOR LINKING */}
                                    <div>
                                        <label style={labelStyle}>Vincular Vendedor (Dados)</label>
                                        <select
                                            value={editingUserId ? editForm.allowedVendor : newUser.allowedVendor}
                                            onChange={e => editingUserId ? setEditForm({ ...editForm, allowedVendor: e.target.value }) : setNewUser({ ...newUser, allowedVendor: e.target.value })}
                                            style={inputStyle}
                                        >
                                            <option value="">-- Nenhum / Acesso Completo --</option>
                                            {uniqueVendors.map(vendor => (
                                                <option key={vendor} value={vendor}>{vendor}</option>
                                            ))}
                                        </select>
                                        <small style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                                            Restringe visualização aos dados deste vendedor.
                                        </small>
                                    </div>
                                </>
                            )}

                            {/* Submit Button */}
                            <button type="submit" style={{ ...buttonStyle, background: editingUserId ? '#22c55e' : 'var(--color-primary)', color: 'white', marginTop: '10px' }}>
                                {editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}
                            </button>

                            {/* Module Selector - Collapsible */}
                            {((editingUserId ? editForm.role : newUser.role) !== 'admin') && (
                                <ModulePermissionSelector
                                    selectedModules={editingUserId ? (editForm.allowedModules || []) : newUser.allowedModules}
                                    onToggle={toggleModuleAccess}
                                    isEditing={!!editingUserId}
                                />
                            )}

                        </form>

                        {error && <p style={{ color: '#ef4444', marginTop: '15px', fontSize: '13px', fontWeight: '500' }}>{error}</p>}
                        {success && <p style={{ color: '#22c55e', marginTop: '15px', fontSize: '13px', fontWeight: '500' }}>{success}</p>}
                    </div>
                </div>

                {/* RIGHT COLUMN: USER LIST (TABLE) */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-input)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={thStyle}>Usuário</th>
                                    <th style={thStyle}>Grupo / Setor</th>
                                    <th style={thStyle}>Unidade</th>
                                    <th style={thStyle}>Vendedor Vinc.</th>
                                    <th style={thStyle}>Permissões</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr
                                        key={user.id}
                                        style={{
                                            borderBottom: '1px solid var(--border-color)',
                                            cursor: 'pointer',
                                            background: editingUserId === user.id ? 'var(--color-primary-light-10)' : 'transparent', // Light highlight if active
                                            borderLeft: editingUserId === user.id ? '4px solid var(--color-primary)' : '4px solid transparent'
                                        }}
                                        onClick={() => startEdit(user)}
                                        className="user-row"
                                    >
                                        <td style={tdStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{
                                                    width: '32px', height: '32px', borderRadius: '50%',
                                                    background: user.role === 'admin' ? '#f59e0b' : 'var(--color-primary)',
                                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '12px'
                                                }}>
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{user.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            {user.group ? (
                                                <span style={{ background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', border: '1px solid var(--border-color)' }}>
                                                    {user.group}
                                                </span>
                                            ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                        </td>
                                        <td style={tdStyle}>
                                            {user.role === 'admin' ? (
                                                <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Todas</span>
                                            ) : (
                                                (() => {
                                                    if (!user.allowedUnit) return '-';
                                                    let ids = [];
                                                    try {
                                                        ids = JSON.parse(user.allowedUnit);
                                                    } catch {
                                                        ids = user.allowedUnit.split(',');
                                                    }
                                                    if (!Array.isArray(ids)) ids = [user.allowedUnit];

                                                    return ids.map(id => {
                                                        const unit = AVAILABLE_UNITS.find(u => u.id === id.trim().replace(/['"]+/g, ''));
                                                        return unit ? unit.name : id;
                                                    }).join(', ');
                                                })()
                                            )}
                                        </td>
                                        <td style={tdStyle}>
                                            {user.allowedVendor ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                                    {user.allowedVendor}
                                                </div>
                                            ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                                        </td>
                                        <td style={tdStyle}>
                                            {user.role === 'admin' ? (
                                                <span style={{ color: '#d97706', fontWeight: '600', fontSize: '11px' }}>ADMINISTRADOR</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)' }}>{user.allowedModules ? user.allowedModules.length : 0} módulos</span>
                                            )}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'right' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); if (window.confirm(`Excluir ${user.username}?`)) deleteUser(user.username); }}
                                                style={{
                                                    background: 'transparent', border: '1px solid #fee2e2', color: '#ef4444',
                                                    padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: '600'
                                                }}
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <style>{`
                .user-row:hover {
                    background-color: var(--bg-hover) !important;
                }
                summary::-webkit-details-marker {
                    display: none;
                }
            `}</style>
            </div>
        </div>
    );
};

// Styles
const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid var(--border-input)',
    background: 'var(--bg-input)',
    color: 'var(--text-main)',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
};

const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    marginBottom: '4px',
    textTransform: 'uppercase'
};

const buttonStyle = {
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'transform 0.1s',
};

const actionButtonStyle = {
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '13px'
};

const thStyle = {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase'
};

const tdStyle = {
    padding: '12px 16px',
    color: 'var(--text-main)',
    fontSize: '13px'
};

export default AdminPanel;
