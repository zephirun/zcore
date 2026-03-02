import re

file_path = 'src/pages/UserProfile.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# 1. Imports
imports = """import Button from '@/components/ui/Button';
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
});"""

content = re.sub(r'import Button.*?\nconst UserProfile', imports + '\n\nconst UserProfile', content, flags=re.DOTALL)

# 2. Setup hook form inside component
hook_setup = """const UserProfile = () => {
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
    };"""

content = re.sub(r'const UserProfile = \(\) => \{.+?return \(', hook_setup + '\n\n    return (', content, flags=re.DOTALL)

# 3. Form markup replacement
form_start_old = "<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>"
form_start_new = "<form onSubmit={handleSubmit(onFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>"
content = content.replace(form_start_old, form_start_new)

# username disabled input
content = content.replace('value={username || \'\'}', 'defaultValue={username || \'\'}')

# inputs
display_name_old = """                    <Input
                        label="Nome de Exibição"
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                    />"""

display_name_new = """                    <Input
                        label="Nome de Exibição"
                        type="text"
                        placeholder="Seu nome completo"
                        error={errors.displayName?.message}
                        {...register('displayName')}
                    />"""
content = content.replace(display_name_old, display_name_new)

password_old = """                    <Input
                        label="Nova Senha (Opcional)"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                    />"""

password_new = """                    <Input
                        label="Nova Senha (Opcional)"
                        type="password"
                        placeholder="••••••••"
                        error={errors.newPassword?.message}
                        {...register('newPassword')}
                    />"""
content = content.replace(password_old, password_new)

confirm_old = """                    <Input
                        label="Confirmar Nova Senha"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        disabled={!formData.newPassword}
                    />"""

confirm_new = """                    <Input
                        label="Confirmar Nova Senha"
                        type="password"
                        placeholder="••••••••"
                        disabled={!newPasswordValue}
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />"""
content = content.replace(confirm_old, confirm_new)

with open(file_path, 'w') as f:
    f.write(content)
