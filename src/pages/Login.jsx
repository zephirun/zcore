import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import logoZeph from '../assets/logo_zeph_new.png';

// Validation schema
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
            fontFamily: 'var(--font-main)',
        }}>
            {/* LEFT — Branding */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '48px 56px',
                borderRight: '1px solid var(--border-color)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={logoZeph} alt="ZCore" style={{ height: '32px', objectFit: 'contain' }} />
                </div>

                <div>
                    <h1 style={{
                        fontSize: '40px',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        letterSpacing: '-0.04em',
                        lineHeight: '1.1',
                        marginBottom: '16px',
                    }}>
                        Plataforma<br />Integrada Z.CORE
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '15px',
                        lineHeight: '1.6',
                        maxWidth: '340px',
                        letterSpacing: '-0.01em',
                    }}>
                        Inteligência de dados, gestão comercial e controle de processos num único lugar.
                    </p>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
                    © {new Date().getFullYear()} Z.CORE. Todos os direitos reservados.
                </p>
            </div>

            {/* RIGHT — Login form */}
            <div style={{
                width: '420px',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '48px 56px',
                background: 'var(--bg-card)',
            }}>
                <div style={{ marginBottom: '36px' }}>
                    <h2 style={{
                        fontSize: '22px',
                        fontWeight: '700',
                        color: 'var(--text-main)',
                        letterSpacing: '-0.03em',
                        marginBottom: '6px',
                    }}>
                        Bem-vindo de volta
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
                        Insira suas credenciais para continuar
                    </p>
                </div>

                <form onSubmit={handleSubmit(onFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                    <Input
                        label="Usuário"
                        placeholder="Seu usuário de acesso"
                        autoComplete="username"
                        error={errors.username?.message}
                        {...register('username')}
                    />

                    <Input
                        type="password"
                        label="Senha"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    {authError && (
                        <div style={{
                            marginTop: '8px',
                            padding: '10px 14px',
                            background: 'var(--color-error-bg, rgba(224, 48, 80, 0.08))',
                            color: 'var(--color-error)',
                            fontSize: '13px',
                            borderRadius: '16px',
                            border: '1px solid var(--color-error-border, rgba(224, 48, 80, 0.2))',
                            letterSpacing: '-0.01em',
                        }}>
                            {authError}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: 'var(--text-main)',
                            color: 'var(--bg-main)',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            letterSpacing: '-0.01em',
                            fontFamily: 'var(--font-main)',
                            transition: 'transform var(--motion-fast) var(--ease-standard), opacity var(--motion-fast) var(--ease-standard)',
                            opacity: isLoading ? 0.6 : 1,
                        }}
                        onMouseEnter={e => { if (!isLoading) e.currentTarget.style.opacity = '0.85'; }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = isLoading ? '0.6' : '1'; }}
                    >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Login;
