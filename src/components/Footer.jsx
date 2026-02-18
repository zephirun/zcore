import { useData } from '../context/DataContext';

const Footer = ({ transparent = false, textColor }) => {
    const { theme } = useData();

    return (
        <footer className="no-print" style={{
            width: '100%',
            marginTop: 'auto', // Push to bottom if flex container allows
            backgroundColor: transparent ? 'transparent' : 'var(--glass-bg)', // Glass background
            borderTop: transparent ? 'none' : 'var(--glass-border)', // Glass border
            color: textColor || 'var(--text-main)', // Theme-aware text or override
            fontSize: '12px',
            fontFamily: 'var(--font-main)',
            transition: 'all 0.3s ease',
            zIndex: 10,
            backdropFilter: transparent ? 'none' : 'var(--glass-blur)',
            WebkitBackdropFilter: transparent ? 'none' : 'var(--glass-blur)'
        }}>
            {/* Bottom Bar - Made main element */}
            <div style={{
                padding: '8px 0',
                textAlign: 'center',
            }}>
                <p style={{ margin: 0, fontSize: '11px' }}>
                    © {new Date().getFullYear()} ZEPH. Todos os direitos reservados.
                </p>
            </div>


        </footer>
    );
};

export default Footer;
