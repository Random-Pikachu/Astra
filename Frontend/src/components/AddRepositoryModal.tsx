import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import AddIcon from '@mui/icons-material/Add';

declare global {
  interface Window {
    electronAPI: {
      showOpenDialog: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
    };
  }
}

interface AddRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRepository: (repositoryData: { name: string; path: string }) => void;
}

const AddRepositoryModal: React.FC<AddRepositoryModalProps> = ({
  isOpen,
  onClose,
  onAddRepository,
}) => {
  const [repositoryName, setRepositoryName] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBrowseClick = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.showOpenDialog({
          properties: ['openDirectory'],
          title: 'Select Repository Folder'
        });

        if (!result.canceled && result.filePaths.length > 0) {
          const fullPath = result.filePaths[0];
          const directoryName = fullPath.split(/[\\/]/).pop() || 'Unknown';
          
          const normalizedPath = fullPath.replace(/\\/g, '/');
          
          setRepositoryName(directoryName);
          setSelectedPath(normalizedPath);
          
          console.log('✅ Electron folder selection:');
          console.log('Directory name:', directoryName);
          console.log('Full absolute path:', fullPath);
          console.log('Normalized path:', normalizedPath);
        }
      } else {
        console.log('⚠️ Electron API not available, using fallback');
        setError('Electron API not available. Please run in desktop app.');
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
      setError('Failed to select folder. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repositoryName.trim() || !selectedPath) return;

    setIsLoading(true);
    setError(null);

    try {
      let normalizedPath = selectedPath;
      
      if (normalizedPath.includes('\\')) {
        normalizedPath = normalizedPath.replace(/\\/g, '/');
        console.log('Normalized path (converted backslashes):', normalizedPath);
      }
      
      normalizedPath = normalizedPath.replace(/\/+$/, '');
      
      console.log('Submitting repository:', {
        name: repositoryName.trim(),
        originalPath: selectedPath,
        normalizedPath: normalizedPath
      });
      
      await onAddRepository({
        name: repositoryName.trim(),
        path: normalizedPath,
      });
      onClose();
      setRepositoryName('');
      setSelectedPath('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add repository';
      setError(errorMessage);
      console.error('Error adding repository:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRepositoryName('');
    setSelectedPath('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm backdrop-enter"
        onClick={handleClose}
      />
      
             <div className="relative w-full max-w-lg mx-4 rounded-2xl border shadow-2xl modal-enter" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-medium text-white font-satoshi">
            Add Repository
          </h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700/50"
          >
            <CloseIcon sx={{ fontSize: 18 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 font-satoshi">
              Repository Name
            </label>
            <input
              type="text"
              value={repositoryName}
              onChange={(e) => setRepositoryName(e.target.value)}
              placeholder="Enter repository name"
              className="w-full px-3 py-2.5 rounded-lg text-white placeholder-gray-400 font-satoshi focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200 text-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border-color)' }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 font-satoshi">
              Select Folder
            </label>
            <p className="text-xs text-gray-500 mb-2 font-satoshi">
              The backend will scan for dependency manifests (package.json, requirements.txt, etc.)
            </p>

                         <div className="relative border border-dashed rounded-xl p-6 text-center transition-all duration-200" style={{ borderColor: 'var(--border-color)' }}>
              <FolderIcon 
                sx={{ 
                  fontSize: 48, 
                  color: '#6b7280',
                  marginBottom: 1.5 
                }} 
              />
              
              <p className="text-gray-300 font-satoshi mb-3 text-sm">
                Select a folder to add as repository
              </p>
              
              <button
                type="button"
                onClick={handleBrowseClick}
                className="px-4 py-2 text-white rounded-lg font-medium font-satoshi transition-all duration-200 flex items-center gap-2 mx-auto text-sm bg-gray-600 hover:bg-gray-500"
              >
                <FolderIcon sx={{ fontSize: 16 }} />
                Browse Folder
              </button>
            </div>

            {selectedPath && (
                             <div className="mt-3 p-2.5 rounded-lg border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2 text-xs text-gray-300">
                  <FolderIcon sx={{ fontSize: 14, color: '#6b7280' }} />
                  <span className="font-satoshi truncate"> {selectedPath}</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400 font-satoshi">
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
                             className="flex-1 px-3 py-2 text-gray-400 border rounded-lg font-medium font-satoshi transition-all duration-200 text-sm"
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
              type="submit"
              disabled={!repositoryName.trim() || !selectedPath || isLoading}
              className="flex-1 px-3 py-2 text-white font-medium rounded-lg font-satoshi flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm bg-gray-600 hover:bg-gray-500"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning Repository...
                </>
              ) : (
                <>
                  <AddIcon sx={{ fontSize: 16 }} />
                  Add Repository
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRepositoryModal; 