
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, X, Zap, Brain, Sparkles, ScanEye, FileText, AlertTriangle, Syringe, Clock, Activity, Trash2, LayoutGrid, ChevronDown, Leaf, Circle, Gem } from 'lucide-react';
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
        text: "", // Content handled by MessageBubble's special renderer
        timestamp: Date.now()
      }
    ],
    isLoading: false,
    model: ModelType.AUTO // Default to Auto
  });

  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // Data URLs
  const [activeCategory, setActiveCategory] = useState<ActionCategory | 'all'>('all');
  const [isActionsOpen, setIsActionsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial mobile detection and layout setup
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Auto-collapse on mobile by default
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
    // Clear input to allow re-selecting same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();

    const textToSend = overrideText || inputText;
    
    if ((!textToSend.trim() && selectedImages.length === 0) || chatState.isLoading) return;

    // Collapse actions after submission to maximize reading space
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
        model: chatState.model // Tag the message with the model used
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false
      }));

    } catch (error: any) {
      console.error(error);
      
      let errorText = "⚠️ **Internal System Error**: Не удалось получить ответ от модели. Попробуйте еще раз.";
      
      const errorMsg = error instanceof Error ? error.message : String(error);

      if (errorMsg.includes("API_KEY")) {
        errorText = "⚠️ **Configuration Error**: API Key не найден. Убедитесь, что переменная окружения `API_KEY` добавлена в настройках Vercel.";
      } else if (errorMsg.includes("429")) {
        errorText = "⚠️ **Rate Limit**: Превышен лимит запросов к API. Попробуйте позже.";
      } else if (errorMsg.includes("400")) {
        errorText = "⚠️ **Bad Request**: Ошибка формата запроса или изображения.";
      } else if (errorMsg.includes("503") || errorMsg.includes("500")) {
        errorText = "⚠️ **Service Unavailable**: Сервис модели временно недоступен. Попробуйте сменить модель на 'Fast'.";
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
    if (window.confirm("Начать новую сессию? Текущий контекст будет сброшен.")) {
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
      default: return <Sparkles className={className} />;
    }
  };

  const filteredActions = activeCategory === 'all' 
    ? QUICK_ACTIONS 
    : QUICK_ACTIONS.filter(qa => qa.category === activeCategory);

  const activeModelConfig = MODEL_CONFIGS.find(c => c.id === chatState.model) || MODEL_CONFIGS[0];

  return (
    <div className="flex flex-col h-full bg-medical-950 relative text-slate-200">
      
      {/* Top Bar: Controls */}
      <div className="bg-medical-950/80 backdrop-blur-sm border-b border-medical-800 px-4 py-3 flex items-center justify-between z-20 shrink-0">
        
        {/* Model Selector Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
            className="flex items-center space-x-2 bg-medical-900 px-3 py-1.5 rounded-lg border border-medical-800 hover:border-medical-700 transition-all min-w-[140px] shadow-sm"
          >
             {getIcon(activeModelConfig.icon, "w-3.5 h-3.5 text-medical-accent")}
             <span className="text-xs font-semibold text-slate-200">{activeModelConfig.label}</span>
             <ChevronDown className={`w-3 h-3 text-slate-500 ml-auto transition-transform duration-200 ${isModelMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isModelMenuOpen && (
             <>
               <div className="fixed inset-0 z-10" onClick={() => setIsModelMenuOpen(false)}></div>
               <div className="absolute top-full left-0 mt-2 w-64 bg-medical-900 border border-medical-700 rounded-xl shadow-xl z-20 overflow-hidden backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 space-y-1">
                     <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1">Select Model Configuration</div>
                     {MODEL_CONFIGS.map(conf => (
                        <button
                           key={conf.id}
                           onClick={() => {
                              setChatState(prev => ({ ...prev, model: conf.id }));
                              setIsModelMenuOpen(false);
                           }}
                           className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all text-left group
                              ${chatState.model === conf.id 
                                 ? 'bg-medical-800 text-white shadow-sm ring-1 ring-medical-700' 
                                 : 'text-slate-400 hover:bg-medical-800/50 hover:text-slate-200'}`}
                        >
                           <div className={`p-1.5 rounded-md ${chatState.model === conf.id ? 'bg-medical-700' : 'bg-medical-950 group-hover:bg-medical-900'} transition-colors`}>
                              {getIcon(conf.icon, `w-4 h-4 ${chatState.model === conf.id ? 'text-medical-accent' : 'text-slate-500'}`)}
                           </div>
                           <div className="flex-1">
                              <div className="text-xs font-semibold">{conf.label}</div>
                              <div className="text-[10px] opacity-70">{conf.description}</div>
                           </div>
                           {chatState.model === conf.id && <div className="w-1.5 h-1.5 rounded-full bg-medical-accent"></div>}
                        </button>
                     ))}
                  </div>
               </div>
             </>
          )}
        </div>

        <button 
          onClick={handleReset}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-all"
          title="Сброс сессии"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scrollbar-hide"
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
                  {chatState.model.includes('pro') ? 'DEEP ANALYSIS IN PROGRESS...' : 'PROCESSING...'}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" /> 
        </div>
      </div>

      {/* Floating Command Center */}
      <div className="z-30 w-full bg-gradient-to-t from-medical-950 via-medical-950 to-transparent pt-6 pb-2 px-4 shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          
          {/* Collapsible Actions Panel */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActionsOpen ? 'max-h-[400px] opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
             <div className="bg-medical-900/90 backdrop-blur-md border border-medical-800 p-2 rounded-xl shadow-xl">
               <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide border-b border-medical-800/50 pb-2">
                 {(['all', 'diagnostic', 'surgical', 'prosthetic'] as const).map(cat => (
                   <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors shrink-0
                      ${activeCategory === cat ? 'bg-medical-800 text-white border border-medical-700' : 'text-slate-500 hover:text-slate-300 hover:bg-medical-800/50'}`}
                   >
                     {cat === 'all' ? 'All' : cat}
                   </button>
                 ))}
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleSubmit(undefined, action.prompt)}
                    className="flex items-center gap-2 p-2 bg-medical-800/50 hover:bg-medical-800 border border-medical-700/50 hover:border-medical-600 rounded-lg transition-all group text-left"
                  >
                    <div className="p-1.5 bg-medical-950 rounded text-medical-accent group-hover:text-white transition-colors shrink-0">
                      {getIcon(action.icon, "w-3.5 h-3.5")}
                    </div>
                    <span className="text-xs text-slate-300 font-medium line-clamp-1">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Bar */}
          <div className="flex items-end gap-2">
              
             {/* Toggle Menu */}
             <button
                type="button"
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className={`p-3 rounded-xl transition-all shrink-0 border border-transparent ${isActionsOpen ? 'bg-medical-800 text-medical-accent border-medical-700' : 'bg-medical-900 text-slate-400 border-medical-800 hover:text-slate-200'}`}
                title="Tools"
             >
                {isActionsOpen ? <ChevronDown className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
             </button>

             {/* Main Input */}
             <div className="flex-1 bg-medical-900 border border-medical-800 rounded-xl shadow-lg focus-within:ring-1 focus-within:ring-medical-accent focus-within:border-medical-accent/50 transition-all relative">
                
                {/* Image Previews */}
                {selectedImages.length > 0 && (
                  <div className="flex gap-2 p-2 border-b border-medical-800/50">
                    {selectedImages.map((img, idx) => (
                       <div key={idx} className="relative h-12 w-12 rounded overflow-hidden group">
                          <img src={img} alt="preview" className="h-full w-full object-cover" />
                          <button onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <X className="w-4 h-4 text-white" />
                          </button>
                       </div>
                    ))}
                  </div>
                )}

                <form onSubmit={(e) => handleSubmit(e)} className="flex items-end p-2 gap-2">
                   
                   <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-500 hover:text-medical-accent transition-colors shrink-0"
                    title="Attach Files"
                   >
                    <Paperclip className="w-5 h-5" />
                   </button>
                   <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={handleFileSelect}
                   />

                   <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe clinical case..."
                    className="flex-1 bg-transparent border-none p-2 max-h-32 min-h-[24px] focus:ring-0 resize-none text-slate-200 placeholder-slate-600 text-sm leading-relaxed"
                    rows={1}
                    style={{ height: 'auto', minHeight: '24px' }}
                   />

                   <button
                    type="submit"
                    disabled={(!inputText.trim() && selectedImages.length === 0) || chatState.isLoading}
                    className="p-2 bg-medical-accent hover:bg-medical-accentHover text-white rounded-lg shadow-sm disabled:opacity-50 disabled:grayscale transition-all"
                   >
                    <Send className="w-4 h-4" />
                   </button>
                </form>
             </div>
          </div>
          <div className="text-[10px] text-center text-slate-600 font-mono pb-1 select-none">AI can make mistakes. Verify critical data.</div>
        </div>
      </div>
    </div>
  );
};