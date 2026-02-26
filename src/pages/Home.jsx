import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

// Home simply redirects to Login (or to /units if already authenticated)
const Home = () => {
    const { isAuthenticated } = useData();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Z.CORE";
        if (isAuthenticated) {
            navigate('/units');
        } else {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    return null;
};

export default Home;
