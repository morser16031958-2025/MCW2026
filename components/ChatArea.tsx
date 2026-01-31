
import React, { useEffect, useRef } from 'react';
import { Message } from '../types';
import { User, Snowflake, Loader2, PlayCircle, FileText, Music, Info } from 'lucide-react';
import { translations, Language } from '../translations';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  language: Language;
}

const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, language }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 space-y-10 scroll-smooth">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 px-6 text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800/50 animate-bounce">
             <Info className="w-8 h-8 text-blue-500/50" />
          </div>
          <p className="text-lg font-bold text-slate-400 tracking-tight">{t.threadInitialized}</p>
          <p className="text-sm text-slate-600 mt-2 max-w-xs leading-relaxed">{t.threadDescription}</p>
        </div>
      ) : (
        messages.map((msg) => (
          <div key={msg.id} className={`flex gap-5 group ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`
              w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-xl transition-transform duration-500 group-hover:scale-105
              ${msg.role === 'user' 
                ? 'bg-blue-600 text-white ring-4 ring-blue-500/10' 
                : 'bg-slate-800 text-blue-400 border border-slate-700/80 ring-4 ring-slate-700/10'}
            `}>
              {msg.role === 'user' ? <User className="w-6 h-6" /> : <Snowflake className="w-6 h-6" />}
            </div>

            <div className={`flex flex-col max-w-[80%] space-y-2 ${msg.role === 'user' ? 'items-end' : ''}`}>
              <div className={`
                px-6 py-4 rounded-[2rem] text-[15px] leading-[1.6] shadow-2xl relative
                ${msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-none' 
                  : 'bg-slate-900/90 text-slate-200 rounded-tl-none border border-slate-800/80 backdrop-blur-sm'}
              `}>
                {msg.parts.map((part, idx) => {
                  if (part.text) {
                    return <div key={idx} className="whitespace-pre-wrap font-medium">{part.text}</div>;
                  }
                  if (part.inlineData) {
                    const { mimeType } = part.inlineData;
                    const isImg = mimeType.startsWith('image/');
                    const isVideo = mimeType.startsWith('video/');
                    const isAudio = mimeType.startsWith('audio/');

                    return (
                      <div key={idx} className="my-4 rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-inner group/att">
                        {isImg && (
                          <img 
                            src={`data:${mimeType};base64,${part.inlineData.data}`} 
                            alt="attachment" 
                            className="max-h-80 w-auto block object-cover hover:scale-105 transition-transform duration-700" 
                          />
                        )}
                        {isVideo && (
                          <div className="p-6 flex items-center gap-4 text-sm font-bold text-slate-300">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                               <PlayCircle className="w-8 h-8" />
                            </div>
                            <div className="flex flex-col">
                               <span>Video Stream Detected</span>
                               <span className="text-[10px] text-slate-500 uppercase">{mimeType}</span>
                            </div>
                          </div>
                        )}
                        {isAudio && (
                          <div className="p-6 flex items-center gap-4 text-sm font-bold text-slate-300">
                             <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                               <Music className="w-8 h-8" />
                            </div>
                            <div className="flex flex-col">
                               <span>Audio Transcript Context</span>
                               <span className="text-[10px] text-slate-500 uppercase">{mimeType}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
              <div className={`flex items-center gap-2 px-2 opacity-60 hover:opacity-100 transition-opacity ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                 <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
                 <span className="text-[9px] text-slate-700">•</span>
                 <span className="text-[9px] text-slate-500 font-bold italic">{msg.role === 'user' ? t.transmitted : t.generated}</span>
              </div>
            </div>
          </div>
        ))
      )}

      {isLoading && (
        <div className="flex gap-5 animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-blue-400 border border-slate-800 flex items-center justify-center shadow-2xl relative">
            <div className="absolute inset-0 bg-blue-500/10 rounded-2xl animate-ping"></div>
            <Snowflake className="w-6 h-6 animate-spin-slow relative z-10" />
          </div>
          <div className="flex flex-col space-y-3">
            <div className="bg-slate-900/80 border border-slate-800/80 px-6 py-4 rounded-[2rem] rounded-tl-none flex items-center gap-3 shadow-xl backdrop-blur-md">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-blue-400/80">{t.processing}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
