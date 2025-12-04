import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, X, ShieldCheck, Activity, Sparkles, Zap, Gem, Leaf, Circle } from 'lucide-react';
import { Message, MODEL_CONFIGS } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const getModelIcon = (modelId?: string) => {
    if (!modelId) return null;
    const config = MODEL_CONFIGS.find(c => c.id === modelId);
    if (!config) return null;

    switch (config.icon) {
      case 'Zap': return <Zap className="w-3 h-3" />;
      case 'Gem': return <Gem className="w-3 h-3" />;
      case 'Leaf': return <Leaf className="w-3 h-3" />;
      case 'Circle': return <Circle className="w-3 h-3" />;
      default: return <Sparkles className="w-3 h-3" />;
    }
  };

  const getModelLabel = (modelId?: string) => {
    if (!modelId) return null;
    const config = MODEL_CONFIGS.find(c => c.id === modelId);
    return config ? config.label : null;
  };

  // Special "Hero" rendering for the welcome message
  if (message.id === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center py-8 md:py-12 text-center animate-in fade-in duration-700 select-none px-4">
        <div className="bg-medical-900/80 p-4 md:p-6 rounded-2xl border border-medical-700/50 shadow-2xl mb-4 md:mb-6 relative group backdrop-blur-sm">
          <div className="absolute inset-0 bg-medical-accent/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <Activity className="w-8 h-8 md:w-12 md:h-12 text-medical-accent relative z-10" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2 md:mb-3 tracking-tight">ImplantAI <span className="text-medical-accent">CDSS</span></h1>
        <div className="flex items-center gap-2 justify-center mb-4 md:mb-6">
             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-medical-800 border border-medical-700 text-slate-400 uppercase tracking-wider">v2.1 Stable</span>
             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-900/20 border border-green-800/30 text-green-400 uppercase tracking-wider flex items-center gap-1">
               <ShieldCheck className="w-3 h-3" /> Secure
             </span>
        </div>
        <p className="text-slate-400 max-w-lg mx-auto leading-relaxed text-xs md:text-base">
          Clinical Decision Support System initialized. 
          <br className="hidden md:block"/>
          Upload DICOM slices or select a clinical protocol to begin analysis.
        </p>
      </div>
    );
  }

  // Standard Bubble
  return (
    <>
      <div className={`flex w-full mb-4 md:mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
        <div className={`flex max-w-[95%] md:max-w-[85%] lg:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 md:gap-3`}>
          
          {/* Avatar */}
          <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center flex-shrink-0 border shadow-sm
            ${isUser 
              ? 'bg-slate-700 border-slate-600' 
              : isError 
                ? 'bg-red-900/20 border-red-800' 
                : 'bg-medical-800 border-medical-700'}`}>
            {isUser ? (
              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-300" />
            ) : (
              <Bot className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isError ? 'text-red-500' : 'text-medical-accent'}`} />
            )}
          </div>

          {/* Content Bubble */}
          <div className={`flex flex-col relative group min-w-0 overflow-hidden
            ${isUser ? 'items-end' : 'items-start'}`}>
            
            <div className={`rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm border backdrop-blur-sm
              ${isUser 
                ? 'bg-slate-800 border-slate-700 text-slate-100 rounded-tr-sm' 
                : isError
                  ? 'bg-red-950/30 border-red-900/50 text-red-200 rounded-tl-sm'
                  : 'bg-medical-900/60 border-medical-700/50 text-slate-200 rounded-tl-sm'
              }`}>
              
              {/* Images Grid */}
              {message.images && message.images.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {message.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative rounded border border-slate-600 overflow-hidden cursor-zoom-in group/img h-16 w-16 md:h-20 md:w-20 bg-black"
                      onClick={() => setZoomedImage(img)}
                    >
                      <img 
                        src={img} 
                        alt="Clinical Data" 
                        className="h-full w-full object-cover opacity-90 group-hover/img:opacity-100 transition-opacity"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Text Content */}
              <div className={`prose prose-sm max-w-none dark:prose-invert text-xs md:text-sm
                prose-p:leading-relaxed prose-p:my-1.5
                prose-headings:font-semibold prose-headings:text-slate-100 prose-headings:my-2
                prose-strong:text-white prose-strong:font-semibold
                prose-ul:my-2 prose-li:my-0.5
                prose-pre:bg-black/30 prose-pre:border prose-pre:border-slate-700
                `}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
              </div>
            </div>

            <div className={`flex items-center gap-2 mt-1 px-1 opacity-50 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className={`text-[9px] md:text-[10px] font-mono ${isUser ? 'text-slate-400' : 'text-slate-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              
              {/* Model Tag */}
              {!isUser && !isError && message.model && (
                <div className="flex items-center gap-1 text-[9px] font-semibold text-medical-accent/80 bg-medical-800/50 px-1.5 py-0.5 rounded border border-medical-700/50">
                  {getModelIcon(message.model)}
                  <span className="hidden sm:inline">{getModelLabel(message.model)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for images */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm" onClick={() => setZoomedImage(null)}>
          <button 
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-full"
            onClick={() => setZoomedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <img 
            src={zoomedImage} 
            alt="Full screen" 
            className="max-w-[95vw] max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </>
  );
};