import React, { useState, useRef } from 'react';
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';

// Import CSS directly in component if possible, or ensure it's in global styles
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const MoldableDashboardGrid = ({ children, isEditMode = false }) => {
    const containerRef = useRef(null);
    const width = useContainerWidth(containerRef);

    // Default Layouts
    const defaultLayouts = {
        lg: [
            { i: 'mural', x: 0, y: 0, w: 6, h: 6 },
            { i: 'agenda', x: 6, y: 0, w: 6, h: 6 },
            { i: 'members', x: 0, y: 6, w: 6, h: 6 },
            { i: 'polls', x: 6, y: 6, w: 6, h: 6 }
        ]
    };

    const [layouts, setLayouts] = useState(() => {
        const saved = localStorage.getItem('moldableLayout_v1');
        return saved ? JSON.parse(saved) : defaultLayouts;
    });

    const onLayoutChange = (layout, layouts) => {
        setLayouts(layouts);
        localStorage.setItem('moldableLayout_v1', JSON.stringify(layouts));
    };

    const resetLayout = () => {
        setLayouts(defaultLayouts);
        localStorage.setItem('moldableLayout_v1', JSON.stringify(defaultLayouts));
    };

    return (
        <div ref={containerRef} className="moldable-dashboard" style={{ position: 'relative', minHeight: '800px' }}>
            {isEditMode && (
                <div style={{
                    position: 'absolute', top: -40, right: 0, zIndex: 50,
                    display: 'flex', gap: '10px'
                }}>
                    <button onClick={resetLayout} style={{
                        padding: '6px 12px', background: '#EF4444', color: 'white',
                        border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                    }}>
                        Resetar Layout
                    </button>
                    <div style={{
                        padding: '6px 12px', background: '#3B82F6', color: 'white',
                        borderRadius: '6px', fontSize: '12px'
                    }}>
                        Modo Edição Ativo
                    </div>
                </div>
            )}

            <ResponsiveGridLayout
                className="layout"
                layouts={layouts}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={60}
                width={width}
                isDraggable={isEditMode}
                isResizable={isEditMode}
                onLayoutChange={onLayoutChange}
                margin={[20, 20]}
                draggableHandle=".grid-drag-handle"
            >
                {/* Children must have keys matching the layout 'i' property */}
                {/* Use React.Children to map and clone adding necessary props if needed,
                    but simple wrapping works if children have keys.
                    However, RGL expects direct children to be the grid items.
                */}
                <div key="mural" style={{ background: '#F3F4F6', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                    {isEditMode && <div className="grid-drag-handle" style={{ height: '24px', background: '#DBEAFE', cursor: 'move', display: 'flex', justifyContent: 'center' }}><div style={{ width: '40px', height: '4px', background: '#93C5FD', margin: '10px', borderRadius: '2px' }} /></div>}
                    <div style={{ padding: '20px', height: '100%' }}>
                        <h3>Mural de Comunicados</h3>
                        <p>Conteúdo do Mural...</p>
                    </div>
                </div>

                <div key="agenda" style={{ background: '#F3F4F6', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                    {isEditMode && <div className="grid-drag-handle" style={{ height: '24px', background: '#DBEAFE', cursor: 'move', display: 'flex', justifyContent: 'center' }}><div style={{ width: '40px', height: '4px', background: '#93C5FD', margin: '10px', borderRadius: '2px' }} /></div>}
                    <div style={{ padding: '20px', height: '100%' }}>
                        <h3>Agenda</h3>
                        <p>Conteúdo da Agenda...</p>
                    </div>
                </div>

                <div key="members" style={{ background: '#F3F4F6', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                    {isEditMode && <div className="grid-drag-handle" style={{ height: '24px', background: '#DBEAFE', cursor: 'move', display: 'flex', justifyContent: 'center' }}><div style={{ width: '40px', height: '4px', background: '#93C5FD', margin: '10px', borderRadius: '2px' }} /></div>}
                    <div style={{ padding: '20px', height: '100%' }}>
                        <h3>Membros</h3>
                        <p>Lista de Membros...</p>
                    </div>
                </div>

                <div key="polls" style={{ background: '#F3F4F6', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E7EB' }}>
                    {isEditMode && <div className="grid-drag-handle" style={{ height: '24px', background: '#DBEAFE', cursor: 'move', display: 'flex', justifyContent: 'center' }}><div style={{ width: '40px', height: '4px', background: '#93C5FD', margin: '10px', borderRadius: '2px' }} /></div>}
                    <div style={{ padding: '20px', height: '100%' }}>
                        <h3>Enquetes</h3>
                        <p>Votações ativas...</p>
                    </div>
                </div>

            </ResponsiveGridLayout>
        </div>
    );
};

export default MoldableDashboardGrid;
