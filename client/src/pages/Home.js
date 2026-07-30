import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../components/Hero';
import Skills from '../components/Skills';
import CodingStats from '../components/CodingStats';
import Footer from '../components/Footer';
import { FaTimes } from 'react-icons/fa';

const Home = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    // Make sure your backend server is running on port 5000!
    axios.get('http://localhost:5000/api/projects')
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
                  className="cyber-card p-8 rounded-xl hover:shadow-[0_0_20px_rgba(0,255,157,0.3)] transition-all duration-300 flex flex-col h-full border border-gray-800 hover:border-neon-green/50"
                >
                  <h3 className="text-2xl font-display text-white mb-3">{proj.title}</h3>
                  <p className="text-gray-300 font-sans text-[15px] mb-4 leading-relaxed whitespace-pre-wrap flex-grow line-clamp-4">{proj.description}</p>
                  <button onClick={() => setSelectedProject(proj)} className="text-neon-blue text-sm hover:underline self-start mb-6 font-bold">Read More...</button>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {proj.techStack.map((t, i) => (
                      <span key={i} className="text-xs font-bold text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-3 py-1.5 rounded-full">{t}</span>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 mt-auto pt-4 border-t border-gray-800/50">
                    {proj.liveLink && <a href={proj.liveLink} target="_blank" rel="noreferrer" className="text-neon-green hover:text-white font-bold transition-colors">Live Demo →</a>}
                    {proj.repoLink && <a href={proj.repoLink} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white font-bold transition-colors">GitHub →</a>}
                  </div>
                </motion.div>
             ))
           )}
         </div>
      </section>

      {/* Project Details Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="cyber-card p-8 md:p-10 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-neon-blue/50 shadow-[0_0_30px_rgba(0,243,255,0.15)] relative custom-scrollbar"
            >
              <button onClick={() => setSelectedProject(null)} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
                <FaTimes size={24} />
              </button>
              
              <h2 className="text-3xl font-display text-white mb-6 pr-8">{selectedProject.title}</h2>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {selectedProject.techStack.map((t, i) => (
                  <span key={i} className="text-xs font-bold text-neon-blue bg-neon-blue/10 border border-neon-blue/30 px-3 py-1.5 rounded-full">{t}</span>
                ))}
              </div>
              
              <div className="mb-8 border-l-2 border-neon-green/50 pl-5">
                <p className="text-gray-300 font-sans text-[15px] md:text-base leading-relaxed whitespace-pre-wrap">{selectedProject.description}</p>
              </div>
              
              <div className="flex gap-4 pt-6 border-t border-gray-800/80">
                {selectedProject.liveLink && <a href={selectedProject.liveLink} target="_blank" rel="noreferrer" className="bg-neon-green/10 border border-neon-green/50 text-neon-green hover:bg-neon-green hover:text-black hover:border-neon-green font-bold px-6 py-2.5 rounded transition-all">Live Demo</a>}
                {selectedProject.repoLink && <a href={selectedProject.repoLink} target="_blank" rel="noreferrer" className="bg-gray-800/50 border border-gray-700 text-white hover:bg-gray-700 font-bold px-6 py-2.5 rounded transition-all">GitHub</a>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CodingStats />
      <Footer />
    </div>
  );
};

export default Home;