import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import './AdminLogin.css';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock Authentication
        if (email === 'admin@e2care.in' && password === 'admin') {
            localStorage.setItem('isAdmin', 'true');
            navigate('/admin/dashboard');
        } else {
            alert('Invalid Credentials! (Use admin@e2care.in / admin)');
        }
    };

    return (
        <div className="admin-login-container">
            <div className="login-card">
                <div className="brand-logo">
                    <h2>E2Care</h2>
                    <span>Admin Portal</span>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email ID</label>
                        <div className="input-wrapper">
                            <User size={18} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@e2care.in"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-login">Login</button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
