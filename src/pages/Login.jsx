import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, switchUnit } = useData();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const result = await login(username, password);
            if (result && result.success) {
                const foundUser = result.user;
                // Check if user is restricted to a single unit
                const allowedUnit = foundUser.allowedUnit;

                if (allowedUnit && allowedUnit !== 'null') {
                    switchUnit(allowedUnit);
                    navigate('/menu');
                } else {
                    navigate('/units');
                }
            } else {
                setError('Usuário ou senha incorretos');
            }
        } catch (err) {
            setError('Erro ao realizar login');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F3F4F6', // GMAD Soft Gray background
            fontFamily: 'var(--font-main)',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                borderRadius: '12px',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                width: '100%',
                maxWidth: '900px',
                display: 'flex',
                overflow: 'hidden',
                minHeight: '550px'
            }}>
                {/* LEFT COLUMN: Branding & Slogan */}
                <div style={{
                    flex: '1',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px',
                    borderRight: '1px solid #F1F1F1',
                    textAlign: 'center'
                }}>
                    <img
                        src={logo}
                        alt="GMAD"
                        style={{
                            height: '80px',
                            marginBottom: '40px',
                            objectFit: 'contain'
                        }}
                    />
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        marginBottom: '16px',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.1'
                    }}>
                        Plataforma Integrada
                    </h1>
                    <p style={{
                        color: '#666',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        maxWidth: '280px'
                    }}>
                        A solução completa para inteligência de dados, gestão comercial e controle de processos.
                    </p>
                </div>

                {/* RIGHT COLUMN: Login Form */}
                <div style={{
                    flex: '1',
                    padding: '60px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '800',
                            color: 'var(--text-main)',
                            marginBottom: '8px'
                        }}>
                            Bem-vindo de volta!
                        </h2>
                        <p style={{
                            color: '#666',
                            fontSize: '14px'
                        }}>
                            Insira suas credenciais para acessar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ textAlign: 'left' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: '#444',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>Usuário</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Seu usuário"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    background: 'var(--bg-input)',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    fontFamily: 'var(--font-main)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--color-primary)';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(228, 87, 55, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#E5E7EB';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div style={{ textAlign: 'left' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '12px',
                                fontWeight: '700',
                                color: '#444',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    fontSize: '15px',
                                    background: 'var(--bg-input)',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    fontFamily: 'var(--font-main)'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--color-primary)';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(228, 87, 55, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#E5E7EB';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {error && (
                            <div style={{
                                padding: '12px',
                                background: '#FFF5F5',
                                color: '#E02424',
                                fontSize: '13px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                border: '1px solid #FDA4AF'
                            }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="active-press"
                            style={{
                                padding: '16px',
                                background: 'var(--color-primary)', // GMAD Orange
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '800',
                                marginTop: '10px',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase',
                                fontFamily: 'var(--font-main)',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 6px -1px rgba(228, 87, 55, 0.3)'
                            }}
                        >
                            ENTRAR
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
