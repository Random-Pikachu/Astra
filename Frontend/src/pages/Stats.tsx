import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../hooks/useUser';
import { apiService } from '../services/api';
import ProfileDropdown from '../components/ProfileDropdown';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
}

interface RepoStatsItem {
  repo: {
    _id: string;
    name: string;
  };
  totalVulnerabilities: number;
  ecosystem?: string[];
  severityCounts?: SeverityCounts;
}

const Stats: React.FC = () => {
  const { userCode, username, userEmail } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RepoStatsItem[]>([]);
  const [mostVulnerable, setMostVulnerable] = useState<RepoStatsItem | null>(null);
  const [highestSeverity, setHighestSeverity] = useState<RepoStatsItem | null>(null);
  const [packageManagers, setPackageManagers] = useState<string[]>([]);
  const [selectedEcosystem, setSelectedEcosystem] = useState<string>('All');
  const [pmOpen, setPmOpen] = useState(false);
  const pmRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (pmRef.current && !pmRef.current.contains(e.target as Node)) {
        setPmOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!userCode) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiService.getRepoStats(userCode);
        setData(res.repoStats || []);
        setMostVulnerable(res.mostVulnerableRepo || null);
        setHighestSeverity(res.repoWithHighestSeverity || null);
        setPackageManagers(res.distinctPackageManagers || []);
      } catch (e) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [userCode]);

  const filtered = useMemo(() => {
    if (selectedEcosystem === 'All') return data || [];
    return (data || []).filter((d) => (d.ecosystem || []).includes(selectedEcosystem));
  }, [data, selectedEcosystem]);

  const chartData = useMemo(
    () =>
      (filtered || []).map((item) => ({
        name: item.repo?.name || 'Repo',
        vulnerabilities: item.totalVulnerabilities || 0,
      })),
    [filtered]
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value as number;
      return (
        <div className="rounded-md border px-3 py-2" style={{ backgroundColor: '#0d1117', borderColor: '#30363d' }}>
          <div className="text-xs text-[#9ca3af] font-satoshi mb-1">{label}</div>
          <div className="text-sm text-white font-satoshi">{value} vulnerabilities</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <motion.div 
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <div className="flex justify-between items-center p-6 mb-4">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <motion.button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-border-color transition-colors duration-200"
              title="Back"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeftIcon className="h-6 w-6 text-text-primary" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Repository Stats</h1>
              <p className="text-gray-400 font-satoshi text-sm">Overview for {username || userEmail}</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ProfileDropdown />
          </motion.div>
        </div>
      </motion.div>

      <div className="px-4 pb-6 max-w-6xl mx-auto">
        {/* Top insight cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}
          >
            <div className="text-xs uppercase tracking-wide text-[#9ca3af] font-satoshi mb-1">Most vulnerable repo</div>
            <div className="flex items-baseline justify-between">
              <div className="text-lg text-white font-satoshi font-medium truncate max-w-[70%]" title={mostVulnerable?.repo?.name || ''}>
                {mostVulnerable?.repo?.name || '—'}
              </div>
              <div className="text-2xl text-white font-satoshi">{mostVulnerable?.totalVulnerabilities ?? 0}</div>
            </div>
            <div className="text-xs text-[#9ca3af] font-satoshi mt-1">
              Ecosystem: {(mostVulnerable?.ecosystem || []).join(', ') || '—'}
            </div>
          </div>

          <div
            className="rounded-xl border p-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: 'var(--border-color)' }}
          >
            <div className="text-xs uppercase tracking-wide text-[#9ca3af] font-satoshi mb-1">Highest severity ratio</div>
            <div className="flex items-baseline justify-between">
              <div className="text-lg text-white font-satoshi font-medium truncate max-w-[70%]" title={highestSeverity?.repo?.name || ''}>
                {highestSeverity?.repo?.name || '—'}
              </div>
              <div className="text-2xl text-white font-satoshi">
                {(() => {
                  const hc = (highestSeverity?.severityCounts?.critical || 0) + (highestSeverity?.severityCounts?.high || 0);
                  const tot = highestSeverity?.totalVulnerabilities || 1;
                  return Math.round((hc / tot) * 100);
                })()}%
              </div>
            </div>
            <div className="text-xs text-[#9ca3af] font-satoshi mt-1">
              Critical+High: {(highestSeverity?.severityCounts?.critical || 0) + (highestSeverity?.severityCounts?.high || 0)} of {highestSeverity?.totalVulnerabilities || 0}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-end mb-2" ref={pmRef}>
          <label className="text-sm text-[#9ca3af] font-satoshi mr-2">Package manager</label>
          <div className="relative">
            <button
              onClick={() => setPmOpen((v) => !v)}
              className="min-w-28 px-3 py-2 text-sm rounded-xl border flex items-center justify-between gap-2 transition-colors"
              style={{ 
                backgroundColor: '#151515', 
                borderColor: 'var(--border-color)', 
                color: 'var(--text-primary)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                outline: 'none'
              }}
              aria-haspopup="listbox"
              aria-expanded={pmOpen}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1b1b1b'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#151515'; }}
            >
              <span className="truncate">{selectedEcosystem}</span>
              <ExpandMoreIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
            </button>
            {pmOpen && (
              <div
                className="absolute right-0 mt-2 w-44 rounded-xl border z-50"
                style={{ 
                  backgroundColor: '#161616', 
                  borderColor: 'var(--border-color)', 
                  boxShadow: '0 12px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
                }}
                role="listbox"
              >
                {['All', ...packageManagers].map((pm) => (
                  <button
                    key={pm}
                    onClick={() => { setSelectedEcosystem(pm); setPmOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm transition-colors"
                    style={{ color: pm === selectedEcosystem ? 'white' : 'var(--text-primary)' }}
                    role="option"
                    aria-selected={pm === selectedEcosystem}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1b1b1b'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#161616'; }}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          className="rounded-xl border shadow-xl p-4"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.01)',
            borderColor: 'var(--border-color)'
          }}
        >
          {loading ? (
            <div className="text-center py-16 text-gray-300 font-satoshi">Loading stats...</div>
          ) : error ? (
            <div className="text-center py-16 text-red-400 font-satoshi">{error}</div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-16 text-gray-300 font-satoshi">No data available</div>
          ) : (
            <div className="h-96">
              {/* Minimal shadcn-like chart styles: subtle grid, single-color gradient bars, full viewport height */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#9ec5ff" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#8bb9ff" stopOpacity={0.75} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--border-color)' }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'var(--border-color)' }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="vulnerabilities" radius={[8, 8, 0, 0]} fill="url(#barGradient)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stats;


