import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import * as api from '../../services/api';

const BrandsAndBuyers = () => {
    const { theme, userRole } = useData();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrand, setSelectedBrand] = useState(null); // For detail view/modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Brand Form Data
    const [formData, setFormData] = useState({ name: '', website: '', logoUrl: '' });

    // Buyers Data (Users)
    const [users, setUsers] = useState([]);
    const [brandBuyers, setBrandBuyers] = useState([]); // Buyers linked to selected brand
    const [selectedBuyerId, setSelectedBuyerId] = useState('');

    useEffect(() => {
        loadBrands();
        loadUsers();
    }, []);

    const loadBrands = async () => {
        setLoading(true);
        const data = await api.fetchBrands();
        setBrands(data);
        setLoading(false);
    };

    const loadUsers = async () => {
        const data = await api.fetchUsers();
        setUsers(data);
    };

    const loadBrandBuyers = async (brandId) => {
        const data = await api.fetchBrandBuyers(brandId);
        setBrandBuyers(data);
        loadProducts(brandId);
    };

    const handleSaveBrand = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        // Pass logoFile if it exists
        const result = await api.saveBrand(formData, formData.logoFile);

        if (!result.success) {
            alert('Erro ao salvar marca: ' + result.error);
            return;
        }

        setIsModalOpen(false);
        setFormData({ name: '', website: '', logoUrl: '', logoFile: null });
        loadBrands();
        if (selectedBrand && selectedBrand.id === formData.id) {
            // Refresh selected brand if it was being edited
            // Note: We can't easily guess the new logo URL here without refetching, 
            // but loadBrands will update the list. For the detail view, it might be safer to deselect or fetch detail.
            setSelectedBrand({ ...selectedBrand, ...formData, logoFile: null }); // basic update
        }
    };

    const handleDeleteBrand = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta marca?')) {
            await api.deleteBrand(id);
            loadBrands();
            if (selectedBrand?.id === id) setSelectedBrand(null);
        }
    };

    const handleAddBuyer = async () => {
        if (!selectedBuyerId || !selectedBrand) return;

        const result = await api.saveBrandBuyer(selectedBrand.id, selectedBuyerId);
        if (result.success) {
            loadBrandBuyers(selectedBrand.id);
            setSelectedBuyerId('');
        } else {
            alert(result.error);
        }
    };

    const handleRemoveBuyer = async (connectionId) => {
        if (window.confirm('Remover comprador desta marca?')) {
            await api.removeBrandBuyer(connectionId);
            loadBrandBuyers(selectedBrand.id);
        }
    };

    // --- PRODUCTS LOGIC ---
    const [products, setProducts] = useState([]);
    const [importing, setImporting] = useState(false);

    const loadProducts = async (brandId) => {
        const data = await api.fetchProducts(brandId);
        setProducts(data);
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Excluir este produto?')) {
            await api.deleteProduct(productId);
            loadProducts(selectedBrand.id);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file || !selectedBrand) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const newProducts = [];

            // Expected CSV: Name, SKU, Price, Description, ImageURL
            // Skipping Header (row 0)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // Basic CSV Split (Note: doesn't handle commas inside quotes)
                const parts = line.split(',');

                if (parts[0]) { // Name is required
                    newProducts.push({
                        brand_id: selectedBrand.id,
                        name: parts[0]?.trim(),
                        sku: parts[1]?.trim(),
                        price: parseFloat(parts[2]?.trim()) || 0,
                        description: parts[3]?.trim(),
                        image_url: parts[4]?.trim()
                    });
                }
            }

            if (newProducts.length > 0) {
                setImporting(true);
                const result = await api.importProducts(newProducts);
                setImporting(false);

                if (result.success) {
                    alert(`${newProducts.length} produtos importados com sucesso!`);
                    loadProducts(selectedBrand.id);
                } else {
                    alert('Erro na importação: ' + result.error);
                }
            } else {
                alert('Nenhum produto válido encontrado no CSV.');
            }

            // Reset input
            event.target.value = '';
        };
        reader.readAsText(file);
    };

    const filteredBrands = brands.filter(b => {
        const query = searchQuery.toLowerCase();
        const brandMatch = b.name.toLowerCase().includes(query);
        const buyerMatch = b.brand_buyers?.some(bb =>
            bb.users?.name?.toLowerCase().includes(query) ||
            bb.users?.username?.toLowerCase().includes(query)
        );
        return brandMatch || buyerMatch;
    });

    return (
        <div className="fade-in" style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>
                        Marcas e Compradores
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Gerencie as marcas parceiras e vincule seus respectivos compradores responsáveis.
                    </p>
                </div>
                {userRole === 'admin' && (
                    <button
                        onClick={() => {
                            setFormData({ name: '', website: '', logoUrl: '' });
                            setSelectedBrand(null);
                            setIsModalOpen(true);
                        }}
                        style={{
                            padding: '10px 20px',
                            background: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nova Marca
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 180px)' }}>
                {/* Left: Brands List */}
                <div style={{
                    flex: '1',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-blur)',
                    borderRadius: '16px',
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '16px', borderBottom: 'var(--glass-border)' }}>
                        <div style={{
                            position: 'relative',
                            background: 'var(--bg-input)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-input)',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <svg
                                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                style={{ marginLeft: '12px', color: 'var(--text-secondary)' }}
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar marcas ou compradores..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    fontSize: '14px'
                                }}
                            />
                        </div>
                    </div>

                    <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Carregando...</div>
                        ) : filteredBrands.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>Nenhuma marca encontrada.</div>
                        ) : (
                            filteredBrands.map(brand => (
                                <div
                                    key={brand.id}
                                    onClick={() => {
                                        setSelectedBrand(brand);
                                        loadBrandBuyers(brand.id);
                                    }}
                                    style={{
                                        padding: '16px 20px',
                                        borderBottom: 'var(--glass-border)',
                                        cursor: 'pointer',
                                        background: selectedBrand?.id === brand.id ? 'var(--bg-active)' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px', height: '40px',
                                            borderRadius: '8px',
                                            background: '#f3f4f6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '18px', fontWeight: 'bold', color: '#666',
                                            overflow: 'hidden'
                                        }}>
                                            {brand.logo_url ? (
                                                <img src={brand.logo_url} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : brand.name.substring(0, 1)}
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)' }}>{brand.name}</h3>
                                            {brand.website && (
                                                <a href={brand.website} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', display: 'block', marginBottom: '2px' }} onClick={e => e.stopPropagation()}>
                                                    Visitar site
                                                </a>
                                            )}
                                            {brand.brand_buyers && brand.brand_buyers.length > 0 && (
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                                    {brand.brand_buyers.map(bb => bb.users?.name?.split(' ')[0]).join(', ').substring(0, 30)}{brand.brand_buyers.length > 2 ? '...' : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {userRole === 'admin' && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteBrand(brand.id); }}
                                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}
                                            title="Excluir"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right: Details & Buyers */}
                <div style={{
                    flex: '2',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-blur)',
                    borderRadius: '16px',
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    padding: '24px',
                    overflowY: 'auto',
                    opacity: selectedBrand ? 1 : 0.6,
                    pointerEvents: selectedBrand ? 'auto' : 'none'
                }}>
                    {selectedBrand ? (
                        <>
                            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h2 style={{ fontSize: '22px', marginBottom: '8px', color: 'var(--text-main)' }}>{selectedBrand.name}</h2>
                                    <p style={{ color: 'var(--text-secondary)' }}>Gerenciamento de compradores vinculados</p>
                                </div>
                                {userRole === 'admin' && (
                                    <button
                                        onClick={() => {
                                            setFormData({ ...selectedBrand, logoUrl: selectedBrand.logo_url || '' });
                                            setIsModalOpen(true);
                                        }}
                                        style={{
                                            background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px',
                                            padding: '6px 12px', color: 'var(--text-main)', cursor: 'pointer'
                                        }}
                                    >
                                        Editar Info
                                    </button>
                                )}
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                    Compradores Vinculados
                                </h3>

                                {/* List Buyers */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                                    {brandBuyers.length > 0 ? (
                                        brandBuyers.map(buyer => (
                                            <div key={buyer.id} style={{
                                                background: 'var(--bg-card)',
                                                padding: '16px',
                                                borderRadius: '12px',
                                                border: '1px solid var(--border-color)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ff9800', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                        {buyer.name?.substring(0, 1) || '?'}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '14px' }}>{buyer.name}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{buyer.username}</div>
                                                    </div>
                                                </div>
                                                {userRole === 'admin' && (
                                                    <button
                                                        onClick={() => handleRemoveBuyer(buyer.id)}
                                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                                        title="Desvincular"
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                    </button>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ gridColumn: '1/-1', padding: '24px', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                                            Nenhum comprador vinculado a esta marca ainda.
                                        </div>
                                    )}
                                </div>

                                {/* Add Buyer Form */}
                                {userRole === 'admin' && (
                                    <div style={{
                                        background: 'var(--bg-input)',
                                        padding: '20px',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-input)'
                                    }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>Vincular Novo Comprador</label>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <select
                                                value={selectedBuyerId}
                                                onChange={(e) => setSelectedBuyerId(e.target.value)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border-color)',
                                                    background: 'var(--bg-card)',
                                                    color: 'var(--text-main)',
                                                    outline: 'none'
                                                }}
                                            >
                                                <option value="">Selecione um usuário...</option>
                                                {users.map(u => (
                                                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={handleAddBuyer}
                                                disabled={!selectedBuyerId}
                                                style={{
                                                    padding: '10px 20px',
                                                    background: selectedBuyerId ? 'var(--color-primary)' : 'var(--border-color)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    cursor: selectedBuyerId ? 'pointer' : 'not-allowed'
                                                }}
                                            >
                                                Vincular
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* --- PRODUCTS SECTION --- */}
                            <div style={{ marginTop: '32px', borderTop: '1px solid var(--border-color)', paddingTop: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '16px', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                        Produtos ({products.length})
                                    </h3>
                                    {userRole === 'admin' && (
                                        <div>
                                            <input
                                                type="file"
                                                accept=".csv"
                                                id="csvUpload"
                                                style={{ display: 'none' }}
                                                onChange={handleFileUpload}
                                                disabled={importing}
                                            />
                                            <label
                                                htmlFor="csvUpload"
                                                style={{
                                                    padding: '8px 16px',
                                                    background: importing ? 'var(--text-muted)' : 'var(--color-primary)',
                                                    color: 'white',
                                                    borderRadius: '8px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    cursor: importing ? 'wait' : 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: '6px',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {importing ? (
                                                    <>
                                                        <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                                                        Importando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                                                        Importar CSV
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Products Grid/List */}
                                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }} className="hide-scrollbar">
                                    {products.length > 0 ? (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                            <thead>
                                                <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                                                    <th style={{ padding: '8px', fontWeight: '600' }}>Nome</th>
                                                    <th style={{ padding: '8px', fontWeight: '600' }}>SKU</th>
                                                    <th style={{ padding: '8px', fontWeight: '600' }}>Preço</th>
                                                    <th style={{ padding: '8px', width: '40px' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map(p => (
                                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color-subtle)' }}>
                                                        <td style={{ padding: '8px', color: 'var(--text-main)' }}>{p.name}</td>
                                                        <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{p.sku || '-'}</td>
                                                        <td style={{ padding: '8px', color: 'var(--text-main)' }}>
                                                            {p.price ? `R$ ${p.price.toFixed(2)}` : '-'}
                                                        </td>
                                                        <td style={{ padding: '8px', textAlign: 'right' }}>
                                                            {userRole === 'admin' && (
                                                                <button
                                                                    onClick={() => handleDeleteProduct(p.id)}
                                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}
                                                                    title="Excluir Produto"
                                                                >
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ padding: '32px', textAlign: 'center', border: '2px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                                            <p style={{ margin: 0, fontSize: '14px' }}>Nenhum produto cadastrado.</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.7 }}>Importe um CSV (Nome, SKU, Preço, Descrição)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '16px', opacity: 0.5 }}>
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                            </svg>
                            <p style={{ fontSize: '18px' }}>Selecione uma marca para ver os detalhes</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setIsModalOpen(false)}>
                    <div
                        style={{ width: '400px', background: 'var(--bg-card)', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', border: '1px solid var(--border-color)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 style={{ marginBottom: '24px', color: 'var(--text-main)' }}>{formData.id ? 'Editar Marca' : 'Nova Marca'}</h2>
                        <form onSubmit={handleSaveBrand}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Nome da Marca</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-input)', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none' }}
                                    placeholder="Ex: Nike, Adidas..."
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Website (Opcional)</label>
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-input)', background: 'var(--bg-input)', color: 'var(--text-main)', outline: 'none' }}
                                    placeholder="https://..."
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>Logo da Marca</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '64px', height: '64px', borderRadius: '12px',
                                        background: 'var(--bg-input)', border: '1px dashed var(--border-color)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden'
                                    }}>
                                        {formData.logoFile ? (
                                            <img src={URL.createObjectURL(formData.logoFile)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : formData.logoUrl ? (
                                            <img src={formData.logoUrl} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Sem Logo</span>
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => {
                                                if (e.target.files[0]) {
                                                    setFormData({ ...formData, logoFile: e.target.files[0] });
                                                }
                                            }}
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--border-input)',
                                                background: 'var(--bg-input)',
                                                color: 'var(--text-main)',
                                                fontSize: '13px'
                                            }}
                                        />
                                        <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            PNG, JPG ou WEBP (Max. 2MB)
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandsAndBuyers;
