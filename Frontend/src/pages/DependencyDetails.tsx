import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProfileDropdown from '../components/ProfileDropdown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
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
}

interface Dependency {
  repoCode: string;
  ecosystem: string;
  dependencyName: string;
  dependencyVersion: string;
  dependencyCode: string;
  vulnerabilities: Vulnerability[];
}

const DependencyDetails: React.FC = () => {
  const navigate = useNavigate();
  const { repoCode, dependencyCode } = useParams<{ repoCode: string; dependencyCode: string }>();
  const [dependency, setDependency] = useState<Dependency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDependencyDetails = async () => {
      if (!repoCode || !dependencyCode) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getVulnerabilityDetails(repoCode, dependencyCode);
        if (response.dependency) {
          setDependency(response.dependency);
        } else {
          setError('No dependency details found');
        }
      } catch (error) {
        console.error('Failed to fetch dependency details:', error);
        setError('Failed to fetch dependency details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDependencyDetails();
  }, [repoCode, dependencyCode]);

  const handleBackToDependencies = () => {
    navigate(`/dependencies/${repoCode}`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'MODERATE':
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getSeverityDisplayName = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return 'Critical';
      case 'HIGH':
        return 'High';
      case 'MODERATE':
      case 'MEDIUM':
        return 'Medium';
      case 'LOW':
        return 'Low';
      default:
        return severity;
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        className="min-h-screen bg-bg-primary text-text-primary font-satoshi mt-18"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 font-satoshi">Loading dependency details...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !dependency) {
    return (
      <motion.div 
        className="min-h-screen bg-bg-primary text-text-primary font-satoshi mt-18"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-300 font-satoshi mb-2">
              {error || 'Dependency not found'}
            </h3>
            <button
              onClick={handleBackToDependencies}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              Back to Dependencies
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

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
                onClick={handleBackToDependencies}
                className="p-2 rounded-lg hover:bg-border-color transition-colors duration-200"
                title="Back to Dependencies"
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
                  Dependency Details
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
        {/* Dependency Overview Card */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2, ease: "easeOut" }}
        >
          <div 
            className="rounded-xl border p-6"
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              borderColor: 'var(--border-color)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Package Name</h3>
                <p className="text-lg font-semibold text-text-primary">{dependency.dependencyName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Version</h3>
                <p className="text-lg font-semibold text-text-primary font-mono">{dependency.dependencyVersion}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Ecosystem</h3>
                <p className="text-lg font-semibold text-text-primary">{dependency.ecosystem}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary mb-2">Vulnerabilities</h3>
                <p className="text-lg font-semibold text-text-primary">{dependency.vulnerabilities.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vulnerabilities Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25, ease: "easeOut" }}
        >
          <h2 className="text-xl font-bold text-text-primary mb-6">Vulnerabilities</h2>
          
          {dependency.vulnerabilities.length === 0 ? (
            <div 
              className="rounded-xl border p-8 text-center"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.01)',
                borderColor: 'var(--border-color)'
              }}
            >
              <p className="text-gray-400 font-satoshi">No vulnerabilities found for this dependency.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dependency.vulnerabilities.map((vulnerability, index) => (
                <motion.div
                  key={vulnerability.vulnerabilityId}
                  className="rounded-xl border p-6"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    borderColor: 'var(--border-color)'
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.1, ease: "easeOut" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`inline-flex px-3 py-1.5 text-xs font-medium rounded-lg ${getSeverityColor(vulnerability.severity)}`}>
                          {getSeverityDisplayName(vulnerability.severity)}
                        </span>
                        <span className="text-sm text-text-secondary font-mono">
                          {vulnerability.vulnerabilityId}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {vulnerability.summary}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {vulnerability.details && (
                      <div>
                        <h4 className="text-sm font-medium text-text-secondary mb-2">Details</h4>
                        <p className="text-text-primary text-sm leading-relaxed">
                          {vulnerability.details}
                        </p>
                      </div>
                    )}
                    
                    {vulnerability.references && vulnerability.references.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-text-secondary mb-2">References</h4>
                        <div className="space-y-2">
                          {vulnerability.references.map((reference, refIndex) => (
                            <div key={refIndex} className="flex items-center gap-2">
                              <span className="text-xs text-text-secondary bg-gray-700/50 px-2 py-1 rounded">
                                {reference.type}
                              </span>
                              <a
                                href={reference.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
                              >
                                {reference.url}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      <button className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200" >Fix Vulnerabilities</button>
    </motion.div>
  );
};

export default DependencyDetails;
