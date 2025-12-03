
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Maximize2, X, AlertCircle } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.isError;
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <>
      <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
        <div className={`flex max-w-[95%] md:max-w-[85%] lg:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-4`}>
          
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border shadow-lg
            ${isUser 
              ? 'bg-slate-700 border-slate-600' 
              : isError 
                ? 'bg-red-900/20 border-red-800' 
                : 'bg-medical-800 border-medical-700'}`}>
            {isUser ? (
              <User className="w-4 h-4 text-slate-300" />
            ) : (
              <Bot className={`w-4 h-4 ${isError ? 'text-red-500' : 'text-medical-accent'}`} />
            )}
          </div>

          {/* Content Bubble */}
          <div className={`flex flex-col relative group min-w-[200px]
            ${isUser 
              ? 'items-end' 
              : 'items-start'
            }`}>
            
            <div className={`rounded-xl p-5 shadow-xl border backdrop-blur-sm
              ${isUser 
                ? 'bg-slate-800 border-slate-700 text-slate-100 rounded-tr-none' 
                : isError
                  ? 'bg-red-950/30 border-red-900/50 text-red-200 rounded-tl-none'
                  : 'bg-medical-900/80 border-medical-700/50 text-slate-200 rounded-tl-none'
              }`}>
              
              {/* Images Grid - Film strip style */}
              {message.images && message.images.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {message.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className="relative rounded border border-slate-600 overflow-hidden cursor-zoom-in group/img h-24 w-24 bg-black"
                      onClick={() => setZoomedImage(img)}
                    >
                      <img 
                        src={img} 
                        alt="Clinical Data" 
                        className="h-full w-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}

              {/* Text Content */}
              <div className={`prose prose-sm md:prose-base max-w-none dark:prose-invert
                prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-slate-100
                prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2 prose-h2:border-b prose-h2:border-slate-700 prose-h2:pb-1
                prose-h3:text-medical-accent prose-h3:text-base
                prose-p:leading-relaxed prose-p:text-slate-300
                prose-strong:text-white prose-strong:font-semibold
                prose-ul:marker:text-medical-accent
                prose-table:border prose-table:border-slate-700 prose-table:text-sm
                prose-th:bg-slate-800 prose-th:text-slate-200 prose-th:border-slate-700
                prose-td:border-slate-700 prose-td:text-slate-300
                prose-blockquote:border-l-4 prose-blockquote:border-medical-accent prose-blockquote:bg-slate-800/50 prose-blockquote:py-1 prose-blockquote:px-4
                `}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
              </div>
            </div>

            <span className={`text-[10px] mt-1.5 font-mono opacity-50 px-1 ${isUser ? 'text-slate-400' : 'text-slate-500'}`}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Medical Grade Image Viewer (Modal) */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200 backdrop-blur-sm" onClick={() => setZoomedImage(null)}>
          <div className="absolute top-4 left-4 text-white/50 text-xs font-mono">DICOM VIEWER MODE (PREVIEW)</div>
          
          <button 
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setZoomedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>

          <img 
            src={zoomedImage} 
            alt="Full screen" 
            className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl border border-slate-800"
            onClick={(e) => e.stopPropagation()} 
          />
          
          {/* Fake DICOM Overlays for aesthetic */}
          <div className="absolute bottom-8 left-8 text-medical-accent/60 font-mono text-xs hidden md:block">
             WL: 128 / WW: 256<br/>
             ZOOM: 100%
          </div>
        </div>
      )}
    </>
  );
};
