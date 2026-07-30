import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminExists, setAdminExists] = useState(true); // Default true to prevent flash
  const navigate = useNavigate();

  useEffect(() => {
    // Check if an admin already exists on the backend
    axios.get(`${API_BASE}/auth/admin-exists`)
      .then(res => setAdminExists(res.data.exists))
      .catch(err => console.error("Error checking admin status", err));
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/admin');
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  const handleRegister = async () => {
    try {
        // We do NOT send a token here. 
        // The server will only accept this if 0 users exist in DB.
        await axios.post(`${API_BASE}/auth/register`, { email, password });
        alert("First Admin Created Successfully! Please Login.");
    } catch (err) {
        // If server returns 403, it means an admin already exists
        alert(err.response?.data || "Error: Admin likely already exists.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your admin email above first.");
      return;
    }
    try {
      await axios.post(`${API_BASE}/auth/forgot-password`, { email });
      alert("Password reset link sent to your email!");
    } catch (err) {
      alert(err.response?.data || "Error sending reset email.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-cyber-black font-mono">
      <div className="cyber-card p-10 rounded-xl w-96">
        <h2 className="text-3xl text-neon-green mb-6 text-center font-display">SYSTEM ACCESS</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Admin Email" 
            className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-neon-green outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Passcode" 
            className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-neon-green outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-neon-green text-black font-bold py-3 hover:shadow-neon-green transition-all">
            LOGIN
          </button>
        </form>

        <div className="mt-4 text-center">
            <button onClick={handleForgotPassword} className="text-xs text-gray-500 hover:text-neon-green transition-colors">
                Forgot Password?
            </button>
        </div>

        {!adminExists && (
          <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs mb-2">First time setup?</p>
              <button onClick={handleRegister} className="text-xs text-neon-blue border border-neon-blue px-3 py-1 rounded hover:bg-neon-blue hover:text-black transition-all">
                  Initialize Master Admin
              </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;