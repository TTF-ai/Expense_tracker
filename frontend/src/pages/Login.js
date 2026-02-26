import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth, api } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/login', form);
            toast.success(res.data.message);
            login(res.data.user, res.data.token);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="auth-illustration">
                        <div className="float-circle circle-1"></div>
                        <div className="float-circle circle-2"></div>
                        <div className="float-circle circle-3"></div>
                        <h1>📊</h1>
                        <h2>Welcome Back</h2>
                        <p>Login to view your expenses and keep your finances on track</p>
                    </div>
                </div>
                <div className="auth-right">
                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h2>Login</h2>
                            <p>Enter your credentials to continue</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label><FiMail className="input-icon" /> Email</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
                            </div>
                            <div className="form-group">
                                <label><FiLock className="input-icon" /> Password</label>
                                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                <FiLogIn /> {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>
                        <p className="auth-link">
                            Don't have an account? <Link to="/register">Register here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
