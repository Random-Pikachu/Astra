import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import TerminalIcon from '@mui/icons-material/Terminal';
import { io, Socket } from 'socket.io-client';

type FixEventType = 'start' | 'info' | 'command' | 'warning' | 'error' | 'success' | 'complete' | 'git' | 'package' | 'file' | 'log';

interface FixProgressEvent {
  channelId: string;
  type: FixEventType;
  message: string;
  meta?: any;
  ts: number;
}

interface FixConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  title?: string;
}

const typeToColor: Record<FixEventType, string> = {
  start: 'text-blue-300',
  info: 'text-gray-300',
  command: 'text-blue-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
  success: 'text-green-400',
  complete: 'text-green-400',
  git: 'text-purple-300',
  package: 'text-cyan-300',
  file: 'text-emerald-300',
  log: 'text-gray-200',
};

const typeToIcon: Record<FixEventType, string> = {
  start: '🚀',
  info: '💡',
  command: '▶️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  complete: '✅',
  git: '🌿',
  package: '📦',
  file: '📝',
  log: '🕒',
};

const FixConsoleModal: React.FC<FixConsoleModalProps> = ({ isOpen, onClose, channelId, title }) => {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<FixProgressEvent[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isOpen || !channelId) return;

    const s = io('http://https://astra-sfnd.onrender.com/', {
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socketRef.current = s;

    

    const handleConnect = () => {
      setConnected(true);
      s.emit('join', channelId);
    };
    const handleDisconnect = () => {
      setConnected(false);
    };
    const handleConnectError = () => {
      
    };
    const handleError = () => {
      
    };
    const handleProgress = (evt: FixProgressEvent) => {
      if (!evt || evt.channelId !== channelId) return;
      setEvents(prev => [...prev, evt]);
      if (evt.type === 'complete') setIsComplete(true);
    };
    const handleReconnectAttempt = () => {
      
    };
    const handleReconnect = () => {
      s.emit('join', channelId);
    };

    s.on('connect', handleConnect);
    s.on('disconnect', handleDisconnect);
    s.on('connect_error', handleConnectError);
    s.on('error', handleError);
    s.on('reconnect_attempt', handleReconnectAttempt);
    s.on('reconnect', handleReconnect);
    s.on('fix-progress', handleProgress);

    return () => {
      try {
        s.off('connect', handleConnect);
        s.off('disconnect', handleDisconnect);
        s.off('connect_error', handleConnectError);
        s.off('error', handleError);
        s.off('reconnect_attempt', handleReconnectAttempt);
        s.off('reconnect', handleReconnect);
        s.off('fix-progress', handleProgress);
        s.disconnect();
      } catch (e) {
        // ignore
      }
      socketRef.current = null;
    };
  }, [isOpen, channelId]);

  useEffect(() => {
    if (!endRef.current) return;
    endRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const handleClose = () => {
    setEvents([]);
    setIsComplete(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <div
              className="w-full max-w-4xl max-h-[80vh] rounded-xl border shadow-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <TerminalIcon className="h-5 w-5" style={{ color: 'var(--accent-color-2)' }} />
                  <h2 className="text-lg font-semibold text-text-primary">
                    {title || 'Fix Console'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-xs text-text-secondary">{connected ? 'Connected' : 'Disconnected'}</span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 rounded-lg hover:bg-border-color transition-colors duration-200"
                >
                  <CloseIcon className="h-5 w-5 text-text-primary" />
                </button>
              </div>

              <div className="h-96 overflow-y-auto p-4 font-mono text-sm" style={{ backgroundColor: '#0a0a0a' }}>
                {events.map((evt) => (
                  <motion.div
                    key={`${evt.ts}-${Math.random()}`}
                    className={`flex items-start gap-2 mb-2 ${typeToColor[evt.type]}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <span className="flex-shrink-0 mt-0.5">{typeToIcon[evt.type]}</span>
                    <span className="text-xs text-gray-500 flex-shrink-0 mt-0.5">
                      [{(evt.meta && evt.meta.rawTs) ? evt.meta.rawTs : new Date(evt.ts).toLocaleTimeString()}]
                    </span>
                    <span className="flex-1 break-words">{evt.message}</span>
                  </motion.div>
                ))}
                <div ref={endRef} />
              </div>

              <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-sm text-text-secondary">
                  {isComplete ? (
                    <span className="text-green-400">✅ Fix process completed</span>
                  ) : (
                    <span>Streaming output...</span>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                  style={{ backgroundColor: isComplete ? 'var(--accent-color-2)' : 'var(--border-color)', color: isComplete ? 'white' : 'var(--text-secondary)' }}
                >
                  {isComplete ? 'Close' : 'Hide'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FixConsoleModal;


