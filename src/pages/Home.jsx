import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import videoBg from '../assets/ZEPH.webm';
import logoZeph from '../assets/logo_zeph_new.png';
import Footer from '../components/Footer';

const Home = () => {
    const { login, isAuthenticated } = useData();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        document.title = "ZEPH | Core";
        if (isAuthenticated) {
            navigate('/units');
        }
    }, [isAuthenticated, navigate]);



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await login(username, password);

        if (success) {
            navigate('/units');
        } else {
            setError('Usuário ou senha incorretos.');
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-obsidian, #000)',
            fontFamily: 'var(--font-main)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* SCALED VIDEO BACKGROUND */}
            <video
                autoPlay
                loop
                muted
                playsInline
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0,
                    opacity: 0.6 // Slightly darker for better contrast
                }}
            >
                <source src={videoBg} type="video/webm" />
            </video>

            {/* DARK OVERLAY FOR CONTRAST & PREMIUM FEEL */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at center, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.85) 100%)',
                zIndex: 1,
                backdropFilter: 'blur(3px)'
            }} />

            <div style={{
                position: 'relative',
                zIndex: 10,
                width: '100%',
                maxWidth: '440px',
                padding: '24px'
            }}>
                {/* GLASSMORPHISM CARD */}
                <div style={{
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    borderRadius: 'var(--radius-lg, 24px)',
                    boxShadow: 'var(--glass-shadow)',
                    padding: '48px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    border: 'var(--glass-border)'
                }}>
                    <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '12px',
                            borderRadius: '16px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                        }}>
                            <img
                                src={logoZeph}
                                alt="ZEPH"
                                style={{
                                    width: '42px',
                                    height: '42px',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                        <h3 style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 8px 0' }}>
                            Bem-vindo ao ZEPH
                        </h3>
                        <p style={{
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '15px',
                            fontWeight: '500',
                            letterSpacing: '0.01em'
                        }}>
                            Acesse o ecossistema
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#fca5a5',
                            padding: '14px',
                            borderRadius: '12px',
                            marginBottom: '24px',
                            fontSize: '14px',
                            textAlign: 'center',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: 'rgba(255,255,255,0.6)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Usuário
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px 16px 16px 44px',
                                        borderRadius: '14px',
                                        border: '1px solid var(--border-input)',
                                        backgroundColor: 'var(--bg-input)',
                                        color: 'var(--text-main)',
                                        fontSize: '16px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    placeholder="Seu usuário"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--color-primary)';
                                        e.target.style.backgroundColor = 'var(--bg-hover)';
                                        e.target.style.boxShadow = '0 0 10px var(--color-primary-glow)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-input)';
                                        e.target.style.backgroundColor = 'var(--bg-input)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                                >
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: 'rgba(255,255,255,0.6)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em'
                            }}>
                                Senha
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '16px 16px 16px 44px',
                                        borderRadius: '14px',
                                        border: '1px solid var(--border-input)',
                                        backgroundColor: 'var(--bg-input)',
                                        color: 'var(--text-main)',
                                        fontSize: '16px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    placeholder="••••••••"
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--color-primary)';
                                        e.target.style.backgroundColor = 'var(--bg-hover)';
                                        e.target.style.boxShadow = '0 0 10px var(--color-primary-glow)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-input)';
                                        e.target.style.backgroundColor = 'var(--bg-input)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                                >
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '16px',
                                transform: loading ? 'scale(0.98)' : 'scale(1)',
                                background: 'var(--color-primary)',
                                boxShadow: '0 4px 20px var(--color-primary-glow)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '14px',
                                fontSize: '15px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                marginBottom: '24px'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                    e.currentTarget.style.boxShadow = '0 0 30px rgba(59, 130, 246, 0.6)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.4)';
                                }
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <svg className="spinner" viewBox="0 0 50 50" style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }}>
                                        <circle cx="25" cy="25" r="20" fill="none" stroke="white" strokeWidth="4" strokeDasharray="80" strokeDashoffset="0"></circle>
                                    </svg>
                                    Acessando...
                                </span>
                            ) : 'Entrar no Sistema'}
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <a
                                href="https://wa.me/5547991047677"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: 'rgba(255,255,255,0.6)',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    textDecoration: 'none',
                                    transition: 'color 0.2s',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'white'}
                                onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.6)'}
                            >
                                Não tem acesso a plataforma?
                                <span style={{ textDecoration: 'underline' }}>Entre em contato</span>
                            </a>
                        </div>
                    </form>
                </div>
            </div>

            <div style={{ position: 'absolute', bottom: '20px', zIndex: 10 }}>
                <Footer transparent={true} textColor="rgba(255,255,255,0.6)" />
            </div>

            <style>{`
                @keyframes spin {
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div >
    );
};

export default Home;
