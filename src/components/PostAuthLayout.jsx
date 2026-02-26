import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useData } from '../context/DataContext';

const PostAuthLayout = ({ children }) => {
    const { sidebarCollapsed } = useData();

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
            transition: 'color 0.2s ease',
            fontFamily: 'var(--font-main)'
        }}>
            <Sidebar />
            <div
                className="post-auth-layout"
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    marginLeft: sidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
                    transition: 'margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    zIndex: 1
                }}>
                <Header />
                <div style={{
                    flex: 1,
                    overflowX: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: 'var(--header-height)',
                    paddingRight: '0px',
                    paddingBottom: '0px'
                }}>
                    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default PostAuthLayout;
