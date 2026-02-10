import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const AdminPanel = () => {
    const { users, registerUser, updateUser, deleteUser, username: currentUsername, AVAILABLE_UNITS, MODULE_CATEGORIES, AVAILABLE_MODULES } = useData();
    const navigate = useNavigate();

    // Add Form State
    const [newName, setNewName] = useState('');
    const [newUser, setNewUser] = useState('');
    const [newPass, setNewPass] = useState('');
    const [newRole, setNewRole] = useState('viewer');
    const [newAllowedUnit, setNewAllowedUnit] = useState(''); // '' means all
    const [newAllowedModules, setNewAllowedModules] = useState(['sales-analysis']); // Default to sales-analysis

    // Edit State
    const [editingUser, setEditingUser] = useState(null); // Username of user being edited
    const [editName, setEditName] = useState('');
    const [editRole, setEditRole] = useState('');
    const [editAllowedUnit, setEditAllowedUnit] = useState('');
    const [editAllowedModules, setEditAllowedModules] = useState([]);
    const [editPassword, setEditPassword] = useState(''); // New state for password reset

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!newUser || !newPass || !newName) {
            setError('Preencha os campos obrigatórios (Nome, Usuário, Senha).');
            return;
        }

        const unitToSave = newAllowedUnit || null; // Convert '' to null

        const registered = await registerUser(newName, newUser, newPass, newRole, unitToSave, newAllowedModules);
        if (registered) {
            setSuccess(`Usuário ${newName} criado com sucesso!`);
            setNewName('');
            setNewUser('');
            setNewPass('');
            setNewRole('viewer');
            setNewAllowedUnit('');
            setNewAllowedModules(['sales-analysis']);
        } else {
            setError('Falha ao criar usuário ou usuário já existe.');
        }
    };

    const handleDelete = async (targetUser) => {
        if (targetUser === currentUsername) {
            setError('Você não pode excluir a si mesmo.');
            return;
        }
        if (window.confirm(`Tem certeza que deseja excluir ${targetUser}?`)) {
            const success = await deleteUser(targetUser);
            if (success) {
                setSuccess(`Usuário ${targetUser} removido.`);
            } else {
                setError('Falha ao excluir usuário.');
            }
        }
    };

    const startEdit = (user) => {
        setEditingUser(user.username);
        setEditName(user.name || '');
        setEditRole(user.role);
        setEditAllowedUnit(user.allowedUnit || '');
        setEditAllowedModules(user.allowedModules || []);
        setEditPassword(''); // Clear password field on start
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setEditPassword('');
        setError('');
    };

    const saveEdit = async () => {
        const unitToSave = editAllowedUnit || null;

        const updates = {
            name: editName,
            role: editRole,
            allowedUnit: unitToSave,
            allowedModules: editAllowedModules
        };

        // If password is provided, add it to updates
        if (editPassword) {
            updates.password = editPassword;
        }

        const success = await updateUser(editingUser, updates);

        if (success) {
            setSuccess(`Usuário ${editingUser} atualizado.`);
            setEditingUser(null);
            setEditPassword('');
        } else {
            setError('Falha ao atualizar usuário.');
        }
    };

    const getUnitName = (id) => {
        if (!id) return 'Todas';
        const u = AVAILABLE_UNITS.find(unit => unit.id === id);
        return u ? u.name : id;
    };

    const toggleNewModule = (moduleId) => {
        if (newAllowedModules.includes(moduleId)) {
            setNewAllowedModules(newAllowedModules.filter(id => id !== moduleId));
        } else {
            setNewAllowedModules([...newAllowedModules, moduleId]);
        }
    };

    const toggleEditModule = (moduleId) => {
        if (editAllowedModules.includes(moduleId)) {
            setEditAllowedModules(editAllowedModules.filter(id => id !== moduleId));
        } else {
            setEditAllowedModules([...editAllowedModules, moduleId]);
        }
    };

    // Helper functions for category selection
    const toggleCategoryNew = (categoryId) => {
        const category = MODULE_CATEGORIES.find(cat => cat.id === categoryId);
        if (!category) return;

        const categoryModuleIds = category.modules.map(m => m.id);
        const allSelected = categoryModuleIds.every(id => newAllowedModules.includes(id));

        if (allSelected) {
            // Deselect all modules in this category
            setNewAllowedModules(newAllowedModules.filter(id => !categoryModuleIds.includes(id)));
        } else {
            // Select all modules in this category
            const updatedModules = [...new Set([...newAllowedModules, ...categoryModuleIds])];
            setNewAllowedModules(updatedModules);
        }
    };

    const toggleCategoryEdit = (categoryId) => {
        const category = MODULE_CATEGORIES.find(cat => cat.id === categoryId);
        if (!category) return;

        const categoryModuleIds = category.modules.map(m => m.id);
        const allSelected = categoryModuleIds.every(id => editAllowedModules.includes(id));

        if (allSelected) {
            setEditAllowedModules(editAllowedModules.filter(id => !categoryModuleIds.includes(id)));
        } else {
            const updatedModules = [...new Set([...editAllowedModules, ...categoryModuleIds])];
            setEditAllowedModules(updatedModules);
        }
    };

    const getCategorySelectionCount = (categoryId, selectedModules) => {
        const category = MODULE_CATEGORIES.find(cat => cat.id === categoryId);
        if (!category) return { selected: 0, total: 0 };

        const categoryModuleIds = category.modules.map(m => m.id);
        const selected = categoryModuleIds.filter(id => selectedModules.includes(id)).length;
        return { selected, total: categoryModuleIds.length };
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#e8ecef', fontFamily: 'var(--font-main)'
        }}>
            <Header />

            <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ background: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '24px', color: '#333', fontWeight: '700' }}>Gestão de Usuários</h2>
                        <button
                            onClick={() => navigate('/menu')}
                            style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            &larr; Voltar ao Menu
                        </button>
                    </div>

                    {/* Add User Form */}
                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '6px', marginBottom: '40px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '15px', color: '#555' }}>Adicionar Novo Usuário</h3>
                        <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '15px', alignItems: 'start', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#777' }}>Nome Completo *</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    placeholder="Ex: João da Silva"
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#777' }}>Usuário *</label>
                                <input
                                    type="text"
                                    value={newUser}
                                    onChange={e => setNewUser(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    placeholder="joao.silva"
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: '150px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#777' }}>Senha *</label>
                                <input
                                    type="password"
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                    placeholder="Senha"
                                />
                            </div>
                            <div style={{ width: '140px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#777' }}>Função</label>
                                <select
                                    value={newRole}
                                    onChange={e => setNewRole(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    <option value="viewer">Visualizador</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ width: '180px' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '5px', color: '#777' }}>Empresa</label>
                                <select
                                    value={newAllowedUnit}
                                    onChange={e => setNewAllowedUnit(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                >
                                    <option value="">Todas</option>
                                    {AVAILABLE_UNITS.map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Modules Checkboxes - Grouped by Category */}
                            <div style={{ minWidth: '300px', flex: '1 1 100%' }}>
                                <label style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: '#777', fontWeight: '600' }}>Módulos Permitidos</label>
                                <div style={{ background: 'white', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', maxHeight: '300px', overflowY: 'auto' }}>
                                    {MODULE_CATEGORIES.map(category => {
                                        const { selected, total } = getCategorySelectionCount(category.id, newAllowedModules);
                                        const allSelected = selected === total && total > 0;

                                        return (
                                            <div key={category.id} style={{ marginBottom: '12px', borderBottom: '1px solid #f0f0f0', paddingBottom: '8px' }}>
                                                {/* Category Header */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', padding: '4px', background: '#f8f9fa', borderRadius: '4px' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        onChange={() => toggleCategoryNew(category.id)}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                    <label style={{ flex: 1, fontSize: '13px', fontWeight: '700', color: '#333', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleCategoryNew(category.id)}>
                                                        {category.name}
                                                    </label>
                                                    <span style={{ fontSize: '11px', color: '#666', background: selected > 0 ? '#e3f2fd' : '#f5f5f5', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
                                                        {selected}/{total}
                                                    </span>
                                                </div>

                                                {/* Category Modules */}
                                                <div style={{ paddingLeft: '24px' }}>
                                                    {category.modules.map(mod => (
                                                        <div key={mod.id} style={{ marginBottom: '4px' }}>
                                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', padding: '2px 0' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={newAllowedModules.includes(mod.id)}
                                                                    onChange={() => toggleNewModule(mod.id)}
                                                                />
                                                                {mod.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    padding: '10px 20px',
                                    background: '#2e7d32',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    height: '42px',
                                    marginTop: '22px'
                                }}
                            >
                                Adicionar
                            </button>
                        </form>
                        {error && <p style={{ color: 'red', fontSize: '13px', marginTop: '10px' }}>{error}</p>}
                        {success && <p style={{ color: 'green', fontSize: '13px', marginTop: '10px' }}>{success}</p>}
                    </div>

                    {/* Users List Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                <th style={{ padding: '15px', color: '#555' }}>Nome</th>
                                <th style={{ padding: '15px', color: '#555' }}>Usuário</th>
                                <th style={{ padding: '15px', color: '#555' }}>Função</th>
                                <th style={{ padding: '15px', color: '#555' }}>Acesso Unidade</th>
                                <th style={{ padding: '15px', color: '#555' }}>Módulos</th>
                                <th style={{ padding: '15px', color: '#555', textAlign: 'right' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.username} style={{ borderBottom: '1px solid #eee' }}>
                                    {/* Name Column (Editable) */}
                                    <td style={{ padding: '15px', fontWeight: 'bold', color: '#333' }}>
                                        {editingUser === u.username ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    placeholder="Nome"
                                                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }}
                                                />
                                                <input
                                                    type="password"
                                                    value={editPassword}
                                                    onChange={e => setEditPassword(e.target.value)}
                                                    placeholder="Nova Senha (opcional)"
                                                    style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd', width: '100%', fontSize: '12px' }}
                                                />
                                            </div>
                                        ) : (
                                            u.name || '-'
                                        )}
                                    </td>

                                    {/* Username Column (Static) */}
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '30px', height: '30px', background: '#e0f2f1', color: '#00695c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                                                {u.name ? u.name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                                            </div>
                                            {u.username}
                                            {u.username === currentUsername && <span style={{ fontSize: '11px', background: '#eee', padding: '2px 6px', borderRadius: '4px', color: '#666' }}>Você</span>}
                                        </div>
                                    </td>

                                    {/* Role Column (Editable) */}
                                    <td style={{ padding: '15px' }}>
                                        {editingUser === u.username ? (
                                            <select
                                                value={editRole}
                                                onChange={e => setEditRole(e.target.value)}
                                                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            >
                                                <option value="viewer">Viewer</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        ) : (
                                            <span style={{
                                                background: u.role === 'admin' ? '#ffebee' : '#e3f2fd',
                                                color: u.role === 'admin' ? '#c62828' : '#1565c0',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase'
                                            }}>
                                                {u.role === 'viewer' ? 'Visualizador' : 'Admin'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Access Unit Column (Editable) */}
                                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>
                                        {editingUser === u.username ? (
                                            <select
                                                value={editAllowedUnit}
                                                onChange={e => setEditAllowedUnit(e.target.value)}
                                                style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ddd' }}
                                            >
                                                <option value="">Todas</option>
                                                {AVAILABLE_UNITS.map(unit => (
                                                    <option key={unit.id} value={unit.id}>{unit.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            getUnitName(u.allowedUnit)
                                        )}
                                    </td>

                                    {/* Modules Column (Editable) */}
                                    <td style={{ padding: '15px', fontSize: '14px', color: '#666' }}>
                                        {editingUser === u.username ? (
                                            <div style={{ maxWidth: '400px' }}>
                                                {MODULE_CATEGORIES.map(category => {
                                                    const { selected, total } = getCategorySelectionCount(category.id, editAllowedModules);
                                                    const allSelected = selected === total && total > 0;

                                                    return (
                                                        <div key={category.id} style={{ marginBottom: '8px', borderBottom: '1px solid #f0f0f0', paddingBottom: '6px' }}>
                                                            {/* Category Header */}
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', padding: '3px', background: '#f8f9fa', borderRadius: '3px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={allSelected}
                                                                    onChange={() => toggleCategoryEdit(category.id)}
                                                                    style={{ cursor: 'pointer' }}
                                                                />
                                                                <label style={{ flex: 1, fontSize: '11px', fontWeight: '700', color: '#333', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleCategoryEdit(category.id)}>
                                                                    {category.name}
                                                                </label>
                                                                <span style={{ fontSize: '10px', color: '#666', background: selected > 0 ? '#e3f2fd' : '#f5f5f5', padding: '1px 6px', borderRadius: '8px', fontWeight: '600' }}>
                                                                    {selected}/{total}
                                                                </span>
                                                            </div>

                                                            {/* Category Modules */}
                                                            <div style={{ paddingLeft: '20px' }}>
                                                                {category.modules.map(mod => (
                                                                    <label key={mod.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', cursor: 'pointer', padding: '1px 0' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={editAllowedModules.includes(mod.id)}
                                                                            onChange={() => toggleEditModule(mod.id)}
                                                                        />
                                                                        {mod.name}
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: '12px' }}>
                                                {u.allowedModules && u.allowedModules.length > 0
                                                    ? u.allowedModules.length === AVAILABLE_MODULES.length ? 'Todos' : u.allowedModules.map(mid => AVAILABLE_MODULES.find(m => m.id === mid)?.name || mid).join(', ')
                                                    : 'Nenhum'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions Column */}
                                    <td style={{ padding: '15px', textAlign: 'right' }}>
                                        {editingUser === u.username ? (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={saveEdit}
                                                    style={{ background: '#2e7d32', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                >
                                                    Salvar
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    style={{ background: '#ddd', color: '#333', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button
                                                    onClick={() => startEdit(u)}
                                                    style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(u.username)}
                                                    disabled={u.username === currentUsername}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: u.username === currentUsername ? '#ccc' : '#d32f2f',
                                                        cursor: u.username === currentUsername ? 'not-allowed' : 'pointer',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
