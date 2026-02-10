import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { allModules, categories } from '../config/menuConfig';

const Typewriter = ({ texts, color, onComplete }) => {
    const [currentLine, setCurrentLine] = useState(0);
    const [displayedText, setDisplayedText] = useState(['', '']);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (currentLine >= texts.length) {
            setIsTyping(false);
            if (onComplete) onComplete();
            return;
        }

        let charIndex = 0;
        const typingInterval = setInterval(() => {
            if (charIndex < texts[currentLine].length) {
                setDisplayedText(prev => {
                    const newArr = [...prev];
                    newArr[currentLine] = texts[currentLine].slice(0, charIndex + 1);
                    return newArr;
                });
                charIndex++;
            } else {
                clearInterval(typingInterval);
                setTimeout(() => {
                    setCurrentLine(prev => prev + 1);
                }, 400);
            }
        }, 40);

        return () => clearInterval(typingInterval);
    }, [currentLine, texts]);

    return (
        <div style={{
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Centered for compact view
            textAlign: 'center',
            padding: '0 20px',
        }}>
            <h1 style={{
                fontSize: '22px',
                fontWeight: '800',
                color: '#1A1A1A',
                margin: '0 0 5px 0',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-main)'
            }}>
                {displayedText[0]}
                {currentLine === 0 && isTyping && <span className="typewriter-cursor">|</span>}
            </h1>
            <p style={{
                fontSize: '15px',
                color: '#666',
                margin: 0,
                fontWeight: '500',
                fontFamily: 'var(--font-main)'
            }}>
                {displayedText[1]}
                {currentLine === 1 && isTyping && <span className="typewriter-cursor">|</span>}
            </p>
            <style>{`
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                .typewriter-cursor { display: inline-block; width: 2px; height: 1em; background: ${color || '#1E88E5'}; animation: blink 0.8s infinite; }
            `}</style>
        </div>
    );
};

const Menu = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userRole, allowedModules, name } = useData();

    // Check if 'category' param exists, otherwise default to first category
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || categories[0].id);

    useEffect(() => {
        setSearchParams({ category: activeCategory });
    }, [activeCategory, setSearchParams]);

    const handleCategoryClick = (id) => {
        setActiveCategory(id);
    };

    const activeCategoryData = categories.find(c => c.id === activeCategory);

    const currentModules = allModules.filter(m =>
        (activeCategory ? m.category === activeCategory : true) &&
        (userRole === 'admin' || (allowedModules && allowedModules.includes(m.id)))
    );

    return (
        <div style={{
            minHeight: '100vh',
            fontFamily: 'var(--font-main)',
            background: '#FAFAFA',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Header />

            <div style={{
                flex: 1,
                width: '100%',
                maxWidth: '1600px', // Increased width (was 1200px)
                margin: '0 auto',
                padding: '30px 20px'
            }}>

                {/* Welcome */}
                <Typewriter
                    texts={[
                        `Olá, ${name ? name.split(' ')[0] : 'Administrador'}!`,
                        "O que você deseja acessar hoje?"
                    ]}
                    color={activeCategoryData?.color}
                />

                {/* CATEGORY GRID - WRAPPED & CENTERED (No Scrollbar) */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap', // Key change: Wrap items
                    justifyContent: 'center', // Center items
                    gap: '16px', // Consistent gap
                    padding: '20px 0 30px 0',
                    marginBottom: '10px'
                }}>
                    {categories.map(cat => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    width: '100px', // Fixed width for consistent grid alignment
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {/* Circle Icon - Compact */}
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    // Active: Category Color
                                    background: isActive ? cat.color : '#F5F5F5',
                                    // Active: No Border | Inactive: Light Gray Border
                                    border: isActive ? 'none' : '1px solid #E5E5E5',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    // Active: White Icon | Inactive: Dark Gray
                                    color: isActive ? 'white' : '#333333',
                                    // Active: Shadow using category color
                                    boxShadow: isActive ? `0 10px 20px -5px ${cat.color}66` : 'none',
                                    transition: 'all 0.2s ease',
                                    transform: isActive ? 'scale(1.1)' : 'scale(1)'
                                }}>
                                    {React.cloneElement(cat.icon, { width: 34, height: 34, strokeWidth: 1.2 })}
                                </div>
                                {/* Label - Compact */}
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: isActive ? '700' : '500',
                                    color: isActive ? cat.color : '#333',
                                    textAlign: 'center',
                                    lineHeight: '1.2',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    height: '34px' // Increased from 30px
                                }}>
                                    {cat.name}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* MODULES GRID - RESPONSIVE */}
                <div style={{
                    display: 'grid',
                    // Responsive grid: wider cards for better fill
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '24px',
                    padding: '10px 0'
                }}>
                    {currentModules.map((module, index) => {
                        // STATIC GRAY ICON COLOR
                        const iconColor = '#555555';

                        return (
                            <ModuleCard
                                key={module.id}
                                module={module}
                                iconColor={iconColor}
                                buttonColor={activeCategoryData?.color || '#1E88E5'}
                                onClick={(m) => {
                                    if (m.path.startsWith('http')) window.open(m.path, '_blank');
                                    else navigate(m.path);
                                }}
                            />
                        );
                    })}
                </div>

                {currentModules.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                        Nenhum módulo encontrado nesta categoria.
                    </div>
                )}

            </div>
            <Footer />
        </div >
    );
};

// COMPACT E-COMMERCE PRODUCT CARD STYLE
const ModuleCard = ({ module, iconColor, buttonColor, onClick }) => {
    return (
        <div
            onClick={() => module.status !== 'coming-soon' && onClick(module)}
            style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px',
                cursor: module.status === 'coming-soon' ? 'not-allowed' : 'pointer',
                opacity: 1,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                minHeight: '280px',
            }}
            onMouseEnter={e => {
                if (module.status !== 'coming-soon') {
                    e.currentTarget.style.boxShadow = '0 15px 20px -5px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* 1. HERO IMAGE (ICON) - COMPACT */}
            <div style={{
                height: '110px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
            }}>
                {/* Smaller Icon */}
                <div style={{ color: iconColor, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>
                    {React.cloneElement(module.icon, { width: 70, height: 70, strokeWidth: 1 })}
                </div>
            </div>

            {/* 2. BADGE (Cleaned Up) */}
            {module.status === 'coming-soon' ? (
                <span style={{
                    fontSize: '9px', fontWeight: '800',
                    color: 'white', background: '#94a3b8',
                    padding: '3px 10px', borderRadius: '10px',
                    textTransform: 'uppercase', marginBottom: '2px'
                }}>
                    EM BREVE
                </span>
            ) : (
                // Spacer for alignment
                <div style={{ height: '19px', marginBottom: '2px' }}></div>
            )}

            {/* 3. TITLE (Uppercase Product Name) - COMPACT */}
            <h3 style={{
                fontSize: '17px', // Increased from 15px
                fontWeight: '700',
                color: '#1A1A1A',
                textAlign: 'center',
                textTransform: 'uppercase',
                margin: 0,
                maxWidth: '100%',
                lineHeight: '1.3',
                fontFamily: 'var(--font-main)'
            }}>
                {module.title}
            </h3>

            {/* 4. PRICE/SUBTITLE AREA - COMPACT */}
            <p style={{
                fontSize: '12px',
                color: '#64748b',
                textAlign: 'center',
                margin: 0,
                fontFamily: 'var(--font-main)',
                fontWeight: '500',
                minHeight: '36px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
            }}>
                {module.subtitle}
            </p>

            {/* 5. ACTION BUTTON (Bottom, Full Width) - COMPACT */}
            <button style={{
                width: '100%',
                marginTop: 'auto',
                padding: '10px',
                background: buttonColor,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: module.status === 'coming-soon' ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                textTransform: 'none'
            }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
            >
                {module.status === 'coming-soon' ? 'Aguarde' : 'Acessar'}
            </button>

        </div>
    );
};

export default Menu;
