import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const maxToasts = 5;

    const addToast = useCallback((type, message, description = '', duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);

        setToasts((prev) => {
            const newToasts = [...prev, { id, type, message, description, duration }].slice(-maxToasts);
            return newToasts;
        });

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (msg, desc, dur) => addToast('success', msg, desc, dur),
        error: (msg, desc, dur) => addToast('error', msg, desc, dur),
        warning: (msg, desc, dur) => addToast('warning', msg, desc, dur),
        info: (msg, desc, dur) => addToast('info', msg, desc, dur),
        loading: (msg, desc, dur) => addToast('loading', msg, desc, dur),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    pointerEvents: 'none', // Allow clicking through the container
                }}
            >
                {toasts.map((t) => (
                    <Toast
                        key={t.id}
                        id={t.id}
                        type={t.type}
                        message={t.message}
                        description={t.description}
                        duration={t.duration}
                        onClose={() => removeToast(t.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
