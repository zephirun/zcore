import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import logoZeph from '../assets/logo_zeph_new.png';

// 1. Validation Schema
const loginSchema = z.object({
    username: z.string().min(1, 'Informe seu usuário para acessar.'),
    password: z.string().min(1, 'A senha é obrigatória.'),
});

const Login = () => {
    const [authError, setAuthError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, switchUnit } = useData();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(loginSchema),
        mode: 'onTouched',
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const onFormSubmit = async (data) => {
        setAuthError('');
        setIsLoading(true);

        try {
            const result = await login(data.username, data.password);
            if (result && result.success) {
                const foundUser = result.user;
                const allowedUnit = foundUser.allowedUnit;
                if (allowedUnit && allowedUnit !== 'null') {
                    switchUnit(allowedUnit);
                    navigate('/menu');
                } else {
                    navigate('/units');
                }
            } else {
                setAuthError('Usuário ou senha incorretos');
            }
        } catch (err) {
            setAuthError('Erro ao realizar login no servidor');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-main)',
        }}>
            {/* LEFT — Branding Section */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: 'var(--space-12)',
                borderRight: '1px solid var(--border-subtle)',
                background: 'var(--bg-main)',
                textAlign: 'left'
            }}>
                <div /> {/* Spacer for top */}

                <div style={{ maxWidth: '440px', paddingLeft: '24px' }}>
                    <div style={{ marginBottom: "var(--space-4)", display: 'flex', justifyContent: 'flex-start' }}>
                        <img src={logoZeph} alt="ZCore" style={{ height: '48px', objectFit: 'contain' }} />
                    </div>
                    <h1 style={{
                        fontSize: '42px',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        letterSpacing: '-0.04em',
                        lineHeight: '1.1',
                        marginBottom: "var(--space-4)",
                    }}>
                        Plataforma<br />Integrada Z.CORE
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        letterSpacing: '-0.01em',
                    }}>
                        Inteligência de dados, gestão comercial e controle de processos corporativos em uma arquitetura unificada.
                    </p>
                </div>

                <p style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    letterSpacing: '-0.01em',
                    margin: 0,
                    paddingLeft: '24px'
                }}>
                    © {new Date().getFullYear()} Z.CORE. Todos os direitos reservados.
                </p>
            </div>

            {/* RIGHT — Login area */}
            <div style={{
                width: '480px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-card)',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.05)',
                zIndex: 1
            }}>
                <div style={{ width: '100%', maxWidth: '320px' }}>
                    <div style={{ marginBottom: "var(--space-4)", textAlign: 'left' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: 'var(--font-bold)',
                            color: 'var(--text-main)',
                            letterSpacing: '-0.02em',
                            marginBottom: 'var(--space-4)',
                        }}>
                            Bem-vindo de volta!
                        </h2>
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                            Insira suas credenciais para continuar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px', margin: '0 auto' }}>
                        <Input
                            label="Usuário"
                            placeholder="Seu usuário de acesso"
                            autoComplete="username"
                            error={errors.username}
                            {...register('username')}
                            containerStyle={{ marginBottom: '12px' }}
                        />

                        <Input
                            type="password"
                            label="Senha"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            error={errors.password}
                            {...register('password')}
                            containerStyle={{ marginBottom: '12px' }}
                        />

                        {authError && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'var(--color-error-light)',
                                color: 'var(--color-error-strong)',
                                fontSize: '13px',
                                borderRadius: 'var(--radius)',
                                border: '1px solid var(--color-error)',
                                marginBottom: "var(--space-4)",
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-4)',
                                fontWeight: '500'
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {authError}
                            </div>
                        )}

                        <Button
                            type="submit"
                            isLoading={isLoading}
                            fullWidth
                            variant="primary"
                            style={{
                                marginTop: '24px',
                                height: '44px',
                                background: 'var(--color-info-strong)',
                                color: '#ffffff',
                                fontSize: '16px',
                                fontWeight: '600',
                                borderRadius: 'var(--radius-sm)',
                                transition: 'all var(--motion-base) var(--ease-standard)',
                            }}
                        >
                            Entrar
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
