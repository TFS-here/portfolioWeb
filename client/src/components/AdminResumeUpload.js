import { useState } from 'react';

const AdminResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Handle File Selection
  const handleFileChange = (e) => {
    // Grab the first file the user selects
    setFile(e.target.files[0]);
    setMessage(''); // Clear any old messages
  };

  // 2. Handle the Upload Process
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      return setMessage('Please select a PDF file first!');
    }

    setLoading(true);

    // This is the secret sauce for sending files!
    const formData = new FormData();
    // 'file' here MUST match the name in your backend: upload.single('file')
    formData.append('file', file); 

    try {
      // Replace with your actual backend URL if it's hosted elsewhere
      const response = await fetch('https://portfolioweb-37d3.onrender.com/api/resume/upload', {
        method: 'POST',
        body: formData, 
        // Note: Do NOT set 'Content-Type': 'application/json' here. 
        // The browser automatically sets the correct multipart/form-data headers.
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Resume uploaded successfully!');
        setFile(null); // Reset the file input
      } else {
        setMessage(`❌ Error: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Server error during upload.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle the Delete Process
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your resume?");
    if (!confirmDelete) return;

    setLoading(true);

    try {
      const response = await fetch('https://portfolioweb-37d3.onrender.com/api/resume/delete', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('🗑️ Resume deleted successfully!');
      } else {
        setMessage(`❌ Error: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error(error);
      setMessage('❌ Server error during deletion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-900 rounded-lg shadow-lg border border-gray-700 font-mono text-gray-300">
      <h2 className="text-2xl text-neon-green mb-6 border-b border-gray-700 pb-2">Manage Resume</h2>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="mb-8">
        <label className="block mb-2 text-sm text-neon-blue">Select PDF Document</label>
        <input 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-neon-green hover:file:bg-gray-700 mb-4 cursor-pointer"
        />
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-neon-green text-black font-bold py-2 px-4 rounded hover:bg-green-400 transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Upload New Resume'}
        </button>
      </form>

      {/* Delete Section */}
      <div className="border-t border-gray-700 pt-6">
        <h3 className="text-sm text-gray-400 mb-3">Danger Zone</h3>
        <button 
          onClick={handleDelete}
          disabled={loading}
          className="w-full border border-red-500 text-red-500 font-bold py-2 px-4 rounded hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Delete Current Resume'}
        </button>
      </div>

      {/* Status Messages */}
      {message && (
        <div className="mt-6 p-3 bg-gray-800 rounded border border-gray-600 text-center">
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminResumeUpload;
