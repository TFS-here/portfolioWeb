import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaPlus, FaEdit, FaTimes, FaSignOutAlt, FaCode, FaProjectDiagram, FaUserPlus, FaEnvelope, FaClock, FaFilePdf, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

// Configure Axios to automatically attach the JWT token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => Promise.reject(error));

const Admin = () => {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects', 'stats', 'messages', or 'resume'
  const [data, setData] = useState([]);
  
  // Forms State
  const [projectForm, setProjectForm] = useState({ title: '', description: '', techStack: [], liveLink: '', repoLink: '' });
  const [techInput, setTechInput] = useState('');
  const [statForm, setStatForm] = useState({ platform: '', link: '', totalSolved: '', totalContests: '', rating: '', highestRating: '', iconColor: '#00ff9d' });
  
  // Resume State
  const [resumeFile, setResumeFile] = useState(null);
  const [currentResume, setCurrentResume] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');

  // Co-Admin State
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { 
    if (activeTab === 'resume') {
      fetchResume();
    } else {
      fetchData(); 
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    try {
      let endpoint = '';
      if (activeTab === 'projects') endpoint = `${API_BASE}/projects`;
      else if (activeTab === 'stats') endpoint = `${API_BASE}/stats`;
      else if (activeTab === 'messages') endpoint = `${API_BASE}/messages`;
      else return; // Don't run this for resume
      
      const res = await axios.get(endpoint);
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchResume = async () => {
    try {
      const res = await axios.get(`${API_BASE}/resume`);
      if (res.data && res.data.resumeUrl) {
        setCurrentResume(res.data.resumeUrl);
      }
    } catch (err) {
      console.error("Error fetching resume, it might not exist yet.");
      setCurrentResume(null);
    }
  };

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

  // Create Co-Admin
  const createNewAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/auth/register`, newAdmin, { headers: { 'x-auth-token': token } });
      alert("New Co-Admin Added Successfully!");
      setShowAdminForm(false);
      setNewAdmin({ email: '', password: '' });
    } catch (err) { alert(err.response?.data || "Failed to create admin."); }
  };

  // Form Handling
  const handleProjectChange = (e) => setProjectForm({ ...projectForm, [e.target.name]: e.target.value });
  const handleStatChange = (e) => setStatForm({ ...statForm, [e.target.name]: e.target.value });

  const startEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item._id);
    if (activeTab === 'projects') setProjectForm({ ...item, techStack: item.techStack || [] });
    else setStatForm(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setProjectForm({ title: '', description: '', techStack: [], liveLink: '', repoLink: '' });
    setTechInput('');
    setStatForm({ platform: '', link: '', totalSolved: '', totalContests: '', rating: '', highestRating: '', iconColor: '#00ff9d' });
    setResumeMessage('');
    setResumeFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = activeTab === 'projects' ? `${API_BASE}/projects` : `${API_BASE}/stats`;
    
    // Auto-add anything left in the input field
    let finalTechStack = [...projectForm.techStack];
    if (activeTab === 'projects' && techInput.trim()) {
      if (!finalTechStack.includes(techInput.trim())) {
        finalTechStack.push(techInput.trim());
      }
      setTechInput('');
    }
    
    let payload = activeTab === 'projects' ? { ...projectForm, techStack: finalTechStack } : statForm;

    try {
      if (isEditing) await axios.put(`${endpoint}/${currentId}`, payload);
      else await axios.post(endpoint, payload);
      clearForm();
      fetchData();
      alert("Success!");
    } catch (error) { alert("Error processing request"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this item?")) return;
    let endpoint = '';
    if (activeTab === 'projects') endpoint = `${API_BASE}/projects/${id}`;
    else if (activeTab === 'stats') endpoint = `${API_BASE}/stats/${id}`;
    else if (activeTab === 'messages') endpoint = `${API_BASE}/messages/${id}`;
    
    await axios.delete(endpoint);
    fetchData();
  };

  const moveProject = async (index, direction) => {
    if (activeTab !== 'projects') return;
    if (direction === -1 && index === 0) return; // already at top
    if (direction === 1 && index === data.length - 1) return; // already at bottom

    const newData = [...data];
    // Swap items
    const temp = newData[index];
    newData[index] = newData[index + direction];
    newData[index + direction] = temp;

    // Update their order properties based on their new index
    newData.forEach((item, i) => { item.order = i; });
    
    // Optimistic UI update
    setData(newData);

    try {
      const updates = newData.map(item => ({ _id: item._id, order: item.order }));
      await axios.put(`${API_BASE}/projects/reorder/bulk`, { updates });
    } catch (err) {
      console.error("Reorder failed", err);
      fetchData(); // Revert on failure
    }
  };

  const handleTechKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techInput.trim();
      if (val && !projectForm.techStack.includes(val)) {
        setProjectForm({ ...projectForm, techStack: [...projectForm.techStack, val] });
        setTechInput('');
      }
    } else if (e.key === 'Backspace' && !techInput && projectForm.techStack.length > 0) {
      const newStack = [...projectForm.techStack];
      newStack.pop();
      setProjectForm({ ...projectForm, techStack: newStack });
    }
  };

  const handleTechPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    // Split by commas, or if none exist, try splitting by newlines or just leave as is.
    // If they paste a large space-separated string, we can split by spaces if there are no commas.
    let tags = [];
    if (pasteData.includes(',')) {
      tags = pasteData.split(',').map(t => t.trim()).filter(Boolean);
    } else if (pasteData.includes('\n')) {
      tags = pasteData.split('\n').map(t => t.trim()).filter(Boolean);
    } else {
      // Split by spaces as a fallback if they paste a space-separated string without commas
      tags = pasteData.split(' ').map(t => t.trim()).filter(Boolean);
    }
    
    const newStack = [...projectForm.techStack];
    tags.forEach(t => {
      if (!newStack.includes(t)) newStack.push(t);
    });
    setProjectForm({ ...projectForm, techStack: newStack });
  };

  const removeTech = (tech) => {
    setProjectForm({ ...projectForm, techStack: projectForm.techStack.filter(t => t !== tech) });
  };

  const editTech = (tech) => {
    setProjectForm({ ...projectForm, techStack: projectForm.techStack.filter(t => t !== tech) });
    setTechInput(tech);
  };

  // ==========================================
  // RESUME SPECIFIC FUNCTIONS
  // ==========================================
  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return setResumeMessage('Please select a PDF first!');

    setResumeLoading(true);
    setResumeMessage('');

    const formData = new FormData();
    formData.append('file', resumeFile);

    try {
      // Note: We use fetch here because axios sometimes alters FormData boundaries
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/resume/upload`, {
        method: 'POST',
        headers: {
          'x-auth-token': token
        },
        body: formData,
      });
      
      const data = await res.json();

      if (res.ok) {
        setResumeMessage('✅ Resume uploaded successfully!');
        setCurrentResume(data.data.resumeUrl);
        setResumeFile(null);
        document.getElementById('file-upload').value = '';
      } else {
        setResumeMessage(`❌ Error: ${data.error || data.message}`);
      }
    } catch (error) {
      setResumeMessage('❌ Server error during upload.');
    }
    setResumeLoading(false);
  };

  const handleResumeDelete = async () => {
    if (!window.confirm("Are you sure you want to delete the current resume?")) return;
    
    setResumeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/resume/delete`, { 
        method: 'DELETE',
        headers: {
          'x-auth-token': token
        }
      });
      if (res.ok) {
        setResumeMessage('🗑️ Resume deleted successfully!');
        setCurrentResume(null);
      } else {
        setResumeMessage('❌ Failed to delete resume.');
      }
    } catch (error) {
      setResumeMessage('❌ Server error during deletion.');
    }
    setResumeLoading(false);
  };

  // Format Date for Messages
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-cyber-black text-gray-300 p-4 md:p-8 pt-20 md:pt-24 font-mono relative">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-3xl md:text-4xl font-display text-white">ADMIN <span className="text-neon-green">PANEL</span></h1>
        <div className="flex gap-3">
          <button onClick={() => setShowAdminForm(true)} className="flex items-center gap-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/50 px-3 py-2 rounded hover:bg-neon-blue hover:text-black transition-all font-bold text-sm">
            <FaUserPlus /> <span className="hidden sm:inline">ADD ADMIN</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/50 px-3 py-2 rounded hover:bg-red-500 hover:text-white transition-all font-bold text-sm">
            <FaSignOutAlt /> <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-6xl mx-auto flex gap-2 md:gap-4 mb-10 overflow-x-auto pb-2">
        <button onClick={() => { setActiveTab('projects'); clearForm(); }} className={`flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-t-lg font-bold transition-all text-sm whitespace-nowrap ${activeTab === 'projects' ? 'bg-neon-green text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          <FaProjectDiagram /> PROJECTS
        </button>
        <button onClick={() => { setActiveTab('stats'); clearForm(); }} className={`flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-t-lg font-bold transition-all text-sm whitespace-nowrap ${activeTab === 'stats' ? 'bg-neon-blue text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          <FaCode /> CP STATS
        </button>
        <button onClick={() => { setActiveTab('resume'); clearForm(); }} className={`flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-t-lg font-bold transition-all text-sm whitespace-nowrap ${activeTab === 'resume' ? 'bg-purple-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          <FaFilePdf /> RESUME
        </button>
        <button onClick={() => { setActiveTab('messages'); clearForm(); }} className={`flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-t-lg font-bold transition-all text-sm whitespace-nowrap ${activeTab === 'messages' ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
          <FaEnvelope /> MESSAGES
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* DYNAMIC LEFT SECTION */}
        {activeTab === 'messages' ? (
          /* MESSAGE INFO BOX */
          <div className="cyber-card p-8 rounded-2xl h-fit border border-yellow-400/30">
             <h2 className="text-2xl font-display text-yellow-400 mb-4 flex items-center gap-2"><FaEnvelope /> Inbox</h2>
             <p className="text-gray-400">Total Messages: <span className="text-white font-bold">{data.length}</span></p>
             <p className="text-gray-500 text-sm mt-2">Messages are stored securely in your database. Deleting them here removes them permanently.</p>
          </div>

        ) : activeTab === 'resume' ? (
          /* RESUME MANAGER */
          <motion.div layout className="cyber-card p-8 rounded-2xl h-fit border border-purple-500/30">
            <h2 className="text-2xl font-display text-purple-400 mb-6 flex items-center gap-2">
              <FaFilePdf /> Manage Resume
            </h2>
            
            <form onSubmit={handleResumeUpload} className="space-y-4 mb-6">
              <label className="block text-sm text-gray-400">Select PDF Document</label>
              <input 
                id="file-upload"
                type="file" 
                accept=".pdf" 
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="w-full bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-purple-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-bold file:bg-gray-800 file:text-purple-400 hover:file:bg-gray-700 cursor-pointer"
              />
              <button 
                type="submit" 
                disabled={resumeLoading || !resumeFile}
                className="w-full font-bold py-3 rounded bg-purple-500 text-black hover:bg-purple-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resumeLoading ? 'UPLOADING...' : 'UPLOAD NEW RESUME'}
              </button>
            </form>

            {resumeMessage && (
              <div className="mb-4 p-3 bg-gray-900 border border-gray-700 rounded text-center text-sm">
                {resumeMessage}
              </div>
            )}

            {currentResume && (
              <div className="border-t border-gray-800 pt-6 mt-6">
                <button 
                  onClick={handleResumeDelete}
                  disabled={resumeLoading}
                  className="w-full border border-red-500/50 text-red-500 font-bold py-3 rounded hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                >
                  {resumeLoading ? 'PROCESSING...' : 'DELETE CURRENT RESUME'}
                </button>
              </div>
            )}
          </motion.div>

        ) : (
          /* PROJECTS & STATS FORM */
          <motion.div layout className="cyber-card p-8 rounded-2xl h-fit sticky top-24">
            <h2 className="text-2xl font-display text-white mb-6 flex items-center gap-2">
              {isEditing ? <FaEdit /> : <FaPlus />} 
              {isEditing ? 'Edit' : 'Add'} {activeTab === 'projects' ? 'Project' : 'Statistic'}
              {isEditing && <button onClick={clearForm} className="ml-auto text-xs text-red-400"><FaTimes /> Cancel</button>}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'projects' ? (
                <>
                  <input name="title" value={projectForm.title} onChange={handleProjectChange} className="w-full bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-neon-green outline-none" placeholder="Project Title" required />
                  <textarea name="description" rows="3" value={projectForm.description} onChange={handleProjectChange} className="w-full bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-neon-green outline-none" placeholder="Description" required />
                  
                  <div className="w-full bg-cyber-gray border border-gray-700 rounded p-2 focus-within:border-neon-green min-h-[50px] flex flex-wrap gap-2 items-center">
                    {projectForm.techStack.map((tech, idx) => (
                      <span 
                        key={idx} 
                        onClick={() => editTech(tech)}
                        className="flex items-center gap-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 px-3 py-1 rounded-full text-sm font-bold cursor-pointer hover:bg-neon-blue/40 transition-colors"
                        title="Click to edit"
                      >
                        {tech}
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); removeTech(tech); }} 
                          className="text-neon-blue hover:text-white transition-colors"
                        >
                          <FaTimes size={12} />
                        </button>
                      </span>
                    ))}
                    <input 
                      type="text" 
                      value={techInput} 
                      onChange={(e) => setTechInput(e.target.value)}
                      onKeyDown={handleTechKeyDown}
                      onPaste={handleTechPaste}
                      className="flex-grow bg-transparent text-white outline-none min-w-[150px] p-1" 
                      placeholder="Type tool & press Enter/Comma (or Paste)" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input name="liveLink" value={projectForm.liveLink} onChange={handleProjectChange} placeholder="Live URL" className="bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-neon-green outline-none" />
                    <input name="repoLink" value={projectForm.repoLink} onChange={handleProjectChange} placeholder="GitHub URL" className="bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-neon-green outline-none" />
                  </div>
                </>
              ) : (
                <>
                  <input name="platform" value={statForm.platform} onChange={handleStatChange} className="w-full bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-neon-blue outline-none" placeholder="Platform Name" required />
                  <input name="link" value={statForm.link} onChange={handleStatChange} className="w-full bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-neon-blue outline-none" placeholder="Profile URL" />
                  <div className="grid grid-cols-2 gap-4">
                     <input name="totalSolved" value={statForm.totalSolved} onChange={handleStatChange} className="bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-neon-blue outline-none" placeholder="Total Solved" />
                     <input name="totalContests" value={statForm.totalContests} onChange={handleStatChange} className="bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-neon-blue outline-none" placeholder="Total Contests" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <input name="rating" value={statForm.rating} onChange={handleStatChange} className="bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-neon-blue outline-none" placeholder="Current Rating" />
                     <input name="highestRating" value={statForm.highestRating} onChange={handleStatChange} className="bg-cyber-gray border border-gray-700 rounded p-3 text-white focus:border-neon-blue outline-none" placeholder="Highest Rating" />
                  </div>
                  <input type="color" name="iconColor" value={statForm.iconColor} onChange={handleStatChange} className="w-full h-10 bg-transparent cursor-pointer" />
                </>
              )}
              <button type="submit" className={`w-full font-bold py-3 rounded ${activeTab === 'projects' ? 'bg-neon-green text-black' : 'bg-neon-blue text-black'}`}>
                {isEditing ? 'UPDATE' : 'SAVE'}
              </button>
            </form>
          </motion.div>
        )}

        {/* DYNAMIC RIGHT SECTION */}
        <motion.div layout className="space-y-4 h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          
          {activeTab === 'resume' ? (
            /* RESUME DISPLAY STATUS */
            <div className="bg-gray-900/50 border border-gray-700 p-8 rounded-xl flex flex-col items-center justify-center h-64 text-center">
              {currentResume ? (
                <>
                  <FaFilePdf className="text-purple-500 text-6xl mb-4" />
                  <h3 className="text-xl text-white font-bold mb-2">Resume is Active</h3>
                  <a href={currentResume} target="_blank" rel="noreferrer" className="text-purple-400 hover:underline text-sm break-all px-4">
                    {currentResume}
                  </a>
                </>
              ) : (
                <>
                  <FaFilePdf className="text-gray-600 text-6xl mb-4" />
                  <h3 className="text-xl text-gray-500 font-bold mb-2">No Resume Found</h3>
                  <p className="text-gray-600 text-sm">Upload a PDF using the form to make it visible on your site.</p>
                </>
              )}
            </div>
          ) : (
            /* LIST FOR PROJECTS, STATS, & MESSAGES */
            <>
              {data.length === 0 && <p className="text-gray-500 text-center mt-10">No records found.</p>}
              {data.map((item) => (
                <motion.div key={item._id} className="bg-gray-900/50 border border-gray-700 p-5 rounded-xl flex justify-between items-start group hover:border-white/30 transition-all">
                  <div className="flex-1">
                    {activeTab === 'messages' ? (
                      <>
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-lg font-bold text-yellow-400">{item.name}</h3>
                           <span className="text-xs text-gray-500 flex items-center gap-1"><FaClock /> {formatDate(item.date)}</span>
                        </div>
                        <a href={`mailto:${item.email}`} className="text-neon-blue text-sm hover:underline block mb-2">{item.email}</a>
                        <p className="text-gray-300 bg-gray-800/50 p-3 rounded text-sm font-mono whitespace-pre-wrap">{item.message}</p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-bold text-white mb-1">
                          {activeTab === 'projects' ? item.title : item.platform}
                        </h3>
                        <p className="text-gray-400 text-sm">{activeTab === 'projects' ? item.description.substring(0, 50) + '...' : `Max Rating: ${item.highestRating || 'N/A'}`}</p>
                      </>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {activeTab === 'projects' && (
                      <div className="flex flex-col gap-1 mr-2 border-r border-gray-700 pr-4">
                        <button onClick={() => moveProject(data.indexOf(item), -1)} disabled={data.indexOf(item) === 0} className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"><FaArrowUp size={12} /></button>
                        <button onClick={() => moveProject(data.indexOf(item), 1)} disabled={data.indexOf(item) === data.length - 1} className="p-1 text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"><FaArrowDown size={12} /></button>
                      </div>
                    )}
                    {activeTab !== 'messages' && (
                      <button onClick={() => startEdit(item)} className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded"><FaEdit /></button>
                    )}
                    <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded"><FaTrash /></button>
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </motion.div>
      </div>

      {/* CO-ADMIN MODAL */}
      <AnimatePresence>
        {showAdminForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="cyber-card p-8 rounded-xl w-96 border border-neon-blue shadow-[0_0_20px_rgba(0,243,255,0.2)]">
              <h3 className="text-2xl font-display text-white mb-6 flex items-center gap-2"><FaUserPlus className="text-neon-blue" /> New Admin</h3>
              <form onSubmit={createNewAdmin} className="space-y-4">
                <input type="email" required placeholder="Email" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white outline-none" value={newAdmin.email} onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} />
                <input type="password" required placeholder="Password" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white outline-none" value={newAdmin.password} onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} />
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="flex-1 bg-neon-blue text-black font-bold py-2 rounded">CREATE</button>
                  <button type="button" onClick={() => setShowAdminForm(false)} className="flex-1 border border-red-500 text-red-500 py-2 rounded">CANCEL</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;