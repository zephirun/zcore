import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useData } from '../context/DataContext';

const PostAuthLayout = ({ children }) => {
    const { sidebarCollapsed } = useData(); // Get global state for layout spacing

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'transparent', // Let body gradient show through
            color: 'var(--text-main)',
            transition: 'color 0.3s ease'
        }}>
            <Sidebar />
            <div
                className="post-auth-layout"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    marginLeft: sidebarCollapsed ? '50px' : '260px', // Spacing for fixed sidebar
                    transition: 'margin-left 0.8s cubic-bezier(0.4, 0, 0.2, 1)' // smooth transition matching sidebar
                }}>
                <Header />
                <div style={{ flex: 1, overflowX: 'hidden', display: 'flex', flexDirection: 'column', paddingTop: '50px' }}>
                    <div style={{ flex: 1 }}>
                        {children}
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default PostAuthLayout;
