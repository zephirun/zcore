import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const UserProfile = () => {
    const { username, name, updateUser } = useData();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        displayName: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });

    useEffect(() => {
        if (name) {
            setFormData(prev => ({ ...prev, displayName: name }));
        }
    }, [name]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (!formData.displayName.trim()) {
            setStatus({ type: 'error', message: 'O nome não pode estar vazio.' });
            return;
        }

        const updates = {
            name: formData.displayName
        };

        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setStatus({ type: 'error', message: 'As senhas não coincidem.' });
                return;
            }
            if (formData.newPassword.length < 3) {
                setStatus({ type: 'error', message: 'A senha deve ter pelo menos 3 caracteres.' });
                return;
            }
            updates.password = formData.newPassword;
        }

        try {
            updateUser(username, updates);
            setStatus({ type: 'success', message: 'Perfil atualizado com sucesso!' });
            setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));

            // Clear success message after 3 seconds
            setTimeout(() => {
                setStatus({ type: '', message: '' });
            }, 3000);
        } catch (error) {
            setStatus({ type: 'error', message: 'Erro ao atualizar perfil.' });
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '40px 20px'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 10px 15px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '500px',
                    padding: '30px',
                    border: '1px solid #e1e4e8'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: '#3498db',
                            color: 'white',
                            fontSize: '32px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 15px auto',
                            boxShadow: '0 4px 10px rgba(52, 152, 219, 0.3)'
                        }}>
                            {name ? name.charAt(0).toUpperCase() : (username ? username.charAt(0).toUpperCase() : 'U')}
                        </div>
                        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '24px' }}>Meu Perfil</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>Gerencie suas informações pessoais</p>
                    </div>

                    {status.message && (
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '14px',
                            textAlign: 'center',
                            fontWeight: '500',
                            background: status.type === 'error' ? '#ffebee' : '#e8f5e9',
                            color: status.type === 'error' ? '#c62828' : '#2e7d32',
                            border: `1px solid ${status.type === 'error' ? '#ffcdd2' : '#c8e6c9'}`
                        }}>
                            {status.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Username (Read Only) */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#34495e', textTransform: 'uppercase' }}>
                                Usuário (Login)
                            </label>
                            <input
                                type="text"
                                value={username || ''}
                                disabled
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #e0e0e0',
                                    background: '#f9f9f9',
                                    color: '#7f8c8d',
                                    fontSize: '15px',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </div>

                        {/* Name */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#34495e', textTransform: 'uppercase' }}>
                                Nome de Exibição
                            </label>
                            <input
                                type="text"
                                name="displayName"
                                value={formData.displayName}
                                onChange={handleChange}
                                placeholder="Seu nome completo"
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #dcdfe6',
                                    fontSize: '15px',
                                    color: '#2c3e50',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                                onBlur={(e) => e.target.style.borderColor = '#dcdfe6'}
                            />
                        </div>

                        <div style={{ height: '1px', background: '#eee', margin: '5px 0' }}></div>

                        {/* New Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#34495e', textTransform: 'uppercase' }}>
                                Nova Senha (Opcional)
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Deixe em branco para manter a atual"
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #dcdfe6',
                                    fontSize: '15px',
                                    color: '#2c3e50',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                                onBlur={(e) => e.target.style.borderColor = '#dcdfe6'}
                            />
                        </div>

                        {/* Confirm Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '600', color: '#34495e', textTransform: 'uppercase' }}>
                                Confirmar Nova Senha
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Repita a nova senha"
                                disabled={!formData.newPassword}
                                style={{
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #dcdfe6',
                                    fontSize: '15px',
                                    color: '#2c3e50',
                                    outline: 'none',
                                    background: !formData.newPassword ? '#f9f9f9' : 'white',
                                    transition: 'border-color 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#3498db'}
                                onBlur={(e) => e.target.style.borderColor = '#dcdfe6'}
                            />
                        </div>

                        <div style={{ marginTop: '10px', display: 'flex', gap: '15px' }}>
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid #dcdfe6',
                                    background: 'white',
                                    color: '#555',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#f5f7fa'}
                                onMouseOut={(e) => e.target.style.background = 'white'}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: '#3498db',
                                    color: 'white',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 12px rgba(52, 152, 219, 0.3)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#2980b9'}
                                onMouseOut={(e) => e.target.style.background = '#3498db'}
                            >
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
