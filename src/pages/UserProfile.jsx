import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import * as api from '../services/api';

const UserProfile = () => {
    const { username, name, avatarUrl, updateUser, userRole } = useData();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        displayName: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [status, setStatus] = useState({ type: '', message: '' });

    // Image Upload State
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (name) {
            setFormData(prev => ({ ...prev, displayName: name }));
        }
    }, [name]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: '', message: '' });

        if (!formData.displayName.trim()) {
            setStatus({ type: 'error', message: 'O nome não pode estar vazio.' });
            return;
        }

        const updates = {
            name: formData.displayName
        };

        // Upload Image if selected
        if (selectedImage) {
            setUploading(true);
            const uploadRes = await api.uploadProfilePicture(selectedImage, username);
            setUploading(false);

            if (uploadRes.success) {
                updates.avatarUrl = uploadRes.url;
            } else {
                setStatus({ type: 'error', message: 'Erro ao fazer upload da imagem: ' + uploadRes.error });
                return;
            }
        }

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
            await updateUser(username, updates);
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
        <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)', fontFamily: 'var(--font-main)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Header title="Meu Perfil" />

                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        background: 'var(--bg-card)',
                        borderRadius: '24px',
                        boxShadow: 'var(--shadow-lg)',
                        width: '100%',
                        maxWidth: '550px',
                        padding: '40px',
                        border: '1px solid var(--border-color)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Decorative background element */}
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: '120px',
                            background: 'linear-gradient(135deg, var(--color-primary) 0%, #1565C0 100%)',
                            opacity: 0.1,
                            zIndex: 0
                        }}></div>

                        <div style={{ textAlign: 'center', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
                            <div style={{
                                width: '130px',
                                height: '130px',
                                borderRadius: '50%',
                                background: 'var(--bg-card)',
                                padding: '6px',
                                margin: '0 auto 20px auto',
                                boxShadow: 'var(--shadow-md)'
                            }}>
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    fontSize: '52px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    {imagePreview || avatarUrl ? (
                                        <img
                                            src={imagePreview || avatarUrl}
                                            alt="Profile"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        name ? name.charAt(0).toUpperCase() : (username ? username.charAt(0).toUpperCase() : 'U')
                                    )}

                                    <label htmlFor="avatar-upload" style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        background: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        padding: '6px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        backdropFilter: 'blur(4px)'
                                    }}>
                                        {uploading ? '...' : 'ALTERAR'}
                                    </label>
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '26px', fontWeight: '800' }}>{formData.displayName || name}</h2>
                            <p style={{ margin: '6px 0 0 0', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>
                                {userRole === 'admin' ? 'Administrador do Sistema' : 'Usuário'}
                            </p>
                        </div>

                        {status.message && (
                            <div style={{
                                padding: '14px',
                                borderRadius: '12px',
                                marginBottom: '24px',
                                fontSize: '14px',
                                textAlign: 'center',
                                fontWeight: '600',
                                background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                color: status.type === 'error' ? '#ef4444' : '#22c55e',
                                border: `1px solid ${status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
                            }}>
                                {status.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>

                            {/* Username (Read Only) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Usuário (Login)
                                </label>
                                <input
                                    type="text"
                                    value={username || ''}
                                    disabled
                                    style={{
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-input)',
                                        color: 'var(--text-muted)',
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        cursor: 'not-allowed'
                                    }}
                                />
                            </div>

                            {/* Name */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Nome de Exibição
                                </label>
                                <input
                                    type="text"
                                    name="displayName"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                    placeholder="Seu nome completo"
                                    style={{
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-input)',
                                        background: 'var(--bg-input)',
                                        fontSize: '15px',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        fontWeight: '500'
                                    }}
                                    className="input-focus"
                                />
                            </div>

                            <div style={{ height: '1px', background: 'var(--border-color)', margin: '10px 0', opacity: 0.5 }}></div>

                            {/* New Password */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Nova Senha (Opcional)
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    style={{
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-input)',
                                        background: 'var(--bg-input)',
                                        fontSize: '15px',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        transition: 'all 0.2s',
                                        fontWeight: '500'
                                    }}
                                    className="input-focus"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Confirmar Nova Senha
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    disabled={!formData.newPassword}
                                    style={{
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-input)',
                                        background: 'var(--bg-input)',
                                        fontSize: '15px',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        opacity: !formData.newPassword ? 0.6 : 1,
                                        transition: 'all 0.2s',
                                        fontWeight: '500'
                                    }}
                                    className="input-focus"
                                />
                            </div>

                            <div style={{ marginTop: '20px', display: 'flex', gap: '16px' }}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/menu')}
                                    style={{
                                        flex: 1,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-card)',
                                        color: 'var(--text-main)',
                                        fontSize: '15px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.background = 'var(--bg-input)';
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.background = 'var(--bg-card)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    Voltar
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        flex: 2,
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: 'none',
                                        background: 'var(--color-primary)',
                                        color: 'white',
                                        fontSize: '15px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(30, 136, 229, 0.3)',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.opacity = '0.9';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 6px 16px rgba(30, 136, 229, 0.4)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.opacity = '1';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(30, 136, 229, 0.3)';
                                    }}
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                .input-focus:focus {
                    border-color: var(--color-primary) !important;
                    box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
                }
            `}</style>
        </div>
    );
};

export default UserProfile;
