import React from 'react';
import Skeleton from './Skeleton';

const GlobalSkeleton = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100vh',
            padding: 'var(--space-6)',
            boxSizing: 'border-box',
            background: 'var(--bg-main)',
            gap: 'var(--space-6)'
        }}>
            {/* Header Simulator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', width: '30%' }}>
                    <Skeleton height={28} width="60%" />
                    <Skeleton height={16} width="40%" />
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                    <Skeleton height={36} width={100} />
                    <Skeleton height={36} width={100} />
                </div>
            </div>

            {/* Top Cards Simulator */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                <Skeleton height={120} />
                <Skeleton height={120} />
                <Skeleton height={120} />
                <Skeleton height={120} />
            </div>

            {/* Main Content Area Simulator */}
            <div style={{ flex: 1, display: 'flex', gap: 'var(--space-4)' }}>
                <Skeleton height="100%" width="100%" />
            </div>
        </div>
    );
};

export default GlobalSkeleton;
