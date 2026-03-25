import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import Skills from '../components/Skills';
import CodingStats from '../components/CodingStats';
import Footer from '../components/Footer';

const Home = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    // Make sure your backend server is running on port 5000!
    axios.get('https://portfolioweb-37d3.onrender.com/api/projects')
      .then(res => setProjects(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="pt-16">
      <Hero />
      <Skills />
      
      {/* Projects Section */}
      <section id="projects" className="py-20 px-6 max-w-6xl mx-auto">
         <h2 className="text-4xl font-display text-center mb-12 text-neon-green">PROJECTS</h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {projects.length === 0 ? (
             <p className="text-gray-500 text-center col-span-2">Loading projects from backend...</p>
           ) : (
             projects.map(proj => (
               <motion.div 
                 whileHover={{ y: -10 }}
                 key={proj._id} 
                 className="cyber-card p-6 rounded-xl hover:shadow-neon-green transition-all duration-300"
               >
                 <h3 className="text-2xl font-display text-white mb-2">{proj.title}</h3>
                 <p className="text-gray-400 font-mono text-sm mb-4">{proj.description}</p>
                 <div className="flex flex-wrap gap-2 mb-4">
                   {proj.techStack.map((t, i) => (
                     <span key={i} className="text-xs text-neon-blue border border-neon-blue px-2 py-1 rounded">{t}</span>
                   ))}
                 </div>
                 <div className="flex gap-4 mt-auto">
                   {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noreferrer" className="text-neon-green hover:underline">Live Demo</a>}
                   {proj.repoLink && <a href={proj.repoLink} target="_blank" rel="noreferrer" className="text-white hover:underline">GitHub</a>}
                 </div>
               </motion.div>
             ))
           )}
         </div>
      </section>

      <CodingStats />
      <Footer />
    </div>
  );
};

export default Home;
