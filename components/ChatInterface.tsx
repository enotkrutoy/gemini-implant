
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, X, Zap, Brain, Sparkles, ScanEye, FileText, AlertTriangle, Syringe, Clock, Activity, Trash2, LayoutGrid, ChevronDown, Leaf, Circle, Gem, ShieldCheck } from 'lucide-react';
import { Message, ChatState, ModelType, QUICK_ACTIONS, ActionCategory, MODEL_CONFIGS } from '../types';
import { MessageBubble } from './MessageBubble';
import { sendMessageToGemini, resetSession } from '../services/geminiService';
import { generateId, compressImage } from '../services/utils';

export const ChatInterface: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome',
        role: 'model',
        text: "", 
        timestamp: Date.now()
      }
    ],
    isLoading: false,
    model: ModelType.AUTO 
  });

  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<ActionCategory | 'all'>('all');
  const [isActionsOpen, setIsActionsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsActionsOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages, chatState.isLoading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files) as File[];
      try {
        const newImages = await Promise.all(
          files.map(async (file) => {
            return await compressImage(file);
          })
        );
        setSelectedImages(prev => [...prev, ...newImages]);
      } catch (err) {
        console.error("Image processing error", err);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();

    const textToSend = overrideText || inputText;
    
    if ((!textToSend.trim() && selectedImages.length === 0) || chatState.isLoading) return;

    setIsActionsOpen(false);

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: textToSend,
      images: [...selectedImages],
      timestamp: Date.now()
    };

    const currentHistory = [...chatState.messages];

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true
    }));

    setInputText('');
    setSelectedImages([]);

    try {
      const responseText = await sendMessageToGemini(
        userMessage.text, 
        userMessage.images,
        chatState.model,
        currentHistory
      );
      
      const botMessage: Message = {
        id: generateId(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
        model: chatState.model
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false
      }));

    } catch (error: any) {
      console.error(error);
      
      let errorText = "⚠️ **System Error**: Не удалось получить ответ.";
      const errorMsg = error instanceof Error ? error.message : String(error);

      if (errorMsg.includes("API_KEY")) {
        errorText = "⚠️ **Config Error**: API Key missing.";
      }
      
      const errorMessage: Message = {
        id: generateId(),
        role: 'model',
        text: errorText,
        timestamp: Date.now(),
        isError: true
      };
      
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        isLoading: false
      }));
    }
  };

  const handleReset = () => {
    if (window.confirm("Reset session?")) {
      setChatState(prev => ({
        messages: [
          {
            id: 'welcome',
            role: 'model',
            text: "", 
            timestamp: Date.now()
          }
        ],
        isLoading: false,
        model: prev.model
      }));
      resetSession();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getIcon = (iconName: string, className: string = "w-4 h-4") => {
    switch (iconName) {
      case 'ScanEye': return <ScanEye className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'AlertTriangle': return <AlertTriangle className={className} />;
      case 'Syringe': return <Syringe className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'Activity': return <Activity className={className} />;
      case 'Zap': return <Zap className={className} />;
      case 'Gem': return <Gem className={className} />;
      case 'Leaf': return <Leaf className={className} />;
      case 'Circle': return <Circle className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const filteredActions = activeCategory === 'all' 
    ? QUICK_ACTIONS 
    : QUICK_ACTIONS.filter(qa => qa.category === activeCategory);

  const activeModelConfig = MODEL_CONFIGS.find(c => c.id === chatState.model) || MODEL_CONFIGS[0];

  return (
    <div className="flex flex-col h-full bg-medical-950 relative text-slate-200">
      
      {/* Top Controls - Compact for Mobile */}
      <div className="absolute top-0 left-0 right-0 p-2 z-20 flex justify-between items-center pointer-events-none">
         {/* Model Selector Trigger */}
         <div className="pointer-events-auto">
            <button 
              onClick={() => setIsModelMenuOpen(true)}
              className="flex items-center space-x-2 bg-medical-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-medical-800 shadow-sm active:bg-medical-800"
            >
               {getIcon(activeModelConfig.icon, "w-3.5 h-3.5 text-medical-accent")}
               <span className="text-xs font-semibold text-slate-200">{activeModelConfig.label}</span>
               <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
         </div>

         {/* Reset Button */}
         <div className="pointer-events-auto">
            <button 
              onClick={handleReset}
              className="p-2 bg-medical-900/80 backdrop-blur-md text-slate-500 hover:text-red-400 rounded-full border border-medical-800 shadow-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Full Screen Model Selector Overlay (Mobile Friendly) */}
      {isModelMenuOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-start md:justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsModelMenuOpen(false)}>
           <div 
             className="w-full md:w-80 md:mt-20 bg-medical-900 border-t md:border border-medical-700 rounded-t-2xl md:rounded-xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-top-2 duration-200"
             onClick={e => e.stopPropagation()}
           >
              <div className="flex items-center justify-between p-4 border-b border-medical-800 bg-medical-950/50">
                <span className="text-sm font-bold text-slate-300">Select Model</span>
                <button onClick={() => setIsModelMenuOpen(false)} className="text-slate-500"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
                 {MODEL_CONFIGS.map(conf => (
                    <button
                       key={conf.id}
                       onClick={() => {
                          setChatState(prev => ({ ...prev, model: conf.id }));
                          setIsModelMenuOpen(false);
                       }}
                       className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all text-left
                          ${chatState.model === conf.id 
                             ? 'bg-medical-800 text-white shadow-sm ring-1 ring-medical-700' 
                             : 'text-slate-400 active:bg-medical-800/50'}`}
                    >
                       <div className={`p-2 rounded-md ${chatState.model === conf.id ? 'bg-medical-700' : 'bg-medical-950'} transition-colors`}>
                          {getIcon(conf.icon, `w-5 h-5 ${chatState.model === conf.id ? 'text-medical-accent' : 'text-slate-500'}`)}
                       </div>
                       <div className="flex-1">
                          <div className="text-sm font-semibold">{conf.label}</div>
                          <div className="text-xs opacity-70">{conf.description}</div>
                       </div>
                       {chatState.model === conf.id && <div className="w-2 h-2 rounded-full bg-medical-accent"></div>}
                    </button>
                 ))}
              </div>
              <div className="p-4 bg-medical-950/30 text-[10px] text-center text-slate-500">
                 Pro models consume more credits but offer deeper reasoning.
              </div>
           </div>
        </div>
      )}

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 pt-14 pb-2 space-y-4 scrollbar-hide active:cursor-default"
        onClick={() => isActionsOpen && setIsActionsOpen(false)}
      >
        <div className="max-w-3xl mx-auto pb-4">
          {chatState.messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {chatState.isLoading && (
            <div className="flex justify-start mb-6 animate-pulse">
              <div className="bg-medical-800/50 border border-medical-700 rounded-2xl rounded-tl-sm p-4 flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-medical-accent" />
                <span className="text-sm text-slate-400 font-mono">
                   {/* Dynamic status to match user request theme */}
                   Thinking: [Problem] -> [Diagnosis]...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" /> 
        </div>
      </div>

      {/* Floating Command Center */}
      <div className="z-30 w-full bg-gradient-to-t from-medical-950 via-medical-950 to-transparent pt-4 px-4 shrink-0 pb-safe">
        <div className="max-w-3xl mx-auto flex flex-col gap-3 pb-2">
          
          {/* Collapsible Actions Panel */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActionsOpen ? 'max-h-[50vh] opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
             <div className="bg-medical-900/95 backdrop-blur-md border border-medical-800 p-2 rounded-xl shadow-xl">
               <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide border-b border-medical-800/50 pb-2">
                 {(['all', 'diagnostic', 'surgical', 'prosthetic'] as const).map(cat => (
                   <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-2 rounded-md text-[10px] uppercase font-bold tracking-wider transition-colors shrink-0
                      ${activeCategory === cat ? 'bg-medical-800 text-white border border-medical-700' : 'text-slate-500 hover:text-slate-300 hover:bg-medical-800/50'}`}
                   >
                     {cat === 'all' ? 'All' : cat}
                   </button>
                 ))}
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filteredActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleSubmit(undefined, action.prompt)}
                    className="flex items-center gap-3 p-3 bg-medical-800/50 hover:bg-medical-800 border border-medical-700/50 hover:border-medical-600 rounded-lg transition-all group text-left active:bg-medical-700"
                  >
                    <div className="p-2 bg-medical-950 rounded text-medical-accent group-hover:text-white transition-colors shrink-0">
                      {getIcon(action.icon, "w-4 h-4")}
                    </div>
                    <span className="text-sm text-slate-300 font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Bar */}
          <div className="flex items-end gap-2">
             <button
                type="button"
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className={`p-3 rounded-xl transition-all shrink-0 border h-[50px] w-[50px] flex items-center justify-center ${isActionsOpen ? 'bg-medical-800 text-medical-accent border-medical-700' : 'bg-medical-900 text-slate-400 border-medical-800'}`}
             >
                {isActionsOpen ? <ChevronDown className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
             </button>

             <div className="flex-1 bg-medical-900 border border-medical-800 rounded-xl shadow-lg focus-within:ring-1 focus-within:ring-medical-accent transition-all relative">
                
                {selectedImages.length > 0 && (
                  <div className="flex gap-2 p-2 border-b border-medical-800/50 overflow-x-auto">
                    {selectedImages.map((img, idx) => (
                       <div key={idx} className="relative h-12 w-12 rounded overflow-hidden shrink-0">
                          <img src={img} alt="preview" className="h-full w-full object-cover" />
                          <button onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center">
                             <X className="w-4 h-4 text-white" />
                          </button>
                       </div>
                    ))}
                  </div>
                )}

                <form onSubmit={(e) => handleSubmit(e)} className="flex items-center p-1.5 gap-2">
                   <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-500 active:text-medical-accent shrink-0"
                   >
                    <Paperclip className="w-5 h-5" />
                   </button>
                   {/* 
                     ANDROID FIX: 
                     Using "hidden" class (display: none) prevents programmatic click on some Android WebViews.
                     Instead, we use 0 size and 0 opacity but keep it in the layout flow.
                     We also expanded accept attribute to ensure Gallery/Camera intents trigger correctly.
                   */}
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="absolute opacity-0 w-px h-px overflow-hidden -z-10 pointer-events-none" 
                    multiple 
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/heic, image/*"
                    onChange={handleFileSelect}
                   />

                   <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe case for [Verification]..."
                    className="flex-1 bg-transparent border-none p-2 max-h-24 min-h-[40px] focus:ring-0 resize-none text-slate-200 placeholder-slate-600 text-base leading-normal"
                    rows={1}
                   />

                   <button
                    type="submit"
                    disabled={(!inputText.trim() && selectedImages.length === 0) || chatState.isLoading}
                    className="p-2 bg-medical-accent text-white rounded-lg disabled:opacity-50 disabled:grayscale active:scale-95 shrink-0"
                   >
                    <Send className="w-5 h-5" />
                   </button>
                </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
