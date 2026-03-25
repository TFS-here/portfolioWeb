import { useState } from 'react';
import axios from 'axios'; // Import axios
import { motion } from 'framer-motion';
import { FaPhoneAlt, FaMapMarkerAlt, FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState(''); // '', 'sending', 'success', 'error'

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await axios.post('https://portfolioweb-37d3.onrender.com/api/messages', form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' }); // Clear form
      setTimeout(() => setStatus(''), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <footer className="bg-black pt-20 pb-10 border-t border-gray-900 mt-20">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Contact Info */}
        <div>
          <h3 className="text-3xl font-display text-white mb-8">
            Let's <span className="text-neon-green">Connect</span>
          </h3>
          <p className="text-gray-400 mb-8 font-mono">
            Got a project? Drop me a message here and I'll see it in my admin dashboard.
          </p>
          
          <div className="space-y-4">
            <ContactItem icon={<FaPhoneAlt />} text="+880-1776780054" />
            <ContactItem icon={<FaEnvelope />} text="shifattfs00@gmail.com" />
            <ContactItem icon={<FaMapMarkerAlt />} text="Patuakhali, Bangladesh" />
          </div>

          <div className="flex gap-4 mt-8">
            <a href="https://github.com/shifattfs00" target="_blank" rel="noreferrer" className="p-3 bg-gray-900 rounded-full hover:bg-neon-green hover:text-black transition-all">
              <FaGithub size={20} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-3 bg-gray-900 rounded-full hover:bg-neon-blue hover:text-black transition-all">
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>

        {/* Database Message Form */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="cyber-card p-8 rounded-2xl bg-gray-900/30"
        >
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-neon-blue text-sm mb-2 font-mono">Name</label>
              <input 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-neon-green focus:outline-none" 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-neon-blue text-sm mb-2 font-mono">Email</label>
              <input 
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange} 
                required 
                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-neon-green focus:outline-none" 
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-neon-blue text-sm mb-2 font-mono">Message</label>
              <textarea 
                name="message" 
                value={form.message} 
                onChange={handleChange} 
                rows="4" 
                required 
                className="w-full bg-gray-900 border border-gray-700 rounded p-3 text-white focus:border-neon-green focus:outline-none"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={status === 'sending'}
              className={`w-full font-bold py-3 rounded transition-all font-display tracking-wider ${
                status === 'success' ? 'bg-green-500 text-white' : 
                status === 'error' ? 'bg-red-500 text-white' : 
                'bg-neon-green text-black hover:shadow-neon-green'
              }`}
            >
              {status === 'sending' ? 'TRANSMITTING...' : 
               status === 'success' ? 'MESSAGE SAVED!' : 
               status === 'error' ? 'FAILED. TRY AGAIN.' : 
               'SEND MESSAGE'}
            </button>
          </form>
        </motion.div>
      </div>

      <div className="text-center text-gray-600 text-sm mt-20 font-mono">
        © 2024 Md. Tasnim Ferdous. Built with MERN & Framer Motion.
      </div>
    </footer>
  );
};

const ContactItem = ({ icon, text }) => (
  <div className="flex items-center gap-4 text-gray-300">
    <span className="text-neon-green">{icon}</span>
    <span className="font-mono text-sm">{text}</span>
  </div>
);

export default Footer;
