import React, { useState } from 'react';
import { useUser } from '../hooks/useUser';
import ProfileDropdown from '../components/ProfileDropdown';
import AddRepositoryModal from '../components/AddRepositoryModal';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Project {
  id: string;
  name: string;
  path: string;
  lastModified: string;
}

const Dashboard: React.FC = () => {
  const { username, userEmail, userCode } = useUser(); // Direct Redux access
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Start with empty projects array - will be populated from backend
  const [projects, setProjects] = useState<Project[]>([]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProject = () => {
    setIsModalOpen(true);
  };

  const handleAddRepository = async (repositoryData: { name: string; path: string }) => {
    try {
      // Debug: Log complete userRedux data
      console.log('=== USER REDUX DATA ===');
      console.log('Complete userRedux:', { username, userEmail, userCode });
      console.log('userCode value:', userCode);
      console.log('userCode type:', typeof userCode);
      console.log('userCode truthy check:', !!userCode);
      console.log('========================');
      
      // Debug: Log what we're sending
      const requestBody = {
        userCode: userCode || 'default', // From Redux user state
        path: repositoryData.path,
        name: repositoryData.name
      };
      console.log('Sending to backend:', requestBody);
      console.log('userCode from Redux:', userCode);
      
      // Call the backend API to store the directory
      const response = await fetch('http://localhost:3000/api/repos/store-directory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add repository');
      }

      const result = await response.json();
      
      // Add the new repository to the local state
      const newProject: Project = {
        id: result.repo._id || Date.now().toString(),
        name: repositoryData.name,
        path: repositoryData.path,
        lastModified: new Date().toISOString().split('T')[0]
      };
      
      setProjects(prev => [newProject, ...prev]);
      
      // Show success message
      console.log(`Repository "${repositoryData.name}" added successfully!`, result);
    } catch (error) {
      // Show error message
      console.error('Failed to add repository:', error);
      throw error; // Re-throw to show error in modal
    }
  };

  const handleEditProject = (projectId: string) => {
    // TODO: Implement edit project functionality
    console.log('Edit project:', projectId);
  };

  const handleDeleteProject = (projectId: string) => {
    // TODO: Implement delete project functionality
    console.log('Delete project:', projectId);
  };

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center p-6 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white font-satoshi mb-2">Repository Dashboard</h1>
            <p className="text-gray-400 font-satoshi text-sm">
              Welcome back, {username || userEmail}! Ready to manage your repositories?
            </p>
          </div>
          <ProfileDropdown />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="px-4 pb-4 max-w-6xl mx-auto">
        {filteredProjects.length === 0 ? (
          // Empty state - no container, just the message
          <div className="text-center py-16">
            <FolderIcon sx={{ fontSize: 80, color: '#6b7280', marginBottom: 4 }} />
            <h3 className="text-xl font-medium text-gray-300 font-satoshi mb-3">
              {searchQuery ? 'No repositories found' : 'Start Building Your Repository Collection'}
            </h3>
            <p className="text-sm text-gray-500 font-satoshi mb-6 max-w-md mx-auto">
              {searchQuery 
                ? 'Try adjusting your search terms or browse all repositories' 
                : 'Add your first repository to begin organizing and tracking your projects. The backend will automatically scan for dependency manifests and project structure.'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddProject}
                className="px-8 py-3 text-sm font-medium rounded-lg font-satoshi flex items-center gap-2 mx-auto transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: '#47848F',
                  color: 'white'
                }}
              >
                <AddIcon sx={{ fontSize: 18 }} />
                Add Your First Repository
              </button>
            )}
          </div>
        ) : (
          // With repositories - show container with header and list
          <div 
            className="rounded-xl border shadow-xl"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              borderColor: 'var(--border-color)'
            }}
          >
            {/* Container Header */}
            <div 
              className="flex justify-between items-center p-4 border-b"
              style={{ borderColor: 'var(--border-color)' }}
            >
              <h2 className="text-lg font-semibold text-white font-satoshi">My Repositories</h2>
              
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="relative">
                  <SearchIcon 
                    sx={{ 
                      position: 'absolute',
                      left: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: 16,
                      color: '#9ca3af'
                    }} 
                  />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-56 pl-10 pr-4 py-2 text-sm bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 font-satoshi focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Add Project Button */}
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 text-sm font-medium rounded-lg font-satoshi flex items-center gap-2 transition-all duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: '#47848F',
                    color: 'white'
                  }}
                >
                  <AddIcon sx={{ fontSize: 14 }} />
                  Add Repository
                </button>
              </div>
            </div>

            {/* Projects List */}
            <div className="p-4">
              <div className="grid gap-3">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 rounded-lg border transition-all duration-200 group hover:shadow-lg cursor-pointer hover:bg-gray-700/20"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderColor: 'rgba(68, 68, 68, 0.5)'
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Project Icon */}
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: '#47848F' }}
                      >
                        <FolderIcon sx={{ fontSize: 18, color: 'white' }} />
                      </div>
                      
                      {/* Project Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-white font-satoshi group-hover:text-blue-400 transition-colors duration-200 mb-1">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-4 text-xs text-gray-400 font-satoshi">
                          <div className="flex items-center gap-1 min-w-0">
                            <FolderOutlinedIcon sx={{ fontSize: 12, flexShrink: 0 }} />
                            <span className="truncate">{project.path}</span>
                          </div>
                          <div className="flex items-center gap-1 flex-shink-0">
                            <AccessTimeIcon sx={{ fontSize: 12 }} />
                            <span>{new Date(project.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditProject(project.id)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                        title="Edit repository"
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200"
                        title="Delete repository"
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Repository Modal */}
      <AddRepositoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddRepository={handleAddRepository}
      />
    </div>
  );
};

export default Dashboard;