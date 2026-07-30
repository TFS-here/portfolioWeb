import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-cyber-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-display font-bold text-neon-green tracking-widest">
          TAS<span className="text-white">NIM</span>
        </Link>

        {/* Desktop Nav */}
        <div className="space-x-8 font-mono hidden md:block">
          <Link to="/" className="text-gray-300 hover:text-neon-green transition">Home</Link>
          <a href="#projects" className="text-gray-300 hover:text-neon-green transition">Projects</a>
          <Link to="/admin" className="text-gray-300 hover:text-neon-blue transition">Admin</Link>
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-gray-300 hover:text-neon-green transition text-xl">
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-cyber-black/95 border-t border-gray-800 px-6 py-4 flex flex-col gap-4 font-mono">
          <Link to="/" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-neon-green transition py-2 border-b border-gray-800">Home</Link>
          <a href="#projects" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-neon-green transition py-2 border-b border-gray-800">Projects</a>
          <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-gray-300 hover:text-neon-blue transition py-2">Admin</Link>
        </div>
      )}
    </nav>
  );
};
export default Navbar;