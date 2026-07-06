import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Plus, 
  Trash2, 
  X,
  Loader2,
  ChevronRight,
  ChevronDown,
  Type,
  List as ListIcon,
  Layers,
  Search,
  FileJson,
  PlusSquare,
  Key,
  Maximize2,
  Minimize2,
  ChevronLeft
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  query
} from 'firebase/firestore';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

interface AttendanceData {
  id: string;
  [key: string]: unknown;
}

// Tree Node Component for recursive rendering
const JSONTreeNode: React.FC<{
  label: string;
  value: unknown;
  path: string[];
  onUpdate: (path: string[], newValue: unknown) => void;
  onDelete: (path: string[]) => void;
  onRename?: (path: string[], oldKey: string, newKey: string) => void;
}> = ({ label, value, path, onUpdate, onDelete, onRename }) => {
  const [isOpen, setIsOpen] = useState(true);
  const isObject = typeof value === 'object' && value !== null;
  const isArray = Array.isArray(value);

  const handleAddValue = () => {
    alert("Database is in read-only mode.");
  };

  const handleRenameKey = () => {
    alert("Database is in read-only mode.");
  };

  const renderValue = () => {
    if (isObject) {
      const entries = Object.entries(value as Record<string, unknown>);
      return (
        <div className="ml-2 sm:ml-4 border-l border-border-color/30 pl-3 sm:pl-4 space-y-2 mt-2">
          {entries.map(([k, v]) => (
            <JSONTreeNode 
              key={k} 
              label={k} 
              value={v} 
              path={[...path, k]} 
              onUpdate={onUpdate} 
              onDelete={onDelete} 
              onRename={onRename}
            />
          ))}
          <button 
            onClick={handleAddValue}
            className="flex items-center gap-1 text-[10px] font-bold text-accent-blue hover:underline p-2 active:bg-accent-blue/5 rounded-lg transition-colors cursor-pointer"
          >
            <Plus size={12} /> {isArray ? 'Add Item' : 'Add Field'}
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 mt-1">
        <input 
          type="text"
          className="neu-input rounded-xl px-3 py-2.5 text-sm w-full outline-none text-text-secondary min-h-[44px]"
          value={String(value ?? '')}
          readOnly
          inputMode="text"
        />
        <button 
          onClick={() => alert("Database is in read-only mode.")} 
          className="text-text-secondary/30 p-2.5 rounded-xl transition-colors shrink-0"
        >
          <Trash2 size={18} />
        </button>
      </div>
    );
  };

  return (
    <div className="py-1">
      <div className="flex items-center gap-2 group">
        <div 
          className="flex items-center gap-2 cursor-pointer grow min-h-[32px]"
          onClick={() => isObject && setIsOpen(!isOpen)}
        >
          {isObject ? (
            isOpen ? <ChevronDown size={16} className="text-text-secondary" /> : <ChevronRight size={16} className="text-text-secondary" />
          ) : (
            <div className="w-[16px]" />
          )}
          
          <div className="flex items-center gap-2">
            {isArray ? <ListIcon size={14} className="text-purple-400" /> : isObject ? <Layers size={14} className="text-orange-400" /> : <Type size={14} className="text-emerald-400" />}
            <span className="text-xs sm:text-sm font-bold text-text-secondary">{label}:</span>
            {isObject && !isOpen && (
              <span className="text-[10px] text-text-secondary/50 font-mono italic">
                {isArray ? `[Array(${(value as unknown[]).length})]` : `{Object}`}
              </span>
            )}
          </div>
        </div>
        
        {!isArray && path.length > 0 && (
          <button 
            onClick={handleRenameKey}
            className="sm:opacity-0 sm:group-hover:opacity-100 text-text-secondary hover:text-accent-blue p-2 rounded-lg transition-all cursor-pointer"
            title="Rename Field"
          >
            <Key size={14} />
          </button>
        )}
      </div>
      {isOpen && renderValue()}
    </div>
  );
};

const DatabaseManager: React.FC = () => {
  const navigate = useNavigate();
  const [activeCollection, setActiveCollection] = useState('attendance');
  const [availableCollections] = useState(['attendance', 'user_logs', 'authorized_admins']);
  const [documents, setDocuments] = useState<AttendanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editBuffer, setEditDocBuffer] = useState<AttendanceData | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const fetchDocs = useCallback(async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, activeCollection));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceData));
      setDocuments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [activeCollection]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const handleUpdateNode = (path: string[], newValue: unknown) => {
    setEditDocBuffer((prev) => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = newValue;
      return next;
    });
  };

  const handleDeleteNode = (path: string[]) => {
    setEditDocBuffer((prev) => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      if (Array.isArray(current)) {
        current.splice(parseInt(path[path.length - 1]), 1);
      } else {
        delete current[path[path.length - 1]];
      }
      return next;
    });
  };

  const handleRenameNode = (parentPath: string[], oldKey: string, newKey: string) => {
    setEditDocBuffer((prev) => {
      if (!prev) return null;
      const next = JSON.parse(JSON.stringify(prev));
      let current = next;
      for (let i = 0; i < parentPath.length; i++) {
        current = current[parentPath[i]];
      }
      current[newKey] = current[oldKey];
      delete current[oldKey];
      return next;
    });
  };

  const handleDeleteDoc = async (_id: string) => {
    alert("Database is in read-only mode. Deletion is disabled.");
  };

  const filteredDocs = documents.filter(d => 
    d.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    JSON.stringify(d).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-8 px-2 sm:px-0">
      {/* Top Header Navigation */}
      <div className="flex items-center gap-4 px-2 pt-2">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 neu-btn rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary"
        >
          <ChevronLeft size={18} />
        </button>
        <h1 className="text-xl font-bold text-text-primary">Database Manager</h1>
      </div>

      {/* Header */}
      <section className="neu-flat rounded-3xl p-6 relative overflow-hidden space-y-6 border border-border-color/10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl neu-inset flex items-center justify-center text-orange-500 shrink-0">
              <Database size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Data Architect</h2>
              <p className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Global Document Manager</p>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl neu-inset text-text-secondary flex items-center justify-center shrink-0 opacity-50">
            <Plus size={18} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 overflow-x-auto no-scrollbar pb-1">
          {availableCollections.map(col => (
            <button
              key={col}
              onClick={() => setActiveCollection(col)}
              className={clsx(
                "px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap cursor-pointer",
                activeCollection === col 
                  ? "neu-inset text-orange-500" 
                  : "neu-flat text-text-secondary hover:text-text-primary"
              )}
            >
              {col.replace('_', ' ')}
            </button>
          ))}
        </div>
      </section>

      {/* Search & Stats */}
      <div className="flex flex-col sm:flex-row gap-4 px-1">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
          <input 
            type="text"
            placeholder="Filter documents or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full neu-input rounded-2xl py-4.5 pl-12 pr-4 text-sm text-text-primary"
          />
        </div>
        <div className="neu-inset px-6 py-4 rounded-2xl flex items-center gap-2 whitespace-nowrap shrink-0 justify-center">
          <FileJson size={18} className="text-orange-500" />
          <span className="text-sm font-black text-text-primary">{filteredDocs.length} Docs</span>
        </div>
      </div>

      {/* Document List */}
      <section className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-text-secondary neu-flat rounded-3xl border border-border-color/10">
            <Loader2 className="animate-spin text-orange-500" size={32} />
            <p className="text-[10px] font-bold uppercase tracking-widest">Streaming from Cloud...</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredDocs.map((d, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                key={d.id}
                className="group flex items-center justify-between p-4 sm:p-5 neu-flat-hover rounded-2xl border border-border-color/10"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center shrink-0">
                    <span className="text-xs font-black text-text-secondary">#</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black truncate text-text-primary">{d.id}</p>
                    <p className="text-[10px] text-text-secondary font-medium mt-0.5">
                      {Object.keys(d).length - 1} Data Columns
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <button
                    onClick={() => {
                      setEditDocBuffer(JSON.parse(JSON.stringify(d)));
                      setIsModalOpen(true);
                    }}
                    className="p-3.5 neu-btn text-orange-500 rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-all"
                  >
                    <Search size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteDoc(d.id)}
                    className="p-3.5 bg-transparent text-text-secondary/15 rounded-xl border border-transparent cursor-not-allowed flex items-center justify-center shrink-0"
                    disabled
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Advanced Tree Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className={clsx(
                "relative w-full bg-bg-primary border border-border-color shadow-2xl overflow-hidden flex flex-col transition-all duration-300 z-10",
                isFullScreen ? "h-full rounded-none" : "max-w-2xl h-[90vh] rounded-[2.5rem] sm:h-auto sm:max-h-[90vh]"
              )}
            >
              {/* Modal Header */}
              <div className="p-6 sm:p-8 border-b border-border-color/10 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-inset flex items-center justify-center text-orange-500 shrink-0">
                    <Search size={18} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl font-black truncate text-text-primary">Document Viewer</h2>
                    <p className="text-[9px] text-text-secondary font-mono font-bold uppercase truncate tracking-wider mt-0.5">READ ONLY MODE</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button 
                    onClick={() => setIsFullScreen(!isFullScreen)} 
                    className="p-3.5 neu-btn rounded-full text-text-secondary hover:text-text-primary transition-all hidden sm:flex items-center justify-center"
                  >
                    {isFullScreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button onClick={() => setIsModalOpen(false)} className="p-3.5 neu-btn rounded-full hover:rotate-90 transition-all text-text-secondary hover:text-text-primary flex items-center justify-center">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Tree Content */}
              <div className="flex-grow overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                <div className="neu-inset rounded-3xl p-4 sm:p-6">
                  {Object.entries(editBuffer || {}).filter(([k]) => k !== 'id').map(([k, v]) => (
                    <JSONTreeNode 
                      key={k}
                      label={k}
                      value={v}
                      path={[k]}
                      onUpdate={handleUpdateNode}
                      onDelete={handleDeleteNode}
                      onRename={handleRenameNode}
                    />
                  ))}
                  <div className="mt-4 pt-4 border-t border-border-color/10 flex flex-col sm:flex-row gap-2 justify-center">
                    <button 
                      onClick={() => {
                        const key = prompt("Enter root field name:");
                        if (key) handleUpdateNode([key], "");
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 neu-btn rounded-xl text-xs font-bold text-accent-blue hover:text-accent-purple transition-all min-h-[44px]"
                    >
                      <PlusSquare size={14} /> Add Root Property
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 sm:p-8 border-t border-border-color/10 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-grow py-4 rounded-2xl font-bold text-sm text-text-secondary neu-btn active:scale-[0.98] transition-all min-h-[50px]"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DatabaseManager;
