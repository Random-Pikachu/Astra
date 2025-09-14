import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import ProfileDropdown from '../components/ProfileDropdown';
import AddRepositoryModal from '../components/AddRepositoryModal';
import { apiService } from '../services/api';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface Project {
  _id: string;
  userCode: string;
  name: string;
  path: string;
  status: string;
  packageManagers: Array<{
    ecosystem: string;
    packageFile: string;
    dependenciesCount: number;
    _id: string;
  }>;
  lastScanned: string;
  repoCode: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { username, userEmail, userCode } = useUser(); // Direct Redux access
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingRepo, setDeletingRepo] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; project: Project | null }>({ show: false, project: null });
  const [scanningRepo, setScanningRepo] = useState<string | null>(null);
  const [addingRepo, setAddingRepo] = useState(false);

  // Start with empty projects array - will be populated from backend
  const [projects, setProjects] = useState<Project[]>([]);

  // Fetch repositories when component mounts or userCode changes
  const fetchRepositories = async () => {
    if (!userCode) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const repos = await apiService.getRepoList(userCode);
      setProjects(repos);
    } catch (error) {
      setError('Failed to fetch repositories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, [userCode]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProject = () => {
    setIsModalOpen(true);
  };

  const handleAddRepository = async (repositoryData: { name: string; path: string }) => {
    try {
      setAddingRepo(true);
      
      
      const requestBody = {
        userCode: userCode || 'default', // From Redux user state
        path: repositoryData.path,
        name: repositoryData.name
      };
      
      // Call the backend API to store the directory
      const response = await fetch('http://https://astra-sfnd.onrender.com//api/repos/store-directory', {
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
      
      // Refresh the repository list to get the latest data from backend
      await fetchRepositories();
      
      // Success - optionally show UI feedback
    } catch (error) {
      // Error - surface to modal via throw
      throw error; // Re-throw to show error in modal
    } finally {
      setAddingRepo(false);
    }
  };

  const handleEditProject = (projectId: string) => {
    // TODO: Implement edit project functionality
  };

  const handleDeleteProject = (projectId: string) => {
    // Find the project to get its repoCode
    const project = projects.find(p => p._id === projectId);
    if (!project) return;

    // Show confirmation modal
    setDeleteConfirmation({ show: true, project });
  };

  const confirmDelete = async () => {
    const { project } = deleteConfirmation;
    if (!project || !userCode) return;

    try {
      setDeletingRepo(project._id);
      
      // Call the backend API to remove the repository
      await apiService.removeRepo(userCode, project.repoCode);
      
      // Remove the project from local state
      setProjects(prev => prev.filter(p => p._id !== project._id));
      
      // Success - optionally show UI feedback
      
      // Close confirmation modal
      setDeleteConfirmation({ show: false, project: null });
    } catch (error) {
      // You might want to show a toast notification here
      alert('Failed to delete repository. Please try again.');
    } finally {
      setDeletingRepo(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, project: null });
  };

  const handleRepoClick = async (project: Project) => {
    // Navigate directly to the Dependencies page for this repository using repoCode
    navigate(`/dependencies/${project.repoCode}`);
  };

  const handleReloadScan = async (project: Project) => {
    try {
      setScanningRepo(project._id);
      
      // Call the API to scan dependencies
      await apiService.scanRepoDependencies(project.repoCode);
      
      // Refresh the repository list to get updated data
      await fetchRepositories();
      
    } catch (error) {
      
      alert('Failed to scan repository. Please try again.');
    } finally {
      setScanningRepo(null);
    }
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
        {isLoading ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-300 font-satoshi mb-3">Loading repositories...</h3>
            <p className="text-sm text-gray-500 font-satoshi mb-6 max-w-md mx-auto">
              Please wait while we fetch your repository list.
            </p>
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
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white font-satoshi">My Repositories</h2>
                {error && (
                  <span className="text-red-400 text-sm bg-red-500/10 px-2 py-1 rounded">
                    {error}
                  </span>
                )}
              </div>
              
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

                {/* Refresh Button */}
                <button
                  onClick={fetchRepositories}
                  disabled={isLoading}
                  className="px-3 py-2 text-sm font-medium rounded-lg font-satoshi flex items-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {isLoading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>

                {/* Add Project Button */}
                <button
                  onClick={handleAddProject}
                  disabled={addingRepo}
                  className="px-4 py-2 text-sm font-medium rounded-lg font-satoshi flex items-center gap-2 transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--accent-color-2)',
                    color: 'white'
                  }}
                >
                  {addingRepo ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <AddIcon sx={{ fontSize: 14 }} />
                      Add Repository
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-4">
              {filteredProjects.length === 0 ? (
                // Empty state inside the table structure
                <div className="text-center py-12">
                  <FolderIcon sx={{ fontSize: 64, color: '#6b7280', marginBottom: 3 }} />
                  <h3 className="text-lg font-medium text-gray-300 font-satoshi mb-2">
                    {searchQuery ? 'No repositories found' : 'Start Building Your Repository Collection'}
                  </h3>
                  <p className="text-sm text-gray-500 font-satoshi mb-4 max-w-md mx-auto">
                    {searchQuery 
                      ? 'Try adjusting your search terms or browse all repositories' 
                      : 'Add your first repository to begin organizing and tracking your projects. The backend will automatically scan for dependency manifests and project structure.'
                    }
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleAddProject}
                      disabled={addingRepo}
                      className="px-6 py-2.5 text-sm font-medium rounded-lg font-satoshi flex items-center gap-2 mx-auto transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: 'var(--accent-color-2)',
                        color: 'white'
                      }}
                    >
                      {addingRepo ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <AddIcon sx={{ fontSize: 16 }} />
                          Add Your First Repository
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                // Projects List
                <div className="grid gap-3">
                  {filteredProjects.map((project) => (
                    <div
                      key={project._id}
                      onClick={() => handleRepoClick(project)}
                      className="flex items-center justify-between p-4 rounded-lg border transition-all duration-200 group hover:shadow-lg cursor-pointer hover:bg-gray-700/20"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        borderColor: 'rgba(68, 68, 68, 0.5)'
                      }}
                      title="Click to scan dependencies"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Project Icon */}
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: 'var(--accent-color-2)' }}
                        >
                          <FolderIcon sx={{ fontSize: 18, color: 'white' }} />
                        </div>
                        
                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-medium text-white font-satoshi transition-colors duration-200"
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--accent-color-2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'white';
                              }}
                          >
                            {project.name}
                          </h3>
                          <div 
                            className={`w-2 h-2 rounded-full ${
                              project.status === 'active' 
                                ? 'bg-emerald-400' 
                                : project.status === 'pending' 
                                ? 'bg-amber-400'
                                : 'bg-slate-400'
                            }`}
                            title={project.status}
                          />
                        </div>
                          <div className="flex items-center gap-4 text-xs text-gray-400 font-satoshi">
                            <div className="flex items-center gap-1 min-w-0">
                              <FolderOutlinedIcon sx={{ fontSize: 12, flexShrink: 0 }} />
                              <span className="truncate">{project.path}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shink-0">
                              <AccessTimeIcon sx={{ fontSize: 12 }} />
                              <span>{new Date(project.lastScanned).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2">
                        {/* Reload/Scan Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReloadScan(project);
                          }}
                          disabled={scanningRepo === project._id || deletingRepo === project._id}
                          className="p-1 text-gray-400 hover:text-green-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={scanningRepo === project._id ? "Scanning..." : deletingRepo === project._id ? "Cannot scan while deleting" : "Rescan dependencies for vulnerabilities"}
                        >
                          {scanningRepo === project._id ? (
                            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                          ) : (
                            <RefreshIcon sx={{ fontSize: 16 }} />
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project._id);
                          }}
                          disabled={deletingRepo === project._id}
                          className="p-1 text-gray-400 hover:text-blue-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={deletingRepo === project._id ? "Cannot edit while deleting" : "Edit repository"}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project._id);
                          }}
                          disabled={deletingRepo === project._id}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={deletingRepo === project._id ? "Deleting..." : "Delete repository"}
                        >
                          {deletingRepo === project._id ? (
                            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          ) : (
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && deleteConfirmation.project && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={cancelDelete}
          />
          
          <div className="relative w-full max-w-sm mx-4 rounded-xl border shadow-xl" 
               style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
            <div className="p-4">
              <h3 className="text-base font-medium text-white font-satoshi mb-3">
                Delete Repository
              </h3>
              
              <p className="text-sm text-gray-300 font-satoshi mb-4">
                Are you sure you want to delete <span className="text-white font-medium">"{deleteConfirmation.project.name}"</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-3 py-1.5 text-sm text-gray-400 border rounded-lg font-medium font-satoshi transition-all duration-200"
                  style={{ borderColor: 'var(--border-color)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deletingRepo === deleteConfirmation.project._id}
                  className="flex-1 px-3 py-1.5 text-sm text-white font-medium rounded-lg font-satoshi flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--accent-color-2)' }}
                >
                  {deletingRepo === deleteConfirmation.project._id ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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