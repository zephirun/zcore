import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import * as api from '../services/api';

const ActivityTracker = () => {
    const location = useLocation();
    const { username, isAuthenticated } = useData();

    useEffect(() => {
        if (isAuthenticated && username && location.pathname) {
            // Avoid logging technical redirects or the same page multiple times in a row if needed
            // For now, log every significant path change
            api.logActivity(username, 'PAGE_VIEW', location.pathname);
        }
    }, [location.pathname, username, isAuthenticated]);

    return null; // This component doesn't render anything
};

export default ActivityTracker;
