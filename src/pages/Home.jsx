import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import logo from '../assets/logo_zephcore_new.png';
import Footer from '../components/Footer';

const Home = () => {
    const { login, isAuthenticated } = useData();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-redirect if already logged in
    useEffect(() => {
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
            background: '#F3F4F6', // GMAD Soft Gray
            fontFamily: 'var(--font-main)'
        }}>

            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                {/* UNIFIED MAIN CARD */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    maxWidth: '900px',
                    width: '100%',
                    minHeight: '550px',
                    overflow: 'hidden'
                }}>

                    {/* LEFT SIDE: Brand & Info */}
                    <div style={{
                        padding: '40px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'white',
                        borderRight: '1px solid #f0f0f0'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '30px'
                        }}>
                            <img
                                src={logo}
                                alt="Zephcore Logo"
                                style={{
                                    height: '55px', // Adjusted for Zephcore logo proportions
                                    width: 'auto',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>

                        <h2 style={{
                            fontSize: '22px',
                            color: '#1A1A1A',
                            marginBottom: '10px',
                            fontWeight: '800',
                            textAlign: 'center',
                            letterSpacing: '-0.01em',
                            lineHeight: '1.2'
                        }}>
                            Workspace Integrado
                        </h2>
                        <p style={{
                            color: '#7f8c8d',
                            textAlign: 'center',
                            fontSize: '17px', // Increased from 15px
                            fontWeight: '500',
                            marginTop: '8px',
                            maxWidth: '340px',
                            lineHeight: '1.5'
                        }}>
                            Inteligência de dados, gestão comercial e controle de processos em um único lugar.
                        </p>
                    </div>

                    {/* RIGHT SIDE: Login Form */}
                    <div style={{
                        padding: '50px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        background: '#fff' // white
                    }}>
                        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#333', marginBottom: '8px' }}>
                                Bem-vindo de volta!
                            </h3>
                            <p style={{ color: '#999', fontSize: '14px' }}>
                                Insira suas credenciais para acessar
                            </p>
                        </div>

                        {error && (
                            <div style={{
                                background: '#ffebee',
                                color: '#c62828',
                                padding: '12px',
                                borderRadius: '4px',
                                marginBottom: '20px',
                                fontSize: '14px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#555' }}>USUÁRIO</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border 0.2s'
                                    }}
                                    placeholder="Seu usuário"
                                    onFocus={(e) => e.target.style.borderColor = '#1E88E5'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#555' }}>SENHA</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px 15px',
                                        borderRadius: '4px',
                                        border: '1px solid #ddd',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'border 0.2s'
                                    }}
                                    placeholder="••••••••"
                                    onFocus={(e) => e.target.style.borderColor = '#546e7a'}
                                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: '#1E88E5', // ZEPHCORE Blue
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '800',
                                    cursor: loading ? 'wait' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    boxShadow: '0 4px 6px -1px rgba(30, 136, 229, 0.3)'
                                }}
                                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#1976D2')}
                                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#1E88E5')}
                            >
                                {loading ? 'Entrando...' : 'ENTRAR'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
