import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';

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
        <PageContainer
            maxWidth="600px"
            title="Meu Perfil"
            subtitle="Gerencie suas informações pessoais e segurança"
            style={{ margin: '0 auto' }}
        >
            <Card padding="var(--space-8)" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Decorative header */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: '100px',
                    background: 'linear-gradient(135deg, var(--color-primary-dim) 0%, var(--bg-hover) 100%)',
                    zIndex: 0
                }}></div>

                <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--bg-card)',
                        padding: '4px',
                        margin: '0 auto 20px auto',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'var(--bg-input)',
                            color: 'var(--text-muted)',
                            fontSize: '40px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative',
                            border: '1px solid var(--border-color)'
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
                                background: 'rgba(0,0,0,0.4)',
                                color: 'white',
                                fontSize: '10px',
                                fontWeight: '700',
                                padding: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backdropFilter: 'blur(4px)',
                                transition: 'all 0.2s ease'
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
                    <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.02em' }}>
                        {formData.displayName || name}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500' }}>
                        {userRole === 'admin' ? 'Administrador do Sistema' : 'Usuário'}
                    </p>
                </div>

                {status.message && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '13px',
                        textAlign: 'left',
                        fontWeight: '600',
                        background: status.type === 'error' ? 'var(--color-error-dim)' : 'var(--color-success-dim)',
                        color: status.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
                        border: `1px solid ${status.type === 'error' ? 'var(--color-error)20' : 'var(--color-success)20'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
                    <Input
                        label="Usuário (Login)"
                        type="text"
                        value={username || ''}
                        disabled
                    />

                    <Input
                        label="Nome de Exibição"
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                    />

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0', opacity: 0.5 }}></div>

                    <Input
                        label="Nova Senha (Opcional)"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                    />

                    <Input
                        label="Confirmar Nova Senha"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        disabled={!formData.newPassword}
                    />

                    <div style={{ marginTop: '12px', display: 'flex', gap: '12px' }}>
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => navigate('/menu')}
                            style={{ flex: 1 }}
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            style={{ flex: 2 }}
                        >
                            Salvar Alterações
                        </Button>
                    </div>
                </form>
            </Card>
        </PageContainer>
    );
};

export default UserProfile;
