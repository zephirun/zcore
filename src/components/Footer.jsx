import { useData } from '../context/DataContext';

const Footer = () => {
    const { theme } = useData();

    return (
        <footer className="no-print" style={{
            width: '100%',
            marginTop: 'auto', // Push to bottom if flex container allows
            backgroundColor: 'var(--glass-bg)', // Glass background
            borderTop: 'var(--glass-border)', // Glass border
            color: 'var(--text-main)', // Theme-aware text
            fontSize: '12px',
            fontFamily: 'var(--font-main)',
            transition: 'all 0.3s ease',
            zIndex: 10,
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)'
        }}>
            {/* Bottom Bar - Made main element */}
            <div style={{
                padding: '8px 0',
                textAlign: 'center',
            }}>
                <p style={{ margin: 0, fontSize: '11px' }}>
                    © {new Date().getFullYear()} ZORX. Todos os direitos reservados.
                </p>
            </div>


        </footer>
    );
};

export default Footer;
