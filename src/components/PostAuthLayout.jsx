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
            background: 'var(--bg-obsidian, transparent)',
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
                    marginLeft: sidebarCollapsed ? '84px' : '232px', // Adjusted for more compact sidebar (200px width + 20px margin + 12px gap)
                    transition: 'margin-left 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    zIndex: 1
                }}>
                <Header />
                <div style={{
                    flex: 1,
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: '72px', // Header top (12) + Height (48) + Gap (12)
                    paddingRight: '20px',
                    paddingBottom: '20px'
                }}>
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
