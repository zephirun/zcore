import React from 'react';
import Button from './Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    width: '100%',
                    padding: 'var(--space-6)',
                    fontFamily: 'var(--font-main)',
                    background: 'var(--bg-main)'
                }}>
                    <div style={{
                        maxWidth: '600px',
                        width: '100%',
                        background: 'var(--bg-card)',
                        padding: 'var(--space-10)',
                        borderRadius: 'var(--space-6)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)'
                    }}>
                        <div style={{
                            width: 'var(--space-16)',
                            height: 'var(--space-16)',
                            borderRadius: '50%',
                            background: 'rgba(211, 47, 47, 0.1)',
                            color: 'var(--color-error)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 'var(--space-6)'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>

                        <h1 style={{
                            fontSize: 'var(--space-6)',
                            fontWeight: 'var(--font-extrabold)',
                            color: 'var(--text-main)',
                            margin: '0 0 12px 0',
                            letterSpacing: '-0.02em'
                        }}>
                            Algo deu errado
                        </h1>
                        <p style={{
                            fontSize: '15px',
                            color: 'var(--text-secondary)',
                            margin: '0 0 24px 0',
                            lineHeight: '1.5'
                        }}>
                            Um erro inesperado ocorreu. Nossa equipe de engenharia foi notificada (se conectado) e já estamos verificando.
                        </p>

                        {process.env.NODE_ENV === 'development' && (
                            <details style={{
                                whiteSpace: 'pre-wrap',
                                marginTop: 'var(--space-5)',
                                marginBottom: 'var(--space-8)',
                                padding: 'var(--space-4)',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--space-3)',
                                fontSize: '13px',
                                color: 'var(--color-error)',
                                maxHeight: '300px',
                                overflowY: 'auto',
                                fontFamily: 'monospace'
                            }}>
                                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: 'var(--space-2)', color: 'var(--text-main)' }}>Detalhes do Erro (Apenas Dev)</summary>
                                {this.state.error && this.state.error.toString()}
                                <br />
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
                            </details>
                        )}

                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            <Button
                                onClick={() => window.location.href = '/'}
                                style={{
                                    flex: 1,
                                    padding: 'var(--space-3)',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 'var(--space-4)',
                                    fontWeight: 'var(--font-semibold)',
                                    cursor: 'pointer'
                                }}
                            >
                                Voltar para o Início
                            </Button>
                            <Button
                                onClick={() => {
                                    localStorage.clear();
                                    sessionStorage.clear();
                                    window.location.reload();
                                }}
                                style={{
                                    flex: 1,
                                    padding: 'var(--space-3)',
                                    background: 'transparent',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--space-4)',
                                    fontWeight: 'var(--font-semibold)',
                                    cursor: 'pointer'
                                }}
                            >
                                Limpar & Recarregar
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
