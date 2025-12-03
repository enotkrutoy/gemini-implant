import React, { useState } from 'react';
import { X, Settings, Database, Activity, Terminal, Trash2, Save, Cpu, HardDrive } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'general' | 'model' | 'debug';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-medical-900 w-full max-w-2xl rounded-2xl border border-medical-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-medical-800 bg-medical-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-medical-800 rounded-lg border border-medical-700">
              <Settings className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">System Configuration</h2>
              <p className="text-xs text-slate-500 font-mono">v2.1.0 • BUILD 2024.10.24</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white hover:bg-medical-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-medical-800 bg-medical-900/50">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-medical-accent text-medical-accent' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('model')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'model' ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Model Parameters
          </button>
          <button 
            onClick={() => setActiveTab('debug')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'debug' ? 'border-red-400 text-red-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <Terminal className="w-3 h-3" />
            Debug & Logs
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Interface</h3>
                
                <div className="flex items-center justify-between p-4 bg-medical-800/30 rounded-lg border border-medical-800">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Compact Mode</div>
                    <div className="text-xs text-slate-500">Reduce padding for higher information density</div>
                  </div>
                  <div className="w-10 h-5 bg-medical-700 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-slate-400 rounded-full transition-all"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-medical-800/30 rounded-lg border border-medical-800">
                  <div>
                    <div className="text-sm font-medium text-slate-200">High Contrast Clinical View</div>
                    <div className="text-xs text-slate-500">Enhance visibility of critical alerts</div>
                  </div>
                  <div className="w-10 h-5 bg-medical-accent rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Storage</h3>
                <div className="flex items-center justify-between p-4 bg-medical-800/30 rounded-lg border border-medical-800">
                  <div className="flex items-center gap-3">
                    <Database className="w-5 h-5 text-slate-400" />
                    <div>
                      <div className="text-sm font-medium text-slate-200">Local History</div>
                      <div className="text-xs text-slate-500">2.4 MB used</div>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-medical-800 hover:bg-red-900/30 text-slate-300 hover:text-red-400 border border-medical-700 hover:border-red-800 rounded text-xs transition-colors">
                    Clear Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODEL TAB */}
          {activeTab === 'model' && (
             <div className="space-y-6">
               <div className="p-4 bg-indigo-900/10 border border-indigo-500/20 rounded-lg mb-4">
                 <div className="flex items-center gap-2 text-indigo-400 mb-2">
                   <Activity className="w-4 h-4" />
                   <span className="text-xs font-bold uppercase">Active Configuration</span>
                 </div>
                 <p className="text-xs text-indigo-200/70">
                   Adjusting these parameters affects the determinism and creativity of the clinical reasoning engine. 
                   <br/><strong>Recommended:</strong> Low temperature for surgical protocols.
                 </p>
               </div>

               <div className="space-y-4">
                  <div>
                    <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                      <span>Temperature</span>
                      <span className="font-mono text-medical-accent">0.2</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.1" defaultValue="0.2" className="w-full h-1.5 bg-medical-800 rounded-lg appearance-none cursor-pointer accent-medical-accent" />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                      <span>PRECISE</span>
                      <span>CREATIVE</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex justify-between text-sm font-medium text-slate-300 mb-2">
                      <span>Top K</span>
                      <span className="font-mono text-medical-accent">40</span>
                    </label>
                    <input type="range" min="1" max="100" defaultValue="40" className="w-full h-1.5 bg-medical-800 rounded-lg appearance-none cursor-pointer accent-medical-accent" />
                  </div>
               </div>
             </div>
          )}

          {/* DEBUG TAB */}
          {activeTab === 'debug' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-black/40 rounded-lg border border-medical-800">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Cpu className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase">Memory Usage</span>
                  </div>
                  <div className="text-2xl font-mono text-green-400">~42 MB</div>
                </div>
                <div className="p-4 bg-black/40 rounded-lg border border-medical-800">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <HardDrive className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase">Cache Size</span>
                  </div>
                  <div className="text-2xl font-mono text-blue-400">12 Items</div>
                </div>
              </div>

              <div className="bg-black/80 rounded-lg border border-medical-800 p-4 font-mono text-xs h-48 overflow-y-auto text-slate-300">
                <div className="text-green-500">[10:00:01] SYSTEM: ImplantAI Core Initialized</div>
                <div className="text-blue-500">[10:00:02] NETWORK: Connected to Gemini API Gateway</div>
                <div className="text-slate-500">[10:00:02] CONFIG: Loading user preferences...</div>
                <div className="text-slate-500">[10:00:02] STORAGE: LocalDB mounted successfully</div>
                <div className="text-yellow-500">[10:05:23] WARN: Image compression ratio &gt; 80%</div>
                <div>[10:05:24] ACTION: User uploaded 'scan_maxilla.png'</div>
                <div>[10:05:25] MODEL: Processing image tokens...</div>
                <div className="text-green-500 animate-pulse">_</div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-medical-800 hover:bg-medical-700 text-slate-300 rounded border border-medical-700 text-xs font-mono transition-colors">
                  EXPORT LOGS
                </button>
                <button className="flex-1 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded border border-red-900/50 text-xs font-mono transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="w-3 h-3" />
                  FLUSH MEMORY
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-medical-800 bg-medical-950/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={onClose} className="px-4 py-2 bg-medical-accent hover:bg-medical-accentHover text-white text-sm font-semibold rounded-lg shadow-lg shadow-teal-900/20 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};