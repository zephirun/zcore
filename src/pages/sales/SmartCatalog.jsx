import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useSearchProductsQuery } from '../../hooks/useSalesQueries';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Info, Package, Image as ImageIcon, Video, Globe, FileText, X } from 'lucide-react';

const SmartCatalog = () => {
    const { theme, activeUnit } = useData();
    const [q, setQ] = useState('');
    const [brand, setBrand] = useState('');
    const [id, setId] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Main query now uses all 3 parameters
    const { data: products, isLoading } = useSearchProductsQuery({ q, brand, id });

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    };

    const getStockColor = (val) => {
        if (val > 100) return 'var(--color-success-strong)';
        if (val > 0) return 'var(--color-info-strong)';
        return 'var(--color-error-strong)';
    };

    const handleRowClick = (product) => {
        setSelectedProduct(product);
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', transition: 'all 0.15s' }}>
            <div style={{ padding: '24px 40px' }}>
                {/* Header Section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                    <div>
                        <h1 style={{
                            fontSize: '20px',
                            fontWeight: 'var(--font-bold)',
                            color: 'var(--text-main)',
                            margin: '0 0 4px 0',
                            letterSpacing: '-0.01em'
                        }}>
                            Catálogo Inteligente
                        </h1>
                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            margin: 0
                        }}>
                            Motor de busca em tempo real no Oracle • ERP Viasoft
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-4)',
                            background: 'var(--bg-card)',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            fontSize: '11px',
                            fontWeight: 'var(--font-bold)',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase'
                        }}>
                            <Globe size={14} />
                            {activeUnit === 'madville' ? 'GMAD Madville' : 'GMAD Curitiba'}
                        </div>
                    </div>
                </div>

                {/* Advanced Search Panel (FilterBar) */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    padding: '16px 24px',
                    marginBottom: "var(--space-4)",
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr 1fr',
                        gap: "var(--space-4)"
                    }}>
                        {/* Primary Product Search */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: 'var(--font-bold)',
                                color: 'var(--text-muted)',
                                marginBottom: 'var(--space-4)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em'
                            }}>
                                Produto / Descrição
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Input
                                    placeholder="Ex: MDF Arauco, Puxador Zen, Cola..."
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '0 10px 0 34px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-xs)',
                                        fontSize: '13px',
                                        color: 'var(--text-main)'
                                    }}
                                />
                                <svg
                                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                >
                                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                                </svg>
                            </div>
                        </div>

                        {/* Brand Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: 'var(--font-bold)',
                                color: 'var(--text-muted)',
                                marginBottom: 'var(--space-4)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em'
                            }}>
                                Marca
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Input
                                    placeholder="Ex: Arauco, Duratex..."
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '0 10px 0 34px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-xs)',
                                        fontSize: '13px',
                                        color: 'var(--text-main)'
                                    }}
                                />
                                <svg
                                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                >
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                                    <line x1="7" y1="7" x2="7.01" y2="7" />
                                </svg>
                            </div>
                        </div>

                        {/* ID Filter */}
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '11px',
                                fontWeight: 'var(--font-bold)',
                                color: 'var(--text-muted)',
                                marginBottom: 'var(--space-4)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.02em'
                            }}>
                                ID ou Referência
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Input
                                    placeholder="Ex: 805904..."
                                    value={id}
                                    onChange={(e) => setId(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '32px',
                                        padding: '0 10px 0 34px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-xs)',
                                        fontSize: '13px',
                                        color: 'var(--text-main)'
                                    }}
                                />
                                <svg
                                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                >
                                    <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M7 8h10M7 12h10M7 16h10" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Table Section */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
                            <thead>
                                <tr style={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderBottom: '1px solid var(--border-color)',
                                }}>
                                    <th style={{ ...headerStyleFiori, width: '100px' }}>ID / REF</th>
                                    <th style={headerStyleFiori}>DESCRIÇÃO</th>
                                    <th style={headerStyleFiori}>MARCA</th>
                                    <th style={headerStyleFiori}>SEÇÃO / GRUPO</th>
                                    <th style={{ ...headerStyleFiori, width: '120px' }}>ESTOQUE</th>
                                    <th style={{ ...headerStyleFiori, width: '80px' }}>MARGEM</th>
                                    <th style={{ ...headerStyleFiori, width: '140px' }}>PREÇO</th>
                                    <th style={{ ...headerStyleFiori, width: '100px' }}>STATUS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan="8" style={{ padding: '60px', textAlign: 'center' }}>
                                            <div className="spinner" style={spinnerStyle} />
                                            <p style={{ marginTop: '15px', color: 'var(--text-muted)', fontSize: '13px' }}>Acessando Oracle Database...</p>
                                        </td>
                                    </tr>
                                ) : products?.length > 0 ? (
                                    products.map((prod, idx) => (
                                        <tr
                                            key={prod.iditem}
                                            onClick={() => handleRowClick(prod)}
                                            style={{
                                                borderBottom: '1px solid var(--border-subtle)',
                                                transition: 'background-color 0.1s ease',
                                                backgroundColor: 'transparent',
                                                cursor: 'pointer'
                                            }}
                                            className="table-row-hover"
                                        >
                                            <td style={cellStyleFiori}>
                                                <div style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-info-strong)', fontSize: '13px' }}>{prod.iditem}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{prod.codref}</div>
                                            </td>
                                            <td style={{ ...cellStyleFiori, maxWidth: '300px' }}>
                                                <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '13px', lineHeight: '1.2' }}>{prod.descricao}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>NCM: {prod.ncm} | {prod.unidade}</div>
                                            </td>
                                            <td style={cellStyleFiori}>
                                                <span style={{
                                                    fontSize: '11px',
                                                    fontWeight: 'var(--font-bold)',
                                                    color: 'var(--color-info-strong)',
                                                    backgroundColor: 'var(--color-info-light)',
                                                    padding: '2px 8px',
                                                    borderRadius: '2px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {prod.marca}
                                                </span>
                                            </td>
                                            <td style={cellStyleFiori}>
                                                <div style={{ fontWeight: '500', fontSize: '12px' }}>{prod.secao}</div>
                                                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{prod.grupo}</div>
                                            </td>
                                            <td style={cellStyleFiori}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                                    <div style={{ fontWeight: 'var(--font-bold)', fontSize: '13px', color: getStockColor(prod.saldo_empresa) }}>
                                                        {prod.saldo_empresa} <span style={{ fontSize: '10px', fontWeight: '400', color: 'var(--text-muted)' }}>TOTAL</span>
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}> Disp: {prod.disponivel}</div>
                                                </div>
                                            </td>
                                            <td style={cellStyleFiori}>
                                                <div style={{
                                                    display: 'inline-block',
                                                    padding: '2px 6px',
                                                    borderRadius: '2px',
                                                    backgroundColor: prod.margem > 25 ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                                                    color: prod.margem > 25 ? 'var(--color-success-strong)' : 'var(--color-warning-strong)',
                                                    fontWeight: 'var(--font-bold)',
                                                    fontSize: '11px'
                                                }}>
                                                    {prod.margem}%
                                                </div>
                                            </td>
                                            <td style={cellStyleFiori}>
                                                <div style={{ fontWeight: 'var(--font-bold)', fontSize: '14px', color: 'var(--color-success-strong)' }}>{formatCurrency(prod.preco)}</div>
                                            </td>
                                            <td style={cellStyleFiori}>
                                                <span style={{
                                                    fontSize: '10px',
                                                    fontWeight: 'var(--font-bold)',
                                                    textTransform: 'uppercase',
                                                    color: prod.inativo === 'Ativo' ? 'var(--color-success-strong)' : 'var(--text-light)',
                                                    backgroundColor: prod.inativo === 'Ativo' ? 'var(--color-success-light)' : 'var(--color-error-strong)',
                                                    padding: '3px 6px',
                                                    borderRadius: '2px'
                                                }}>
                                                    {prod.inativo}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (q.length >= 2 || brand.length >= 2 || id.length >= 2) ? (
                                    <tr>
                                        <td colSpan="8" style={{ padding: '80px', textAlign: 'center' }}>
                                            <h3 style={{ color: 'var(--text-main)', fontSize: '16px', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>Nenhum produto encontrado</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Verifique os filtros ou tente termos mais genéricos.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    <tr>
                                        <td colSpan="8" style={{ padding: '100px', textAlign: 'center', opacity: 0.7 }}>
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: "var(--space-4)", color: 'var(--text-muted)' }}>
                                                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <h3 style={{ fontSize: '18px', fontWeight: 'var(--font-bold)', color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>Busca Inteligente Oracle</h3>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Utilize os campos acima para pesquisar por descrição, marca ou ID.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Product Detail Modal */}
            <Modal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                title="Ficha Técnica do Produto"
                width="950px"
            >
                {selectedProduct && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 1.5fr', gap: "var(--space-4)" }}>
                        {/* Media Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: "var(--space-4)" }}>
                            <div style={{
                                backgroundColor: 'var(--bg-input)',
                                borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden',
                                border: '1px solid var(--border-color)',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '320px'
                            }}>
                                <img
                                    src={selectedProduct.idimagem
                                        ? `http://localhost:3000/api/product-image/${selectedProduct.iditem}`
                                        : `https://placehold.co/400x400/1565C0/FFFFFF?text=Sem+Imagem`
                                    }
                                    alt={selectedProduct.descricao}
                                    style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://placehold.co/400x400/3496f8/FFFFFF?text=Sem+Imagem';
                                    }}
                                />
                                <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: 'var(--space-4)' }}>
                                    {selectedProduct.urlvideo && (
                                        <div style={{ backgroundColor: 'var(--color-error)', padding: '6px', borderRadius: '50%', color: 'white', boxShadow: 'var(--shadow-sm)' }}>
                                            <Video size={14} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                <div style={fioriInfoBlock}>
                                    <span style={fioriLabel}>Preço Base</span>
                                    <span style={{ fontSize: '18px', fontWeight: 'var(--font-bold)', color: 'var(--color-success-strong)' }}>{formatCurrency(selectedProduct.preco)}</span>
                                </div>
                                <div style={fioriInfoBlock}>
                                    <span style={fioriLabel}>Margem Atual</span>
                                    <span style={{ fontSize: '18px', fontWeight: 'var(--font-bold)', color: selectedProduct.margem > 20 ? 'var(--color-info-strong)' : 'var(--color-warning-strong)' }}>
                                        {selectedProduct.margem}%
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                padding: '16px',
                                background: 'var(--bg-main)',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)'
                            }}>
                                <h5 style={{ fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', textTransform: 'uppercase' }}>
                                    <Globe size={14} /> POSIÇÃO DE ESTOQUE
                                </h5>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Físico:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedProduct.fisico} {selectedProduct.unidade}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Disponível:</span>
                                        <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-info-strong)' }}>{selectedProduct.disponivel} {selectedProduct.unidade}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Segurança:</span>
                                        <span style={{ fontWeight: '600' }}>{selectedProduct.seguranca}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Specs Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: "var(--space-4)" }}>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 'var(--font-bold)', color: 'var(--text-main)', marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>{selectedProduct.descricao}</h2>
                                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                                    <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--color-info-strong)', textTransform: 'uppercase' }}>{selectedProduct.marca}</span>
                                    <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '50%' }} />
                                    <span>ID: {selectedProduct.iditem}</span>
                                    <span style={{ width: '4px', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '50%' }} />
                                    <span>REF: {selectedProduct.codref}</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
                                <div style={fioriMiniStat} title="Unidade">
                                    <Package size={14} style={{ color: 'var(--color-info-strong)' }} />
                                    <span>{selectedProduct.unidade}</span>
                                </div>
                                <div style={fioriMiniStat} title="NCM">
                                    <FileText size={14} style={{ color: 'var(--color-info-strong)' }} />
                                    <span>{selectedProduct.ncm}</span>
                                </div>
                                <div style={fioriMiniStat} title="Peso Líquido">
                                    <Info size={14} style={{ color: 'var(--color-info-strong)' }} />
                                    <span>{selectedProduct.pesoliquido}kg</span>
                                </div>
                                <div style={fioriMiniStat} title="Peso Bruto">
                                    <Info size={14} style={{ color: 'var(--color-info-strong)' }} />
                                    <span>{selectedProduct.pesobruto}kg</span>
                                </div>
                            </div>

                            <div style={{
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    padding: '8px 16px',
                                    backgroundColor: 'var(--bg-main)',
                                    borderBottom: '1px solid var(--border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-4)'
                                }}>
                                    <FileText size={14} style={{ color: 'var(--color-info-strong)' }} />
                                    <span style={{ fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ESPECIFICAÇÕES TÉCNICAS</span>
                                </div>
                                <div
                                    style={{
                                        padding: '16px',
                                        fontSize: '13px',
                                        color: 'var(--text-main)',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        lineHeight: '1.5',
                                        background: 'var(--bg-card)'
                                    }}
                                    className="product-specs-content"
                                    dangerouslySetInnerHTML={{ __html: selectedProduct.especificacoes || selectedProduct.especificacoes_resumo || '<p style="color: var(--text-muted); font-style: italic;">Nenhuma especificação técnica disponível para este item.</p>' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-4)', marginTop: 'auto' }}>
                                <Button
                                    variant="success"
                                    style={{ height: '44px', fontWeight: 'var(--font-bold)', fontSize: '13px' }}
                                >
                                    Adicionar à Cotação
                                </Button>
                                <Button
                                    variant="ghost"
                                    style={{ height: '44px', fontWeight: '600', fontSize: '13px', border: '1px solid var(--border-color)' }}
                                >
                                    Consultar Filiais
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <style>{`
                .table-row-hover:hover { background-color: var(--bg-hover) !important; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .product-specs-content table { width: 100% !important; border-collapse: collapse; margin: 10px 0; }
                .product-specs-content td, .product-specs-content th { border: 1px solid var(--border-color); padding: 8px; }
                .product-specs-content ul { padding-left: 20px; }
            `}</style>
        </div>
    );
};

const headerStyleFiori = {
    padding: '10px 16px',
    fontSize: '11px',
    fontWeight: 'var(--font-bold)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border-color)'
};

const cellStyleFiori = {
    padding: '8px 16px',
    verticalAlign: 'middle'
};

const fioriInfoBlock = {
    padding: '12px',
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
};

const fioriLabel = {
    fontSize: '11px',
    fontWeight: 'var(--font-bold)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.02em'
};

const fioriMiniStat = {
    padding: '8px',
    backgroundColor: 'var(--bg-input)',
    borderRadius: 'var(--radius-xs)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-main)'
};

const spinnerStyle = {
    width: '32px',
    height: '32px',
    border: '3px solid var(--color-info-light)',
    borderTopColor: 'var(--color-info-strong)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
};

export default SmartCatalog;
