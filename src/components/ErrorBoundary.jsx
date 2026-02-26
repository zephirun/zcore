import Button from '@/components/ui/Button';

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '40px', fontFamily: 'sans-serif', background: '#fff0f0', color: '#333' }}>
                    <h1>⚠️ Algo deu errado.</h1>
                    <p>Ocorreu um erro inesperado na aplicação.</p>
                    <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px', padding: '10px', background: 'white', border: '1px solid #ccc' }}>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <Button
                        onClick={() => window.location.href = '/'}
                        style={{ marginTop: '20px', padding: '10px 20px', background: '#3498db', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        Voltar para a Home
                    </Button>
                    <Button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        style={{ marginLeft: '10px', marginTop: '20px', padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        Limpar Dados e Recarregar
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
