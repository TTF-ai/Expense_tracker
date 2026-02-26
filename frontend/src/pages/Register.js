import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiUserPlus } from 'react-icons/fi';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', mobile: '' });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/auth/register', form);
            toast.success(res.data.message);
            navigate('/verify', { state: { email: form.email } });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
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
                        <h1>💰</h1>
                        <h2>Start Tracking</h2>
                        <p>Take control of your finances with our beautiful expense tracker</p>
                    </div>
                </div>
                <div className="auth-right">
                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h2>Create Account</h2>
                            <p>Join us and manage your expenses smartly</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label><FiUser className="input-icon" /> Full Name</label>
                                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
                            </div>
                            <div className="form-group">
                                <label><FiMail className="input-icon" /> Email</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
                            </div>
                            <div className="form-group">
                                <label><FiLock className="input-icon" /> Password</label>
                                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" minLength="6" required />
                            </div>
                            <div className="form-group">
                                <label><FiPhone className="input-icon" /> Mobile</label>
                                <input type="tel" name="mobile" value={form.mobile} onChange={handleChange} placeholder="+91 9876543210" required />
                            </div>
                            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                                <FiUserPlus /> {loading ? 'Sending OTP...' : 'Register'}
                            </button>
                        </form>
                        <p className="auth-link">
                            Already have an account? <Link to="/login">Login here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
