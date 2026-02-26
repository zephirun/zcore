import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

import React, { useState } from 'react';

const AIQueryInput = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        if (query.trim()) {
            setLoading(true);

            // Simulate AI response (in production, this would call an actual AI API)
            setTimeout(() => {
                const mockResponse = generateMockResponse(query);
                setResponse(mockResponse);
                setLoading(false);
            }, 1500);

            if (onSearch) onSearch(query);
        }
    };

    const generateMockResponse = (query) => {
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes('top') || lowerQuery.includes('melhor')) {
            return '📊 Com base nos dados atuais, os top vendedores são aqueles com maior faturamento. Verifique os gráficos abaixo para detalhes visuais.';
        } else if (lowerQuery.includes('margem')) {
            return '📈 A margem média está calculada com base em todos os registros. Clientes com margens acima da média são destacados nos relatórios.';
        } else if (lowerQuery.includes('prazo')) {
            return '⏱️ O prazo médio de pagamento é calculado pela média ponderada de todos os clientes. Prazos mais longos podem indicar necessidade de revisão de políticas.';
        } else {
            return '🤖 Desculpe, ainda estou aprendendo! Tente perguntas sobre: top vendedores, margem média, ou prazo de pagamento.';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>
            <div style={{
                position: 'relative',
                marginBottom: response ? '20px' : '0'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '20px',
                    transform: 'translateY(-50%)',
                    color: '#a855f7',
                    pointerEvents: 'none',
                    zIndex: 1
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5c0-2 2-2 2-2" />
                        <path d="M8.5 8.5v.01" />
                        <path d="M16 15.5v.01" />
                        <path d="M12 12v.01" />
                    </svg>
                </div>
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Pergunte à IA sobre seus dados (ex: 'Quais são os top 5 vendedores?')..."
                    style={{
                        width: '100%',
                        padding: '18px 60px 18px 55px',
                        borderRadius: '50px',
                        border: 'none',
                        background: 'rgba(255, 255, 255, 0.95)',
                        color: '#1f2937',
                        fontSize: '1rem',
                        outline: 'none',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                    }}
                    onFocus={(e) => {
                        e.target.style.boxShadow = '0 15px 50px rgba(139, 92, 246, 0.4)';
                        e.target.style.transform = 'translateY(-2px)';
                    }}
                    onBlur={(e) => {
                        e.target.style.boxShadow = '0 10px 40px rgba(0,0,0,0.2)';
                        e.target.style.transform = 'translateY(0)';
                    }}
                />
                <Button
                    onClick={handleSearch}
                    disabled={loading}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '42px',
                        height: '42px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}
                    onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-50%) scale(1.1)')}
                    onMouseLeave={(e) => (e.target.style.transform = 'translateY(-50%) scale(1)')}
                >
                    {loading ? (
                        <div style={{
                            width: '18px',
                            height: '18px',
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTop: '3px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }} />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    )}
                </Button>
            </div>

            {response && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '20px 25px',
                    borderRadius: '20px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    backdropFilter: 'blur(10px)',
                    animation: 'fadeIn 0.5s ease',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>🤖</span>
                        </div>
                        <p style={{
                            margin: 0,
                            color: '#374151',
                            lineHeight: '1.6',
                            fontSize: '0.95rem'
                        }}>
                            {response}
                        </p>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AIQueryInput;
