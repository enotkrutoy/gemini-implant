import React, { useState, useEffect } from 'react';
import { Disclaimer } from './components/Disclaimer';
import { ChatInterface } from './components/ChatInterface';
import { SettingsModal } from './components/SettingsModal';
import { Activity, ShieldCheck, History, Menu, Settings, FolderHeart, User, MoreHorizontal, Archive, Trash2, FolderOpen, ArrowUpRight, X } from 'lucide-react';
import { generateId } from './services/utils';

// Types for SideBar
interface PatientCase {
  id: string;
  name: string;
  detail: string;
  date: string;
  status: 'active' | 'archived';
}

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // State for cases
  const [cases, setCases] = useState<PatientCase[]>([
    { id: '1', name: 'Patient #4001', detail: 'Maxilla / GBR', date: 'Yesterday', status: 'active' },
    { id: '2', name: 'Patient #4002', detail: 'Mandible / All-on-4', date: '2 days ago', status: 'active' },
    { id: '3', name: 'Patient #3098', detail: 'Single Unit / 36', date: 'Last Week', status: 'archived' },
  ]);

  // Menu state for sidebar items
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Handle mobile detection and sidebar behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCreateNew = () => {
    const newCase: PatientCase = {
      id: generateId(),
      name: `Patient #${Math.floor(Math.random() * 1000) + 4000}`,
      detail: 'New Case',
      date: 'Just now',
      status: 'active'
    };
    setCases(prev => [newCase, ...prev]);
    setActiveCaseId(newCase.id);
    if(isMobile) setSidebarOpen(false);
  };

  const handleArchive = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'archived' } : c));
    setOpenMenuId(null);
  };

  const handleRestore = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'active' } : c));
    setOpenMenuId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to permanently delete this case record?')) {
      setCases(prev => prev.filter(c => c.id !== id));
      if (activeCaseId === id) setActiveCaseId(null);
    }
    setOpenMenuId(null);
  };

  const activeCases = cases.filter(c => c.status === 'active');
  const archivedCases = cases.filter(c => c.status === 'archived');

  return (
    // Used h-[100dvh] for mobile browsers to account for address bar
    <div className="relative h-[100dvh] w-full bg-medical-950 flex flex-col font-sans text-slate-200 overflow-hidden selection:bg-medical-accent selection:text-white">
      <Disclaimer />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      <div className="flex flex-1 overflow-hidden relative w-full">
        
        {/* Mobile Backdrop - High Z-Index to cover everything */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
            fixed inset-y-0 left-0 z-[70] md:relative md:z-0
            ${sidebarOpen ? 'w-[85vw] md:w-72 translate-x-0' : 'w-[85vw] md:w-0 -translate-x-full md:w-0'} 
            bg-medical-900 border-r border-medical-800 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
            pt-safe pb-safe
          `}>
          
          {/* Sidebar Header */}
          <div className="p-4 md:p-5 border-b border-medical-800 flex items-center justify-between shrink-0">
             <div className="flex items-center space-x-3">
                <div className="bg-medical-800 p-2 rounded-lg border border-medical-700 shadow-inner">
                  <Activity className="w-5 h-5 md:w-6 md:h-6 text-medical-accent" />
                </div>
                <div className="min-w-[120px]">
                  <h1 className="text-lg font-bold text-slate-100 tracking-tight leading-none">ImplantAI</h1>
                  <div className="flex items-center mt-1">
                    <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">System Online</p>
                  </div>
                </div>
             </div>
             {isMobile && (
               <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-2 bg-medical-800 rounded-lg">
                 <X className="w-5 h-5" />
               </button>
             )}
          </div>

          <div className="p-4 shrink-0">
             <button 
              onClick={handleCreateNew}
              className="w-full bg-medical-accent/10 hover:bg-medical-accent/20 text-medical-accent border border-medical-accent/30 hover:border-medical-accent/50 px-4 py-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-teal-900/10 active:scale-95"
            >
              <User className="w-4 h-4" />
              <span>Новый пациент</span>
            </button>
          </div>
          
          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 custom-scrollbar" onClick={() => setOpenMenuId(null)}>
             
             {/* Active Cases */}
             <div>
               <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center px-1">
                 <History className="w-3 h-3 mr-2" /> Recent Cases
               </h2>
               <div className="space-y-2">
                  {activeCases.length === 0 && (
                    <div className="text-xs text-slate-600 italic px-2 py-4 text-center border border-dashed border-medical-800 rounded-lg">
                      No active cases
                    </div>
                  )}
                  {activeCases.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => { setActiveCaseId(c.id); if(isMobile) setSidebarOpen(false); }}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all group active:bg-medical-800
                        ${activeCaseId === c.id 
                          ? 'bg-medical-800 border-medical-600 shadow-md' 
                          : 'bg-medical-950/30 border-medical-800 hover:bg-medical-800 hover:border-medical-700'}`}
                    >
                       <div className="flex justify-between items-start">
                         <div className="text-xs font-medium text-slate-200 group-hover:text-white">{c.name}</div>
                         <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === c.id ? null : c.id);
                            }}
                            className={`p-2 -mt-2 -mr-2 rounded-md text-slate-500 hover:text-white transition-colors ${openMenuId === c.id ? 'bg-medical-700 text-white' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
                          >
                           <MoreHorizontal className="w-4 h-4" />
                         </button>
                       </div>
                       <div className="text-[10px] text-slate-500 font-mono flex justify-between mt-1">
                          <span className={`${activeCaseId === c.id ? 'text-medical-accent' : ''}`}>{c.detail}</span>
                          <span>{c.date}</span>
                       </div>

                       {/* Context Menu */}
                       {openMenuId === c.id && (
                         <div className="absolute right-2 top-8 w-32 bg-medical-900 border border-medical-700 shadow-xl rounded-lg z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                           <button 
                            onClick={(e) => handleArchive(c.id, e)}
                            className="w-full text-left px-3 py-3 text-xs text-slate-300 hover:bg-medical-800 hover:text-white flex items-center gap-2 active:bg-medical-700"
                           >
                             <Archive className="w-3 h-3" /> Archive
                           </button>
                           <button 
                            onClick={(e) => handleDelete(c.id, e)}
                            className="w-full text-left px-3 py-3 text-xs text-red-400 hover:bg-red-900/30 flex items-center gap-2 active:bg-red-900/50"
                           >
                             <Trash2 className="w-3 h-3" /> Delete
                           </button>
                         </div>
                       )}
                    </div>
                  ))}
               </div>
             </div>
             
             {/* Protocols Section */}
             <div>
                <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center px-1">
                 <FolderHeart className="w-3 h-3 mr-2" /> Protocols
               </h2>
               <div className="space-y-1">
                 {['ITI Standard', 'Immediate Loading', 'Sinus Lift Lateral'].map((item) => (
                   <div key={item} className="text-xs text-slate-400 hover:text-medical-accent hover:bg-medical-800/50 px-2 py-3 rounded cursor-pointer transition-colors active:bg-medical-800">
                     {item}
                   </div>
                 ))}
               </div>
             </div>
          </div>

          {/* Footer */}
           <div className="p-4 border-t border-medical-800 shrink-0 bg-medical-900">
             <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-full flex items-center justify-between text-slate-500 hover:text-slate-300 cursor-pointer transition-colors p-2 rounded hover:bg-medical-800 group"
             >
               <div className="flex items-center gap-2">
                 <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
                 <span className="text-xs font-medium">Settings & Debug</span>
               </div>
               <span className="text-[10px] bg-medical-800 px-1.5 py-0.5 rounded border border-medical-700 group-hover:border-medical-600">v2.1</span>
             </button>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative h-full bg-medical-950 w-full z-0">
          
          {/* Header Mobile/Desktop */}
          <header className="h-14 border-b border-medical-800 flex items-center justify-between px-4 bg-medical-950/80 backdrop-blur-md shrink-0 z-30 pt-safe sticky top-0">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="text-slate-400 hover:text-white p-2 hover:bg-medical-800 rounded-lg transition-colors mr-2 active:bg-medical-800"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="md:hidden font-bold text-slate-100 text-sm tracking-tight">ImplantAI</span>
            </div>
            
            <div className="flex items-center space-x-2">
               <div className="hidden md:flex items-center text-[10px] uppercase tracking-wider font-bold text-medical-accent bg-medical-900/50 px-3 py-1.5 rounded border border-medical-800/50 shadow-sm">
                  <ShieldCheck className="w-3 h-3 mr-2" />
                  HIPAA Compliant
               </div>
               <div className="md:hidden text-medical-accent bg-medical-900/30 p-1.5 rounded-md border border-medical-800/30">
                 <ShieldCheck className="w-4 h-4" />
               </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;