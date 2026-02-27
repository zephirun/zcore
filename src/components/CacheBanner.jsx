import React from 'react';

/**
 * Drop-in banner to show at the top of any data module.
 * Renders nothing when data is fresh live data (no fromCache, no error).
 *
 * Usage:
 *   <CacheBanner fromCache={fromCache} savedAt={savedAt} error={error} />
 */
export function CacheBanner({ fromCache, savedAt, error }) {
    if (!fromCache && !error) return null;

    const isError = !!(error && !fromCache);

    const dateLabel = savedAt
        ? new Date(savedAt).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : null;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: isError ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
            border: isError ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(245,158,11,0.25)',
            color: isError ? '#DC2626' : '#B45309',
            fontSize: '12px',
            fontWeight: 500,
            fontFamily: 'var(--font-main)',
            lineHeight: '1.4',
        }}>
            <span style={{ flexShrink: 0, fontSize: '14px' }}>
                {isError ? '⚠️' : '🕐'}
            </span>
            <span>
                {isError
                    ? error
                    : `Dados do cache${dateLabel ? ` — salvo em ${dateLabel}` : ''}`
                }
            </span>
        </div>
    );
}
