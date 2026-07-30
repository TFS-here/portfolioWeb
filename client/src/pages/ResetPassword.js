import { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/auth/reset-password/${token}`, { password });
      alert(res.data);
      navigate('/login');
    } catch (err) {
      alert(err.response?.data || "Error resetting password");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-cyber-black font-mono">
      <div className="cyber-card p-10 rounded-xl w-96">
        <h2 className="text-3xl text-neon-blue mb-6 text-center font-display">RESET PASSWORD</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <input 
            type="password" 
            placeholder="New Passcode" 
            required
            className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-neon-blue outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <input 
            type="password" 
            placeholder="Confirm Passcode" 
            required
            className="w-full bg-gray-900 border border-gray-700 p-3 text-white focus:border-neon-blue outline-none"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-neon-blue text-black font-bold py-3 hover:shadow-neon-blue transition-all">
            UPDATE PASSWORD
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
