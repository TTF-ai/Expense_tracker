import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiDollarSign } from 'react-icons/fi';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/dashboard" className="navbar-brand">
                    <FiDollarSign className="brand-icon" />
                    <span>ExpenseTracker</span>
                </Link>
                {isAuthenticated && (
                    <div className="navbar-right">
                        <span className="navbar-user">
                            Hello, <strong>{user?.name || 'User'}</strong>
                        </span>
                        <button className="btn btn-logout" onClick={handleLogout}>
                            <FiLogOut /> Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
