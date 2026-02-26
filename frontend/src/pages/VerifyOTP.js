import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../context/AuthContext';
import { FiShield, FiCheck } from 'react-icons/fi';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const handleChange = (index, value) => {
        if (value.length > 1) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').slice(0, 6);
        const digits = pasted.split('');
        const newOtp = [...otp];
        digits.forEach((d, i) => {
            if (i < 6) newOtp[i] = d;
        });
        setOtp(newOtp);
        const nextEmpty = newOtp.findIndex((d) => !d);
        if (nextEmpty !== -1) inputRefs.current[nextEmpty]?.focus();
        else inputRefs.current[5]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            toast.error('Please enter the complete 6-digit OTP.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/auth/verify-otp', { email, otp: otpString });
            toast.success(res.data.message);
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Verification failed.');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        return (
            <div className="auth-page">
                <div className="auth-container single">
                    <div className="auth-form-container" style={{ textAlign: 'center' }}>
                        <FiShield size={48} color="#1976d2" />
                        <h2>No Email Found</h2>
                        <p>Please register first to receive your OTP.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/register')}>Go to Register</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <div className="auth-container single">
                <div className="auth-form-container otp-container">
                    <div className="auth-header">
                        <div className="otp-shield-icon">
                            <FiShield size={40} />
                        </div>
                        <h2>Verify Your Email</h2>
                        <p>We sent a 6-digit code to <strong>{email}</strong></p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="otp-inputs" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    maxLength="1"
                                    className="otp-input"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ''))}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    autoFocus={index === 0}
                                />
                            ))}
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            <FiCheck /> {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                    <p className="auth-link">
                        Didn't receive the code? <span className="resend-link" onClick={() => navigate('/register')}>Register again</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
