import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProfileDropdown from '../components/ProfileDropdown';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, Select, MenuItem } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { apiService } from '../services/api';

interface Vulnerability {
  vulnerabilityId: string;
  summary: string;
  details: string;
  severity: string;
  references: Array<{
    type: string;
    url: string;
  }>;
  affected: Array<{
    package: {
      name: string;
      ecosystem: string;
    };
    versions: string[];
    ecosystem_specific: {
      severity: string;
    };
  }>;
  publishedAt: string;
  modifiedAt: string;
  ecosystem: string;
}

interface Dependency {
  _id: string;
  dependencyName: string;
  dependencyVersion: string;
  ecosystem: string;
  vulnerabilities: Vulnerability[];
  scannedAt: string;
}

// Real data will be fetched from API

const Dependencies: React.FC = () => {
  const navigate = useNavigate();
  const { repoId } = useParams<{ repoId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All Severities');
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>('All Ecosystems');

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Real data state
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [error, setError] = useState<string | null>(null);
  // repoId from URL params is now the repoCode
  const repoCode = repoId;

  // Get the highest severity from vulnerabilities
  const getHighestSeverity = (vulnerabilities: Vulnerability[]): string => {
    if (!vulnerabilities || vulnerabilities.length === 0) return 'None';
    
    const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1, 'UNKNOWN': 0 };
    let highestSeverity = 'UNKNOWN';
    let highestScore = 0;
    
    for (const vuln of vulnerabilities) {
      const score = severityOrder[vuln.severity as keyof typeof severityOrder] || 0;
      if (score > highestScore) {
        highestScore = score;
        highestSeverity = vuln.severity;
      }
    }
    
    return highestSeverity;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'UNKNOWN':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'None':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Filter dependencies to only show those with vulnerabilities
  const dependenciesWithVulnerabilities = dependencies.filter(dep => 
    dep.vulnerabilities && dep.vulnerabilities.length > 0
  );

  const filteredDependencies = dependenciesWithVulnerabilities.filter(dep => {
    const highestSeverity = getHighestSeverity(dep.vulnerabilities);
    const matchesSearch = dep.dependencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dep.ecosystem.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = selectedSeverity === 'All Severities' || highestSeverity === selectedSeverity;
    const matchesEcosystem = selectedEcosystem === 'All Ecosystems' || dep.ecosystem === selectedEcosystem;
    return matchesSearch && matchesSeverity && matchesEcosystem;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDependencies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDependencies = filteredDependencies.slice(startIndex, endIndex);

  // Fetch vulnerability overview data when component mounts
  useEffect(() => {
    const fetchVulnerabilityData = async () => {
      if (!repoCode) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching vulnerability overview for repoCode:', repoCode);
        
        const response = await apiService.getVulnerabilityOverview(repoCode);
        console.log('Vulnerability overview response:', response);
        
        if (response.vulnerabilityOverview) {
          setDependencies(response.vulnerabilityOverview);
          console.log('Dependencies set:', response.vulnerabilityOverview);
        } else {
          console.log('No vulnerability overview in response:', response);
          setDependencies([]);
        }
      } catch (error) {
        console.error('Failed to fetch vulnerability overview:', error);
        setError('Failed to fetch vulnerability overview. Please try again.');
        setDependencies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVulnerabilityData();
  }, [repoCode]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSeverity, selectedEcosystem]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };



  return (
    <motion.div 
      className="min-h-screen bg-bg-primary text-text-primary font-satoshi mt-18"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Header */}
      <motion.div 
        className="bg-bg-primary"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05, ease: "easeOut" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 mt-4">
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            >
              <motion.button
                onClick={handleBackToDashboard}
                className="p-2 rounded-lg hover:bg-border-color transition-colors duration-200"
                title="Back to Dashboard"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                                <ChevronLeftIcon className="h-6 w-6 text-text-primary" />
              </motion.button>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: 0.15, ease: "easeOut" }}
              >
                <h1 className="text-2xl font-bold text-text-primary">
                  Dependencies
                </h1>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
            >
              <ProfileDropdown />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
      >
        {/* Side-by-side Layout */}
        <motion.div 
          className="flex gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
        >
          {/* Left Side - Search, Filters, and Table */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25, ease: "easeOut" }}
          >
          

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              {/* Search and Actions */}
              <div className="flex gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
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
                    placeholder="Search dependencies"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 font-satoshi focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                {/* Severity Dropdown */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={selectedSeverity}
                    onChange={(e: SelectChangeEvent) => setSelectedSeverity(e.target.value)}
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#374151',
                          border: '1px solid rgba(75, 85, 99, 0.3)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                          mt: 1,
                          '& .MuiMenuItem-root': {
                            borderRadius: '4px',
                            margin: '2px 6px',
                            minHeight: '32px',
                            fontSize: '14px',
                            fontFamily: 'Satoshi, sans-serif',
                          }
                        }
                      }
                    }}
                    sx={{
                      bgcolor: '#374151',
                      border: '1px solid rgba(75, 85, 99, 0.4)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontFamily: 'Satoshi, sans-serif',
                      transition: 'all 0.2s ease-in-out',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&:hover': {
                        bgcolor: '#4B5563',
                        border: '1px solid rgba(75, 85, 99, 0.6)',
                      },
                      '&.Mui-focused': {
                        bgcolor: '#4B5563',
                        border: '1px solid rgba(75, 85, 99, 0.8)',
                      },
                      '& .MuiSelect-icon': {
                        color: '#9ca3af',
                      },
                      '& .MuiSelect-select': {
                        padding: '8px 12px',
                      },
                    }}
                  >
                    <MenuItem value="All Severities" sx={{
                      color: 'white',
                      bgcolor: selectedSeverity === 'All Severities' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      All Severities
                    </MenuItem>
                    <MenuItem value="Critical" sx={{
                      color: 'white',
                      bgcolor: selectedSeverity === 'Critical' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      Critical
                    </MenuItem>
                    <MenuItem value="High" sx={{
                      color: 'white',
                      bgcolor: selectedSeverity === 'High' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      High
                    </MenuItem>
                    <MenuItem value="Medium" sx={{
                      color: 'white',
                      bgcolor: selectedSeverity === 'Medium' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      Medium
                    </MenuItem>
                    <MenuItem value="Low" sx={{
                      color: 'white',
                      bgcolor: selectedSeverity === 'Low' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      Low
                    </MenuItem>
                    <MenuItem value="None" sx={{
                      color: 'white',
                      bgcolor: selectedSeverity === 'None' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      None
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Ecosystem Dropdown */}
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={selectedEcosystem}
                    onChange={(e: SelectChangeEvent) => setSelectedEcosystem(e.target.value)}
                    displayEmpty
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#374151',
                          border: '1px solid rgba(75, 85, 99, 0.3)',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                          mt: 1,
                          '& .MuiMenuItem-root': {
                            borderRadius: '4px',
                            margin: '2px 6px',
                            minHeight: '32px',
                            fontSize: '14px',
                            fontFamily: 'Satoshi, sans-serif',
                          }
                        }
                      }
                    }}
                    sx={{
                      bgcolor: '#374151',
                      border: '1px solid rgba(75, 85, 99, 0.4)',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '14px',
                      fontFamily: 'Satoshi, sans-serif',
                      transition: 'all 0.2s ease-in-out',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                      '&:hover': {
                        bgcolor: '#4B5563',
                        border: '1px solid rgba(75, 85, 99, 0.6)',
                      },
                      '&.Mui-focused': {
                        bgcolor: '#4B5563',
                        border: '1px solid rgba(75, 85, 99, 0.8)',
                      },
                      '& .MuiSelect-icon': {
                        color: '#9ca3af',
                      },
                      '& .MuiSelect-select': {
                        padding: '8px 12px',
                      },
                    }}
                  >
                    <MenuItem value="All Ecosystems" sx={{
                      color: 'white',
                      bgcolor: selectedEcosystem === 'All Ecosystems' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      All Ecosystems
                    </MenuItem>
                    <MenuItem value="npm" sx={{
                      color: 'white',
                      bgcolor: selectedEcosystem === 'npm' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      npm
                    </MenuItem>
                    <MenuItem value="pip" sx={{
                      color: 'white',
                      bgcolor: selectedEcosystem === 'pip' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      pip
                    </MenuItem>
                    <MenuItem value="composer" sx={{
                      color: 'white',
                      bgcolor: selectedEcosystem === 'composer' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      composer
                    </MenuItem>
                    <MenuItem value="cargo" sx={{
                      color: 'white',
                      bgcolor: selectedEcosystem === 'cargo' ? '#4B5563' : 'transparent',
                      borderRadius: '4px',
                      '&:hover': {
                        bgcolor: '#4B5563',
                      }
                    }}>
                      cargo
                    </MenuItem>
                  </Select>
                </FormControl>
                
                {/* Refresh Button */}
                <button
                  onClick={async () => {
                    if (!repoCode) return;
                    
                    setIsLoading(true);
                    try {
                      const response = await apiService.getVulnerabilityOverview(repoCode);
                      console.log('Refresh response:', response);
                      
                      if (response.vulnerabilityOverview) {
                        setDependencies(response.vulnerabilityOverview);
                        setError(null);
                      }
                    } catch (error) {
                      console.error('Failed to refresh:', error);
                      setError('Failed to refresh data. Please try again.');
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-white/10 border border-white/20 text-white font-satoshi hover:bg-white/20 transition-all duration-200 flex items-center justify-center gap-2"
                  disabled={isLoading || !repoCode}
                >
                  {isLoading ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Refresh'
                  )}
                </button>
              </div>
            </div>

            {/* Dependencies Table */}
            <div 
              className="rounded-xl border shadow-xl overflow-hidden"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                borderColor: 'var(--border-color)'
              }}
            >
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-400 font-satoshi">
                    {dependencies.length === 0 ? 'Loading dependencies...' : 'Refreshing dependencies...'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-bg-primary">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-b"
                          style={{ borderColor: 'rgba(75, 85, 99, 0.3)' }}>
                          Package Name
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-b"
                          style={{ borderColor: 'rgba(75, 85, 99, 0.3)' }}>
                          Version
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-b"
                          style={{ borderColor: 'rgba(75, 85, 99, 0.3)' }}>
                          Severity
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider border-b"
                          style={{ borderColor: 'rgba(75, 85, 99, 0.3)' }}>
                          Ecosystem
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentDependencies.map((dependency, index) => {
                        const highestSeverity = getHighestSeverity(dependency.vulnerabilities);
                        console.log('Rendering dependency:', dependency); // Debug log
                        return (
                          <tr key={dependency._id} className={`transition-all duration-200 hover:bg-border-color/30 ${(startIndex + index) % 2 === 0 ? 'bg-bg-primary' : 'bg-border-color/10'}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-text-primary">
                                {dependency.dependencyName}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-text-secondary font-mono">
                                {dependency.dependencyVersion}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-lg ${getSeverityColor(highestSeverity)}`}>
                                {highestSeverity}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-text-secondary">
                                {dependency.ecosystem || 'N/A'} {/* Added fallback */}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredDependencies.length > 0 && (
              <div className="flex items-center justify-between mt-6 px-4">
                <div className="text-sm text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredDependencies.length)} of {filteredDependencies.length} dependencies
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded font-satoshi transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      color: currentPage === 1 ? 'rgba(156, 163, 175, 0.5)' : 'white'
                    }}
                    title="Previous Page"
                  >
                    <ChevronLeftIcon className="h-3 w-3" />
                  </button>
              
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg font-satoshi transition-all duration-200 ${
                          currentPage === pageNum 
                            ? 'text-white' 
                            : 'bg-transparent text-gray-300 hover:bg-gray-700/50'
                        }`}
                        style={{
                          backgroundColor: currentPage === pageNum ? '#47848F' : 'transparent',
                          border: currentPage === pageNum ? 'none' : '1px solid rgba(75, 85, 99, 0.4)'
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
              
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 rounded font-satoshi transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      color: currentPage === totalPages ? 'rgba(156, 163, 175, 0.5)' : 'white'
                    }}
                    title="Next Page"
                  >
                    <ChevronRightIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredDependencies.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-300 font-satoshi mb-2">
                  No dependencies found matching your criteria.
                </h3>
                <p className="text-sm text-gray-500 font-satoshi">
                  Try adjusting your search terms or browse all dependencies.
                </p>
              </div>
            )}
          </motion.div>

          {/* Right Side - Enhanced Summary Cards */}
          <motion.div 
            className="flex-shrink-0"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
          >
            <div className="space-y-4">
              {/* Total Vulnerable Dependencies Card */}
              <div 
                className="group relative overflow-hidden rounded-xl p-4 border transition-all duration-300 hover:shadow-2xl hover:scale-105 w-36"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                  borderColor: 'rgba(139, 92, 246, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{dependenciesWithVulnerabilities.length}</div>
                  <div className="text-sm font-medium text-purple-300 font-satoshi">Total</div>
                  <div className="text-xs text-purple-400/70 font-satoshi mt-1">With Vulnerabilities</div>
                </div>
              </div>

              {/* Critical Card */}
              <div 
                className="group relative overflow-hidden rounded-xl p-4 border transition-all duration-300 hover:shadow-2xl hover:scale-105 w-36"
                style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)',
                  borderColor: 'rgba(239, 68, 68, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-red-400 mb-2">{dependenciesWithVulnerabilities.filter(d => getHighestSeverity(d.vulnerabilities) === 'Critical').length}</div>
                  <div className="text-sm font-medium text-red-300 font-satoshi">Critical</div>
                  <div className="text-xs text-red-400/70 font-satoshi mt-1">High Priority</div>
                </div>
              </div>

              {/* High Card */}
              <div 
                className="group relative overflow-hidden rounded-xl p-4 border transition-all duration-300 hover:shadow-2xl hover:scale-105 w-36"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 146, 60, 0.05) 100%)',
                  borderColor: 'rgba(251, 146, 60, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-orange-400 mb-2">{dependenciesWithVulnerabilities.filter(d => getHighestSeverity(d.vulnerabilities) === 'High').length}</div>
                  <div className="text-sm font-medium text-orange-300 font-satoshi">High</div>
                  <div className="text-xs text-orange-400/70 font-satoshi mt-1">Medium Priority</div>
                </div>
              </div>

              {/* Medium Card */}
              <div 
                className="group relative overflow-hidden rounded-xl p-4 border transition-all duration-300 hover:shadow-2xl hover:scale-105 w-36"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.05) 100%)',
                  borderColor: 'rgba(251, 191, 36, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{dependenciesWithVulnerabilities.filter(d => getHighestSeverity(d.vulnerabilities) === 'Medium').length}</div>
                  <div className="text-sm font-medium text-yellow-300 font-satoshi">Medium</div>
                  <div className="text-xs text-yellow-400/70 font-satoshi mt-1">Low Priority</div>
                </div>
              </div>

              {/* Low Card */}
              <div 
                className="group relative overflow-hidden rounded-xl p-4 border transition-all duration-300 hover:shadow-2xl hover:scale-105 w-36"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                  borderColor: 'rgba(59, 130, 246, 0.3)'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{dependenciesWithVulnerabilities.filter(d => getHighestSeverity(d.vulnerabilities) === 'Low').length}</div>
                  <div className="text-sm font-medium text-blue-300 font-satoshi">Low</div>
                  <div className="text-xs text-blue-400/70 font-satoshi mt-1">Minimal Risk</div>
                </div>
              </div>

              
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dependencies;