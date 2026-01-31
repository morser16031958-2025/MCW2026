
import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from './hooks/useChatStore';
import { MODELS, DEFAULT_MODEL } from './constants';
import { getUnifiedAIResponse } from './services/aiBridge';
import { Message, Attachment, MessagePart, User, ChatSession } from './types';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import InputArea from './components/InputArea';
import Auth from './components/Auth';
import UserDashboard from './components/UserDashboard';
import { translations, Language } from './translations';
import { AlertCircle, Snowflake, Wallet, ChevronDown, Cpu, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { db } from './services/db';

type AppView = 'landing' | 'auth' | 'dashboard' | 'chat';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('multichat_lang') as Language) || 'ru';
  });

  const t = translations[language];

  const [view, setView] = useState<AppView>(() => {
    const savedUser = sessionStorage.getItem('multichat_current_user');
    return savedUser ? 'dashboard' : 'landing';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem('multichat_current_user');
    try { return saved ? JSON.parse(saved) : null; } catch (e) { return null; }
  });

  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL);
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const hasAutoStarted = useRef(false);
  const modelPickerRef = useRef<HTMLDivElement>(null);

  const {
    chats,
    activeChat,
    createChat,
    deleteChat,
    setActiveChat,
    addMessage,
  } = useChatStore(currentUser?.login);

  useEffect(() => {
    if (view === 'chat' && currentUser?.login) {
      db.getUser(currentUser.login).then(freshUser => {
        if (freshUser) {
          setCurrentUser(freshUser);
          sessionStorage.setItem('multichat_current_user', JSON.stringify(freshUser));
        }
      });
    }
  }, [view, currentUser?.login]);

  useEffect(() => {
    localStorage.setItem('multichat_lang', language);
  }, [language]);

  useEffect(() => {
    if (activeChat) setSelectedModelId(activeChat.modelId);
  }, [activeChat?.id, activeChat?.modelId]);

  useEffect(() => {
    if (view === 'chat' && currentUser && chats.length === 0 && !isLoading && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      startNewChat();
    }
  }, [view, currentUser, chats.length, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(event.target as Node)) {
        setIsModelPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuthSuccess = (user: User) => {
    sessionStorage.setItem('multichat_current_user', JSON.stringify(user));
    setCurrentUser(user);
    setView('dashboard');
    hasAutoStarted.current = false;
  };

  const handleProceedFromDashboard = (updatedUser: User) => {
    sessionStorage.setItem('multichat_current_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setView('chat');
  };

  const handleGlobalLogout = () => {
    sessionStorage.removeItem('multichat_current_user');
    setCurrentUser(null);
    setView('auth');
    hasAutoStarted.current = false;
  };

  const handleSendMessage = async (text: string, attachments: Attachment[], targetChat?: ChatSession) => {
    const chatToUse = targetChat || activeChat;
    if (!chatToUse || !currentUser) return;

    if (currentUser.balance <= 0) {
      setError(language === 'ru' ? "Баланс исчерпан. Пополните лимит." : "Balance exhausted. Please refill.");
      return;
    }

    setError(null);
    const userMessageId = crypto.randomUUID();
    const currentParts: MessagePart[] = [];
    if (text.trim()) currentParts.push({ text: text.trim() });
    
    attachments.forEach(att => {
      currentParts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
    });

    if (currentParts.length === 0) return;

    const userMsg: Message = { id: userMessageId, role: 'user', parts: currentParts, timestamp: Date.now() };
    addMessage(chatToUse.id, userMsg);
    setIsLoading(true);

    try {
      const response = await getUnifiedAIResponse(chatToUse.modelId, chatToUse.messages, currentParts, currentUser.apiKey || "");
      const aiMsg: Message = { id: crypto.randomUUID(), role: 'model', parts: [{ text: response.text }], timestamp: Date.now() };

      const newBalance = Math.max(0, currentUser.balance - response.cost);
      const syncedBalance = await db.updateBalance(currentUser.login, newBalance);

      const updatedUser = { ...currentUser, balance: syncedBalance };
      setCurrentUser(updatedUser);
      sessionStorage.setItem('multichat_current_user', JSON.stringify(updatedUser));
      addMessage(chatToUse.id, aiMsg, response.cost);
    } catch (err: any) {
      setError(err.message || "Ошибка нейросети.");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = async (modelIdOverride?: string) => {
    const mid = modelIdOverride || selectedModelId;
    const newChat = createChat(mid);
    await handleSendMessage(t.hello, [], newChat);
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    setIsModelPickerOpen(false);
    startNewChat(modelId);
  };

  if (view === 'landing') {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
        
        {/* Animated Snow Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
           {[...Array(30)].map((_, i) => (
             <div 
               key={i} 
               className="absolute bg-white rounded-full blur-[1px] animate-fall"
               style={{
                 left: `${Math.random() * 100}%`,
                 top: `-10px`,
                 width: `${Math.random() * 3 + 1}px`,
                 height: `${Math.random() * 3 + 1}px`,
                 animationDuration: `${Math.random() * 12 + 8}s`,
                 animationDelay: `${Math.random() * 5}s`,
               }}
             />
           ))}
        </div>
        
        <div className="relative z-10 flex flex-col items-center animate-in fade-in zoom-in duration-1000">
          <div className="w-40 h-40 bg-blue-600 rounded-[3rem] flex items-center justify-center shadow-[0_0_100px_rgba(37,99,235,0.4)] mb-10 relative group">
            <div className="absolute inset-0 bg-blue-400 rounded-[3rem] animate-pulse opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <Snowflake className="w-20 h-20 text-white animate-spin-slow drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          </div>
          
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase mb-2 drop-shadow-2xl">
            {t.brand}
          </h1>
          <p className="text-blue-400 font-black uppercase tracking-[0.6em] text-[10px] mb-20 opacity-90">
            {t.winterEdition}
          </p>
          
          {/* BUTTON "НАЧИНАЕМ" WITH SNOWFLAKE-THEMED BLUE COLORS */}
          <button 
            onClick={() => setView('auth')}
            className="group relative px-14 py-7 bg-blue-600 rounded-full overflow-hidden transition-all hover:scale-110 active:scale-95 shadow-[0_20px_60px_rgba(37,99,235,0.4)] border border-blue-400/30"
          >
            {/* Animated Gradient Border Beam (Brighter for Blue) */}
            <div className="absolute inset-[-4px] bg-gradient-to-r from-blue-300 via-white to-blue-300 animate-border-beam rounded-full opacity-60"></div>
            
            {/* Blue Background Overlay */}
            <div className="absolute inset-[2px] bg-blue-600 rounded-full z-0"></div>
            
            {/* Shine Sweep Effect */}
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out z-10"></div>

            <div className="relative z-20 flex items-center gap-5">
              <span className="text-white font-black text-xl uppercase tracking-[0.3em] drop-shadow-md">
                {language === 'ru' ? 'НАЧИНАЕМ' : 'START SESSION'}
              </span>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all duration-500 group-hover:rotate-[360deg] shadow-lg">
                <Zap className="w-5 h-5 text-blue-600 fill-blue-600 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </button>

          <div className="mt-28 flex items-center gap-10 opacity-50">
            <div className="flex items-center gap-3">
               <Zap className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Multimodal 3.0</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-500/30"></div>
            <div className="flex items-center gap-3">
               <Cpu className="w-4 h-4 text-blue-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white">Neural Core</span>
            </div>
          </div>
        </div>

        <style>{`
          .animate-spin-slow { animation: spin 20s linear infinite; }
          .animate-border-beam { animation: border-beam 3s linear infinite; background-size: 200% auto; }
          .animate-fall { animation: fall linear infinite; }

          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes border-beam {
            0% { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
          @keyframes fall {
            to { transform: translateY(110vh) rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (view === 'auth' || !currentUser) {
    return <Auth language={language} setLanguage={setLanguage} onAuthSuccess={handleAuthSuccess} />;
  }

  if (view === 'dashboard') {
    return <UserDashboard language={language} user={currentUser} onProceed={handleProceedFromDashboard} onLogout={handleGlobalLogout} />;
  }

  const groupedModels = MODELS.reduce((acc, model) => {
    if (!acc[model.category]) acc[model.category] = [];
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, typeof MODELS>);

  const currentModelName = MODELS.find(m => m.id === selectedModelId)?.name || selectedModelId;

  return (
    <div className="flex h-screen w-full bg-[#020617] overflow-hidden text-slate-100">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      </div>

      <Sidebar 
        chats={chats} 
        activeChatId={activeChat?.id || null} 
        onCreateChat={() => startNewChat()} 
        onDeleteChat={deleteChat} 
        onSelectChat={setActiveChat}
        onShowDashboard={() => setView('dashboard')}
        onLogout={handleGlobalLogout}
        user={currentUser}
        language={language}
        setLanguage={setLanguage}
      />

      <main className="flex-1 flex flex-col relative z-10 bg-slate-950/20 backdrop-blur-[2px]">
        <header className="flex items-center justify-between px-8 py-4 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md relative z-50">
          <div className="flex-1 flex items-center gap-3">
            {activeChat && (
              <div className="flex items-center gap-3 group">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h2 className="text-sm font-black tracking-tight text-slate-300">{activeChat.title}</h2>
              </div>
            )}
          </div>

          <div className="flex-1 flex justify-center">
            <div className="relative" ref={modelPickerRef}>
              <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-2xl border border-white/5">
                <div className="px-4 py-2 bg-slate-900/80 rounded-xl border border-white/5 flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-xs font-black text-slate-200">{currentModelName}</span>
                </div>
                <button 
                  onClick={() => setIsModelPickerOpen(!isModelPickerOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${isModelPickerOpen ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                >
                  {language === 'ru' ? 'Сменить' : 'Change'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isModelPickerOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {isModelPickerOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] shadow-2xl overflow-hidden z-[100]">
                  <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {Object.entries(groupedModels).map(([category, models]) => (
                      <div key={category} className="mb-4">
                        <span className="px-3 mb-2 block text-[9px] font-black text-slate-500 uppercase tracking-widest">{category}</span>
                        {models.map(m => (
                          <button
                            key={m.id}
                            onClick={() => handleModelChange(m.id)}
                            className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${selectedModelId === m.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-slate-800'}`}
                          >
                            <span className={`text-[11px] font-black block ${selectedModelId === m.id ? 'text-blue-400' : 'text-slate-200'}`}>{m.name}</span>
                            <span className="text-[9px] text-slate-500 block leading-tight mt-0.5">{m.description}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-4 px-5 py-2.5 bg-slate-950/50 rounded-2xl border border-white/5">
               <div className="flex flex-col items-end border-r border-white/5 pr-4">
                 <div className="flex items-center gap-2">
                   <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{t.limitLabel}:</span>
                   <span className={`text-[11px] font-black tracking-tighter ${currentUser.balance <= 0.001 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
                     ${currentUser.balance.toFixed(5)}
                   </span>
                 </div>
                 {activeChat && (
                   <div className="flex items-center gap-2 mt-0.5">
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{t.spentLabel}:</span>
                     <span className="text-[10px] font-black tracking-tighter text-emerald-400">
                       ${activeChat.spent.toFixed(5)}
                     </span>
                   </div>
                 )}
               </div>
               <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-blue-400">
                 <Wallet className="w-5 h-5" />
               </div>
            </div>
          </div>
        </header>

        {activeChat ? (
          <>
            {error && (
              <div className="mx-8 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold">
                <AlertCircle className="w-5 h-5" />
                <span className="flex-1">{error}</span>
                <button onClick={() => setError(null)} className="text-[10px] uppercase font-black hover:text-white transition-colors">{t.dismiss}</button>
              </div>
            )}
            <ChatArea language={language} messages={activeChat.messages} isLoading={isLoading} />
            <InputArea language={language} onSend={handleSendMessage} isLoading={isLoading} isOutOfBalance={currentUser.balance <= 0} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
             <button onClick={() => startNewChat()} className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all">
                {t.startNewLink}
             </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
