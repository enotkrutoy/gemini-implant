import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, X, Zap, Brain, Sparkles, ScanEye, FileText, AlertTriangle, Syringe, Clock, Activity, Trash2, LayoutGrid, ChevronDown } from 'lucide-react';
import { Message, ChatState, ModelType, QUICK_ACTIONS, ActionCategory } from '../types';
import { MessageBubble } from './MessageBubble';
import { sendMessageToGemini, resetSession } from '../services/geminiService';
import { generateId, compressImage } from '../services/utils';

export const ChatInterface: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome',
        role: 'model',
        text: "## ImplantAI System Ready\n\nСистема готова к работе. Выберите режим модели и загрузите данные пациента (DICOM срезы, фото) или выберите сценарий из панели действий.",
        timestamp: Date.now()
      }
    ],
    isLoading: false,
    model: ModelType.FLASH // Default to FLASH for better stability
  });

  const [inputText, setInputText] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]); // Data URLs
  const [activeCategory, setActiveCategory] = useState<ActionCategory | 'all'>('all');
  const [isActionsOpen, setIsActionsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
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
  }, [chatState.messages, chatState.isLoading, isActionsOpen]);

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
        timestamp: Date.now()
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
            text: "## Новая сессия\n\nКонтекст сброшен. Ожидаю данные клинического случая.",
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
      default: return <Sparkles className={className} />;
    }
  };

  const filteredActions = activeCategory === 'all' 
    ? QUICK_ACTIONS 
    : QUICK_ACTIONS.filter(qa => qa.category === activeCategory);

  return (
    <div className="flex flex-col h-full bg-medical-950 relative text-slate-200">
      
      {/* Top Bar: Controls */}
      <div className="bg-medical-900/80 backdrop-blur-md border-b border-medical-700 px-4 py-3 flex items-center justify-between z-20 shadow-lg shrink-0">
        <div className="flex items-center space-x-2 bg-medical-800 p-1 rounded-lg border border-medical-700">
          <button
            onClick={() => setChatState(prev => ({ ...prev, model: ModelType.FLASH }))}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              chatState.model === ModelType.FLASH 
                ? 'bg-medical-700 text-teal-400 shadow-sm ring-1 ring-medical-600' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fast</span>
          </button>
          <button
            onClick={() => setChatState(prev => ({ ...prev, model: ModelType.PRO }))}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              chatState.model === ModelType.PRO 
                ? 'bg-medical-700 text-indigo-400 shadow-sm ring-1 ring-medical-600' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reasoning 3.0</span>
            <span className="sm:hidden">Pro</span>
          </button>
        </div>

        <button 
          onClick={handleReset}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all"
          title="Сброс сессии"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Area - Flex 1 to push input to bottom */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-6 space-y-2 scrollbar-hide"
        onScroll={() => isActionsOpen && setIsActionsOpen(false)} // Auto-collapse on scroll
      >
        <div className="max-w-4xl mx-auto pb-4">
          {chatState.messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          
          {chatState.isLoading && (
            <div className="flex justify-start mb-6 animate-pulse">
              <div className="bg-medical-800/50 border border-medical-700 rounded-2xl rounded-tl-sm p-4 flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-medical-accent" />
                <span className="text-sm text-slate-400 font-mono">
                  {chatState.model === ModelType.PRO ? 'DEEP ANALYSIS IN PROGRESS...' : 'PROCESSING...'}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" /> 
        </div>
      </div>

      {/* Command Center - Static layout to prevent overlap */}
      <div className="z-30 w-full bg-transparent shrink-0">
        <div className="max-w-4xl mx-auto p-4 flex flex-col gap-3">
          
          {/* Dynamic Collapsible Actions Panel */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActionsOpen ? 'max-h-[300px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-4'}`}>
             <div className="bg-medical-900/90 backdrop-blur-md border border-medical-700 p-2 rounded-xl shadow-2xl mb-1">
               <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-hide border-b border-medical-800 pb-2">
                 {(['all', 'diagnostic', 'surgical', 'prosthetic'] as const).map(cat => (
                   <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors shrink-0
                      ${activeCategory === cat ? 'bg-medical-accent text-white' : 'text-slate-500 hover:text-slate-300'}`}
                   >
                     {cat === 'all' ? 'All' : cat}
                   </button>
                 ))}
               </div>
               
               <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {filteredActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleSubmit(undefined, action.prompt)}
                    className="flex flex-col items-start gap-1 p-2.5 bg-medical-800 hover:bg-medical-700 border border-medical-700 hover:border-medical-600 rounded-lg text-xs transition-all w-32 shrink-0 group touch-manipulation"
                  >
                    <div className="p-1.5 bg-medical-950 rounded-md text-medical-accent group-hover:text-white transition-colors">
                      {getIcon(action.icon)}
                    </div>
                    <span className="text-slate-300 font-medium leading-tight text-left">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="bg-medical-900 border border-medical-700 rounded-2xl shadow-2xl overflow-hidden focus-within:ring-2 focus-within:ring-medical-accent/50 focus-within:border-medical-accent transition-all relative">
             
             {/* Image Previews inside input */}
             {selectedImages.length > 0 && (
              <div className="flex gap-3 overflow-x-auto p-3 bg-medical-950/50 border-b border-medical-800">
                {selectedImages.map((img, idx) => (
                  <div key={idx} className="relative group shrink-0">
                    <div className="h-16 w-16 rounded border border-medical-700 overflow-hidden relative">
                      <img src={img} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                    <button 
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500/90 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e)} className="flex items-end p-2 gap-2">
              
              {/* Toggle Actions Panel Button */}
              <button
                type="button"
                onClick={() => setIsActionsOpen(!isActionsOpen)}
                className={`p-3 rounded-xl transition-all shrink-0 ${isActionsOpen ? 'bg-medical-800 text-medical-accent' : 'text-slate-400 hover:text-slate-200 hover:bg-medical-800'}`}
                title={isActionsOpen ? "Скрыть инструменты" : "Показать инструменты"}
              >
                {isActionsOpen ? <ChevronDown className="w-5 h-5" /> : <LayoutGrid className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-medical-accent hover:bg-medical-800 rounded-xl transition-colors shrink-0"
                title="Загрузить DICOM/Фото"
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
                onFocus={() => isMobile && setIsActionsOpen(false)} // Auto collapse on mobile focus
                placeholder="Опишите клиническую ситуацию..."
                className="flex-1 bg-transparent border-none p-3 max-h-32 min-h-[48px] focus:ring-0 resize-none text-slate-100 placeholder-slate-500 text-sm font-sans"
                rows={1}
              />

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="submit"
                  disabled={(!inputText.trim() && selectedImages.length === 0) || chatState.isLoading}
                  className={`p-3 rounded-xl transition-all shadow-lg flex items-center justify-center
                    ${chatState.model === ModelType.PRO 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20' 
                      : 'bg-medical-accent hover:bg-medical-accentHover text-white shadow-teal-900/20'}
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};