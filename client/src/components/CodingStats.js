import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaTrophy, FaChartLine } from 'react-icons/fa';

const CodingStats = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios.get('https://portfolioweb-37d3.onrender.com/api/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <motion.h2 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="text-3xl md:text-4xl font-display text-center mb-12 text-white"
      >
        <span className="border-b-2 border-neon-blue pb-2">COMPETITIVE STATS</span>
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <motion.a 
            key={stat._id}
            href={stat.link}
            target="_blank"
            rel="noreferrer"
            whileHover={{ y: -5 }}
            className="cyber-card p-6 rounded-xl relative overflow-hidden group block border border-gray-800 hover:border-white/20 transition-all"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-display font-bold text-white">{stat.platform}</h3>
              <FaExternalLinkAlt className="text-gray-500 group-hover:text-neon-blue transition-colors" />
            </div>

            {/* Ratings */}
            <div className="flex items-end gap-2 mb-6">
              <span className="text-4xl font-bold drop-shadow-glow" style={{ color: stat.iconColor }}>
                {stat.rating || 'N/A'}
              </span>
              <span className="text-gray-500 text-sm mb-1">
                (Max: {stat.highestRating})
              </span>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <FaChartLine /> Solved
                </p>
                <p className="text-xl text-white font-mono">{stat.totalSolved}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <FaTrophy /> Contests
                </p>
                <p className="text-xl text-white font-mono">{stat.totalContests}</p>
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default CodingStats;
