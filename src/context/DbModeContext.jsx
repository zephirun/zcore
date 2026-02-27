import { createContext, useContext, useState, useRef, useCallback } from 'react';

// Managed 100% automatically. Never exposed to the user.
const DbModeContext = createContext(null);

const DB_LIVE = 'live';
const DB_CACHE = 'cache';
const RETRY_INTERVAL_MS = 30000; // retry health check every 30s

export function DbModeProvider({ children }) {
    const [dbMode, setDbMode] = useState(DB_LIVE);
    const retryTimerRef = useRef(null);

    // Called automatically when a request fails
    const handleDbFailure = useCallback((apiBase) => {
        setDbMode(DB_CACHE);

        if (retryTimerRef.current) clearInterval(retryTimerRef.current);

        retryTimerRef.current = setInterval(async () => {
            try {
                const res = await fetch(`${apiBase}/health`, {
                    signal: AbortSignal.timeout(3000),
                });
                if (res.ok) {
                    // DB is back — silently switch to live
                    setDbMode(DB_LIVE);
                    clearInterval(retryTimerRef.current);
                    retryTimerRef.current = null;
                }
            } catch {
                // Still offline — keep retrying silently
            }
        }, RETRY_INTERVAL_MS);
    }, []);

    // Called automatically when a request succeeds
    const handleDbSuccess = useCallback(() => {
        if (retryTimerRef.current) {
            clearInterval(retryTimerRef.current);
            retryTimerRef.current = null;
        }
        setDbMode(DB_LIVE);
    }, []);

    return (
        <DbModeContext.Provider value={{ dbMode, handleDbFailure, handleDbSuccess }}>
            {children}
        </DbModeContext.Provider>
    );
}

export function useDbMode() {
    return useContext(DbModeContext);
}
