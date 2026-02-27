import React, { useState } from 'react';
import { Key, Copy, Trash2, Plus, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';

const mockKeys = [
    {
        id: 'key_prod_001',
        name: 'Produção Principal',
        prefix: 'zc_prod_',
        masked: 'zc_prod_••••••••••••••••••••••••••••••••Ab7f',
        created: '15 Jan 2026',
        lastUsed: 'Hoje, 21:30',
        status: 'active',
        permissions: ['read', 'write'],
    },
    {
        id: 'key_dev_002',
        name: 'Desenvolvimento',
        prefix: 'zc_dev_',
        masked: 'zc_dev_••••••••••••••••••••••••••••••••Kj9m',
        created: '02 Dez 2025',
        lastUsed: '3 dias atrás',
        status: 'active',
        permissions: ['read'],
    },
    {
        id: 'key_int_003',
        name: 'Integração n8n',
        prefix: 'zc_int_',
        masked: 'zc_int_••••••••••••••••••••••••••••••••Xp2q',
        created: '18 Nov 2025',
        lastUsed: 'Nunca',
        status: 'inactive',
        permissions: ['read', 'write', 'admin'],
    },
];

const PermBadge = ({ perm }) => {
    const colors = {
        read: { bg: 'rgba(59,158,255,0.10)', color: 'var(--color-info)', border: 'rgba(59,158,255,0.2)' },
        write: { bg: 'rgba(108,99,255,0.10)', color: 'var(--color-accent)', border: 'rgba(108,99,255,0.2)' },
        admin: { bg: 'rgba(255,181,71,0.10)', color: 'var(--color-warning)', border: 'rgba(255,181,71,0.2)' },
    };
    const c = colors[perm] || colors.read;
    return (
        <span style={{
            background: c.bg, color: c.color, border: `1px solid ${c.border}`,
            borderRadius: '12px', padding: '1px 8px',
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
        }}>
            {perm.toUpperCase()}
        </span>
    );
};

const SettingsApi = () => {
    const [keys, setKeys] = useState(mockKeys);
    const [copied, setCopied] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [revealedKey, setRevealedKey] = useState(null);
    const [generatedKey, setGeneratedKey] = useState(null);

    const handleCopy = (keyId, text) => {
        navigator.clipboard.writeText(text).catch(() => { });
        setCopied(keyId);
        setTimeout(() => setCopied(null), 2000);
    };

    const handleRevoke = (keyId) => {
        setKeys(k => k.filter(x => x.id !== keyId));
    };

    const handleCreate = () => {
        if (!newKeyName.trim()) return;
        const newId = `key_${Date.now()}`;
        const raw = `zc_live_${'x'.repeat(32)}${Math.random().toString(36).slice(2, 6)}`;
        setGeneratedKey({ id: newId, value: raw });
        setKeys(prev => [{
            id: newId,
            name: newKeyName,
            prefix: 'zc_live_',
            masked: raw.slice(0, 12) + '••••••••••••••••••••••••••••' + raw.slice(-4),
            created: new Date().toLocaleDateString('pt-BR'),
            lastUsed: 'Nunca',
            status: 'active',
            permissions: ['read'],
        }, ...prev]);
        setNewKeyName('');
        setShowCreate(false);
    };

    return (
        <div style={{
            padding: '32px',
            maxWidth: '860px',
            margin: '0 auto',
            animation: 'fadeSlideIn 250ms ease forwards',
        }}>
            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'var(--color-accent-dim, rgba(108,99,255,0.12))',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-accent)',
                    }}>
                        <Key size={16} />
                    </div>
                    <h1 style={{
                        fontSize: '22px', fontWeight: 700, margin: 0,
                        color: 'var(--text-main)', letterSpacing: '-0.03em',
                    }}>
                        API Keys
                    </h1>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                    Gerencie as chaves de acesso programático à API do Z.CORE.
                </p>
            </div>

            {/* Alert for new key */}
            {generatedKey && (
                <div style={{
                    background: 'rgba(0,212,170,0.08)',
                    border: '1px solid rgba(0,212,170,0.2)',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                }}>
                    <CheckCircle size={16} color="var(--color-success)" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 600, color: 'var(--color-success)' }}>
                            Chave criada com sucesso — Copie agora!
                        </p>
                        <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            Esta chave não será exibida novamente após fechar este aviso.
                        </p>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'var(--bg-main)', borderRadius: '6px',
                            padding: '8px 12px',
                            border: '1px solid var(--border-color)',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: 'var(--text-main)',
                        }}>
                            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {generatedKey.value}
                            </span>
                            <button
                                onClick={() => handleCopy('new', generatedKey.value)}
                                style={{
                                    background: 'transparent', border: 'none',
                                    color: copied === 'new' ? 'var(--color-success)' : 'var(--text-muted)',
                                    cursor: 'pointer', display: 'flex', padding: '2px',
                                    transition: 'color 150ms ease',
                                }}
                            >
                                {copied === 'new' ? <CheckCircle size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setGeneratedKey(null)}
                        style={{
                            background: 'transparent', border: 'none',
                            color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', lineHeight: '1',
                        }}
                    >×</button>
                </div>
            )}

            {/* Create Key Panel */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showCreate ? '16px' : 0 }}>
                    <div>
                        <h2 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                            Chaves de API
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
                            {keys.length} chave{keys.length !== 1 ? 's' : ''} configurada{keys.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreate(v => !v)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            background: 'var(--btn-primary-bg, #6C63FF)', color: '#fff',
                            border: 'none', borderRadius: '8px',
                            padding: '7px 14px', cursor: 'pointer',
                            fontSize: '13px', fontWeight: 600,
                            fontFamily: 'var(--font-main)',
                            transition: 'all 150ms ease',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--btn-primary-hover, #8B84FF)';
                            e.currentTarget.style.boxShadow = 'var(--btn-primary-glow, 0 0 20px rgba(108,99,255,0.3))';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'var(--btn-primary-bg, #6C63FF)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Plus size={13} />
                        Nova Chave
                    </button>
                </div>

                {showCreate && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                            value={newKeyName}
                            onChange={e => setNewKeyName(e.target.value)}
                            placeholder="Nome da chave (ex: Produção Principal)"
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            style={{
                                flex: 1, height: '38px',
                                padding: '0 14px',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-input)',
                                borderRadius: '8px',
                                color: 'var(--text-main)',
                                fontSize: '13px',
                                fontFamily: 'var(--font-main)',
                                outline: 'none',
                            }}
                            className="ui-input"
                        />
                        <button
                            onClick={handleCreate}
                            style={{
                                height: '38px', padding: '0 16px',
                                background: 'var(--btn-primary-bg, #6C63FF)', color: '#fff',
                                border: 'none', borderRadius: '8px',
                                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                                fontFamily: 'var(--font-main)',
                            }}
                        >
                            Gerar
                        </button>
                        <button
                            onClick={() => { setShowCreate(false); setNewKeyName(''); }}
                            style={{
                                height: '38px', padding: '0 14px',
                                background: 'transparent', color: 'var(--text-muted)',
                                border: '1px solid var(--border-color)', borderRadius: '8px',
                                cursor: 'pointer', fontSize: '13px',
                                fontFamily: 'var(--font-main)',
                            }}
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>

            {/* Keys List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {keys.map(key => (
                    <div
                        key={key.id}
                        style={{
                            background: 'var(--bg-card)',
                            border: `1px solid ${key.status === 'inactive' ? 'var(--border-subtle)' : 'var(--border-color)'}`,
                            borderRadius: '12px',
                            padding: '18px 20px',
                            opacity: key.status === 'inactive' ? 0.7 : 1,
                            transition: 'all 150ms ease',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                                        {key.name}
                                    </span>
                                    <span style={{
                                        background: key.status === 'active'
                                            ? 'var(--color-success-bg, rgba(0,212,170,0.12))'
                                            : 'var(--bg-elevated)',
                                        color: key.status === 'active' ? 'var(--color-success)' : 'var(--text-muted)',
                                        border: `1px solid ${key.status === 'active' ? 'var(--color-success-border, rgba(0,212,170,0.2))' : 'var(--border-color)'}`,
                                        borderRadius: '12px', padding: '1px 8px',
                                        fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
                                    }}>
                                        {key.status === 'active' ? 'ATIVA' : 'INATIVA'}
                                    </span>
                                    {key.permissions.map(p => <PermBadge key={p} perm={p} />)}
                                </div>

                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    background: 'var(--bg-main)',
                                    borderRadius: '6px', padding: '6px 10px',
                                    border: '1px solid var(--border-subtle)',
                                    marginBottom: '8px',
                                    fontFamily: 'monospace', fontSize: '12px',
                                    color: 'var(--text-muted)',
                                }}>
                                    <Key size={12} style={{ flexShrink: 0 }} />
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {revealedKey === key.id ? key.masked.replace(/•/g, 'x') : key.masked}
                                    </span>
                                    <button
                                        onClick={() => setRevealedKey(r => r === key.id ? null : key.id)}
                                        style={{
                                            background: 'transparent', border: 'none',
                                            color: 'var(--text-muted)', cursor: 'pointer',
                                            display: 'flex', padding: '2px',
                                            transition: 'color 150ms ease',
                                        }}
                                    >
                                        {revealedKey === key.id ? <EyeOff size={12} /> : <Eye size={12} />}
                                    </button>
                                    <button
                                        onClick={() => handleCopy(key.id, key.masked)}
                                        style={{
                                            background: 'transparent', border: 'none',
                                            color: copied === key.id ? 'var(--color-success)' : 'var(--text-muted)',
                                            cursor: 'pointer', display: 'flex', padding: '2px',
                                            transition: 'color 150ms ease',
                                        }}
                                    >
                                        {copied === key.id ? <CheckCircle size={12} /> : <Copy size={12} />}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <strong style={{ color: 'var(--text-disabled)' }}>Criada:</strong> {key.created}
                                    </span>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <strong style={{ color: 'var(--text-disabled)' }}>Último uso:</strong> {key.lastUsed}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => handleRevoke(key.id)}
                                title="Revogar chave"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    background: 'transparent',
                                    border: '1px solid var(--color-error-border, rgba(255,77,106,0.2))',
                                    borderRadius: '7px', padding: '6px 10px',
                                    color: 'var(--color-error)', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: 500,
                                    fontFamily: 'var(--font-main)',
                                    transition: 'all 150ms ease',
                                    flexShrink: 0,
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-error-bg, rgba(255,77,106,0.10))'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <Trash2 size={12} />
                                Revogar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info box */}
            <div style={{
                marginTop: '20px',
                padding: '14px 16px',
                background: 'rgba(255,181,71,0.06)',
                border: '1px solid rgba(255,181,71,0.15)',
                borderRadius: '10px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
            }}>
                <AlertTriangle size={15} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Mantenha suas chaves de API em segredo. Nunca as compartilhe publicamente ou as comite em repositórios.
                    Revogar uma chave é irreversível.
                </p>
            </div>
        </div>
    );
};

export default SettingsApi;
