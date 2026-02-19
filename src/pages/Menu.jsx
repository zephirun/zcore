import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { allModules, categories } from '../config/menuConfig';

const Typewriter = ({ texts, color, onComplete }) => {
    const { theme } = useData();
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
        }, 30);

        return () => clearInterval(typingInterval);
    }, [currentLine, JSON.stringify(texts)]);

    return (
        <div style={{
            marginBottom: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 20px',
            minHeight: '65px'
        }}>
            <h1 style={{
                fontSize: '28px', // Increased from 24px
                fontWeight: '800',
                color: 'var(--text-main)', // Use theme variable
                margin: '0 0 5px 0',
                letterSpacing: '-0.02em',
                fontFamily: 'var(--font-main)',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textShadow: theme === 'dark' ? '0 2px 10px rgba(0,0,0,0.5)' : 'none'
            }}>
                {displayedText[0]}
                {currentLine === 0 && isTyping && <span className="typewriter-cursor">|</span>}
                {!isTyping && displayedText[0] && (
                    <span style={{
                        display: 'inline-block',
                        animation: 'wave 2s infinite',
                        transformOrigin: '70% 70%'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5"></path>
                            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v11"></path>
                            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"></path>
                            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"></path>
                        </svg>
                    </span>
                )}
            </h1>
            <p style={{
                fontSize: '16px',
                color: 'var(--text-muted)',
                margin: 0,
                fontWeight: '500',
                fontFamily: 'var(--font-main)',
                minHeight: '24px'
            }}>
                {displayedText[1]}
                {currentLine === 1 && isTyping && <span className="typewriter-cursor">|</span>}
            </p>
            <style>{`
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
                @keyframes wave {
                    0% { transform: rotate( 0.0deg) }
                    10% { transform: rotate(14.0deg) }
                    20% { transform: rotate(-8.0deg) }
                    30% { transform: rotate(14.0deg) }
                    40% { transform: rotate(-4.0deg) }
                    50% { transform: rotate(10.0deg) }
                    60% { transform: rotate( 0.0deg) }
                    100% { transform: rotate( 0.0deg) }
                }
                .typewriter-cursor { display: inline-block; width: 2px; height: 1em; background: var(--color-primary); animation: blink 0.8s infinite; }
            `}</style>
        </div>
    );
};



const Menu = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userRole, allowedModules, name, theme } = useData();

    // Check if 'category' param exists, otherwise default to first category
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || categories[0].id);

    useEffect(() => {
        setSearchParams({ category: activeCategory });
    }, [activeCategory, setSearchParams]);

    const handleCategoryClick = (id) => {
        setActiveCategory(id);
    };

    // Filter categories based on user access
    const visibleCategories = categories.filter(cat => {
        const categoryModules = allModules.filter(m => m.category === cat.id);
        if (categoryModules.length === 0) return false;

        return categoryModules.some(m =>
            userRole === 'admin' || (allowedModules && allowedModules.includes(m.id)) || m.id === 'sales-simulation'
        ) && !cat.hidden; // Exclude hidden categories
    });

    // Ensure active category is valid
    useEffect(() => {
        if (visibleCategories.length > 0 && !visibleCategories.find(c => c.id === activeCategory)) {
            setActiveCategory(visibleCategories[0].id);
        }
    }, [activeCategory, visibleCategories]);

    const activeCategoryData = categories.find(c => c.id === activeCategory);

    const currentModules = allModules.filter(m =>
        (activeCategory ? m.category === activeCategory : true) &&
        (userRole === 'admin' || (allowedModules && allowedModules.includes(m.id)) || m.id === 'sales-simulation')
    );

    return (
        <div style={{
            minHeight: '100vh',
            fontFamily: 'var(--font-main)',
            background: 'var(--bg-obsidian)',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        }}>
            {/* Background Nebula Effect */}
            <div className="nebula-bg-container" style={{ position: 'fixed', zIndex: 0 }}>
                <div className="nebula-blob blob-1"></div>
                <div className="nebula-blob blob-2"></div>
                <div className="nebula-blob blob-3"></div>
                <div className="nebula-star-layer"></div>
            </div>

            <div style={{
                flex: 1,
                width: '100%',
                maxWidth: '1800px',
                margin: '0 auto',
                padding: '20px 20px',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Welcome - Animated with Stability */}
                <Typewriter
                    texts={[
                        `Olá, ${name ? name.split(' ')[0] : 'Administrador'}!`,
                        "O que você deseja acessar hoje?"
                    ]}
                    color={activeCategoryData?.color}
                />

                {/* CATEGORY GRID - WRAPPED & CENTERED */}
                <div
                    className="category-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', // Increased min-width
                        gap: '12px',
                        padding: '10px 0 30px 0',
                        maxWidth: '1600px', // Wider container
                        margin: '0 auto'
                    }}>
                    {visibleCategories.map(cat => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    background: isActive ? 'var(--color-primary-glow)' : 'var(--bg-hover)',
                                    border: isActive ? `1px solid ${cat.color}` : '1px solid var(--border-color)',
                                    color: isActive ? 'white' : 'var(--text-muted)',
                                    boxShadow: isActive
                                        ? `0 0 20px -5px ${cat.color}66`
                                        : 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                                    backdropFilter: 'blur(10px)',
                                    WebkitBackdropFilter: 'blur(10px)',
                                    minHeight: '48px'
                                }}
                                onMouseEnter={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                        e.currentTarget.style.borderColor = cat.color;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!isActive) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; // Simplified for dynamic
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }
                                }}
                            >
                                {/* Icon (Simplified) */}
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isActive ? 'white' : cat.color,
                                        flexShrink: 0
                                    }}>
                                    {React.cloneElement(cat.icon, { width: 24, height: 24, strokeWidth: 2 })}
                                </div>
                                {/* Label */}
                                <span style={{
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    lineHeight: '1.2',
                                    color: isActive ? 'white' : 'var(--text-main)',
                                    whiteSpace: 'normal',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}>
                                    {cat.name}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* MODULES GRID - RESPONSIVE & ANIMATED */}
                <div
                    className="menu-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', // Wider blocks for Desktop (prevents too many cols)
                        justifyContent: 'center',
                        gap: '24px', // Wider gap for bigger cards
                        padding: '10px 0',
                        animation: 'fadeInUp 0.5s ease-out'
                    }}>
                    {currentModules.map((module, index) => {
                        const iconColor = '#555555';
                        return (
                            <div key={module.id} style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s backwards` }}>
                                <ModuleCard
                                    module={module}
                                    iconColor={iconColor}
                                    buttonColor={activeCategoryData?.color || '#1E88E5'} // Use category color for hover border/icon
                                    isDark={theme === 'dark'}
                                    onClick={(m) => {
                                        if (m.path.startsWith('http')) window.open(m.path, '_blank');
                                        else navigate(m.path);
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>

                {currentModules.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhum módulo encontrado nesta categoria.
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
};

// PROFESSIONAL MODULE CARD (BLOCK STYLE)
// PROFESSIONAL MODULE CARD (BLOCK STYLE)
const ModuleCard = ({ module, iconColor, buttonColor, isDark, onClick }) => {
    const isComingSoon = module.status === 'coming-soon';
    const [isHovered, setIsHovered] = useState(false);

    // Mouse Position State for Spotlight Effect
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const cardRef = useRef(null);

    const handleMouseMove = (e) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    return (
        <div
            ref={cardRef}
            onClick={() => !isComingSoon && onClick(module)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            style={{
                borderRadius: '24px',
                padding: '2px',
                position: 'relative',
                overflow: 'hidden',
                cursor: isComingSoon ? 'not-allowed' : 'pointer',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered && !isComingSoon ? 'translateY(-8px)' : 'translateY(0)',
                background: isHovered && !isComingSoon
                    ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${buttonColor}40, transparent 40%), var(--glass-bg)`
                    : 'var(--glass-bg)',
                boxShadow: isHovered && !isComingSoon
                    ? `0 20px 40px -10px ${buttonColor}30, 0 0 0 1px ${buttonColor}50`
                    : 'var(--shadow-sm)',
                zIndex: isHovered ? 10 : 1,
                minHeight: '180px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: 'var(--glass-border)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
            }}
        >
            {/* INNER CONTENT CONTAINER */}
            <div style={{
                background: 'transparent', // Transparent to show parent glass effect
                borderRadius: '22px',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                position: 'relative',
                zIndex: 2,
                padding: '24px 20px',
                backgroundImage: isHovered && !isComingSoon
                    ? `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, ${buttonColor}20, transparent 40%)`
                    : 'none'
            }}>

                {/* Top Accent Line (Fixed) */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: '20px', right: '20px',
                    height: '4px',
                    background: isComingSoon ? 'var(--border-color)' : (isHovered ? buttonColor : 'transparent'),
                    borderRadius: '0 0 4px 4px',
                    transition: 'background 0.3s ease',
                    boxShadow: isHovered ? `0 2px 8px ${buttonColor}66` : 'none'
                }} />

                {/* Background Watermark Icon (Subtle) */}
                <div style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-30px',
                    opacity: isHovered ? 0.08 : 0.03,
                    transform: isHovered ? 'rotate(-15deg) scale(1.2)' : 'rotate(0deg) scale(1)',
                    transition: 'all 0.5s ease',
                    color: buttonColor,
                    pointerEvents: 'none',
                    zIndex: 0
                }}>
                    {React.cloneElement(module.icon, { width: 120, height: 120, strokeWidth: 1 })}
                </div>

                {/* ICON - Professional container */}
                <div style={{
                    color: isComingSoon ? 'var(--text-muted)' : (isHovered ? buttonColor : 'var(--text-main)'),
                    filter: isComingSoon ? 'grayscale(100%)' : 'none',
                    transition: 'all 0.3s ease',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                    background: isComingSoon ? 'transparent' : `${buttonColor}15`,
                    padding: '12px',
                    borderRadius: '12px'
                }}>
                    {React.cloneElement(module.icon, { width: 32, height: 32, strokeWidth: 1.5 })}
                </div>

                {/* BADGE (Smaller - Minimalist) */}
                {isComingSoon && (
                    <span style={{
                        fontSize: '9px', fontWeight: '700',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        padding: '2px 8px', borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        zIndex: 1,
                        background: 'var(--bg-main)'
                    }}>
                        Em Breve
                    </span>
                )}

                {/* TITLE - Professional Typography */}
                <h3 style={{
                    fontSize: '16px', // Increased from 14px
                    fontWeight: '700', // Bolder
                    color: 'var(--text-main)',
                    textAlign: 'center',
                    margin: 0,
                    lineHeight: '1.4',
                    fontFamily: 'var(--font-main)',
                    zIndex: 1,
                    maxWidth: '100%',
                    letterSpacing: '-0.01em'
                }}>
                    {module.title}
                </h3>
            </div>
        </div>
    );
};

export default Menu;
