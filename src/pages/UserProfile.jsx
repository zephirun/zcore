import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';

import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const profileSchema = z.object({
    displayName: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional()
}).refine((data) => {
    if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword.length >= 3;
    }
    return true;
}, {
    message: "A senha deve ter pelo menos 3 caracteres.",
    path: ["newPassword"]
}).refine((data) => {
    if (data.newPassword || data.confirmPassword) {
        return data.newPassword === data.confirmPassword;
    }
    return true;
}, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"]
});

const UserProfile = () => {
    const { username, name, avatarUrl, updateUser, userRole } = useData();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(profileSchema),
        mode: 'onTouched',
        defaultValues: {
            displayName: name || '',
            newPassword: '',
            confirmPassword: ''
        }
    });

    // Watch for disable logic
    const newPasswordValue = watch('newPassword');

    const [status, setStatus] = useState({ type: '', message: '' });

    // Image Upload State
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (name) {
            reset({
                displayName: name,
                newPassword: '',
                confirmPassword: ''
            });
        }
    }, [name, reset]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onFormSubmit = async (data) => {
        setStatus({ type: '', message: '' });

        const updates = {
            name: data.displayName
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

        if (data.newPassword) {
            updates.password = data.newPassword;
        }

        try {
            await updateUser(username, updates);
            setStatus({ type: 'success', message: 'Perfil atualizado com sucesso!' });
            reset({ displayName: data.displayName, newPassword: '', confirmPassword: '' });

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

                <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--bg-card)',
                        padding: 'var(--space-1)',
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
                            fontSize: 'var(--text-4xl)',
                            fontWeight: 'var(--font-bold)',
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
                                fontWeight: 'var(--font-bold)',
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
                    <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: 'var(--text-3xl)', fontWeight: '800', letterSpacing: '-0.02em' }}>
                        {formData.displayName || name}
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'var(--font-medium)' }}>
                        {userRole === 'admin' ? 'Administrador do Sistema' : 'Usuário'}
                    </p>
                </div>

                {status.message && (
                    <div style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--space-3)',
                        marginBottom: 'var(--space-6)',
                        fontSize: '13px',
                        textAlign: 'left',
                        fontWeight: 'var(--font-semibold)',
                        background: status.type === 'error' ? 'var(--color-error-dim)' : 'var(--color-success-dim)',
                        color: status.type === 'error' ? 'var(--color-error)' : 'var(--color-success)',
                        border: `1px solid ${status.type === 'error' ? 'var(--color-error)20' : 'var(--color-success)20'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)'
                    }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto'}}>
                    <Input
                        label="Usuário (Login)"
                        type="text"
                        defaultValue={username || ''}
                        disabled
                    />

                    <Input
                        label="Nome de Exibição"
                        type="text"
                        placeholder="Seu nome completo"
                        error={errors.displayName?.message}
                        {...register('displayName')}
                    />

                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '8px 0', opacity: 0.5 }}></div>

                    <Input
                        label="Nova Senha (Opcional)"
                        type="password"
                        placeholder="••••••••"
                        error={errors.newPassword?.message}
                        {...register('newPassword')}
                    />

                    <Input
                        label="Confirmar Nova Senha"
                        type="password"
                        placeholder="••••••••"
                        disabled={!newPasswordValue}
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />

                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-4)' }}>
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
