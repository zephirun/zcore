import React from 'react';
import logoZephcore from '../assets/logo_zephcore_new.png';

const Footer = () => {
    return (
        <footer className="no-print" style={{
            width: '100%',
            background: '#1565C0', // ZEPHCORE Deep Blue
            color: 'rgba(255,255,255,0.9)',
            fontSize: '12px',
            marginTop: 'auto',
            fontFamily: 'var(--font-main)'
        }}>
            {/* Bottom Bar - Made main element */}
            <div style={{
                padding: '20px 0',
                textAlign: 'center',
                background: '#1565C0',
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)' }}>
                    © {new Date().getFullYear()} Zephcore - Workspace Integrado. Todos os direitos reservados.
                </p>
            </div>


        </footer>
    );
};

export default Footer;
